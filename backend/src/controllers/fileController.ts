import path from 'path';
import fs   from 'fs';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getDatabase, logActivity } from '../models/database';
import { UPLOAD_DIR } from '../middleware/upload';

interface FileRow {
  id: number; task_id: number; original_name: string; stored_name: string;
  mime_type: string; file_size: number; version_major: number; version_minor: number;
  stage: string; change_notes: string | null; uploaded_by: number; created_at: string;
  uploader_name: string; uploader_avatar: string | null;
}

interface VersionRow { version_major: number; version_minor: number; }

const FILE_SELECT = `
  SELECT tf.*, u.name AS uploader_name, u.avatar AS uploader_avatar
  FROM task_files tf JOIN users u ON tf.uploaded_by = u.id
`;

function taskAccess(taskId: number, uid: number, role: string) {
  const db = getDatabase();
  const task = db.prepare('SELECT id, status, assigned_to FROM tasks WHERE id = ?')
    .get(taskId) as { id: number; status: string; assigned_to: number | null } | undefined;
  if (!task) return null;
  if (role === 'member' && task.assigned_to !== uid) return 'forbidden';
  return task;
}

/* ── List all versions for a task ───────────────────────── */
export function listFiles(req: AuthRequest, res: Response): void {
  const taskId = Number(req.params.id);
  const access = taskAccess(taskId, req.userId!, req.userRole!);
  if (!access) { res.status(404).json({ error: 'Task not found' }); return; }
  if (access === 'forbidden') { res.status(403).json({ error: 'Access denied' }); return; }

  const files = getDatabase().prepare(
    `${FILE_SELECT} WHERE tf.task_id = ?
     ORDER BY tf.version_major DESC, tf.version_minor DESC, tf.created_at DESC`
  ).all(taskId) as unknown as FileRow[];

  res.json({ files });
}

/* ── Upload a new file version ──────────────────────────── */
export function uploadFile(req: AuthRequest, res: Response): void {
  if (!req.file) { res.status(400).json({ error: 'No file provided' }); return; }

  const taskId = Number(req.params.id);
  const uid    = req.userId!;
  const role   = req.userRole!;

  const access = taskAccess(taskId, uid, role);
  if (!access) {
    fs.unlink(req.file.path, () => {});
    res.status(404).json({ error: 'Task not found' }); return;
  }
  if (access === 'forbidden') {
    fs.unlink(req.file.path, () => {});
    res.status(403).json({ error: 'Access denied' }); return;
  }

  const db = getDatabase();
  const { change_notes, bump_major } = req.body as { change_notes?: string; bump_major?: string };

  // Determine next version number
  const latest = db.prepare(
    'SELECT version_major, version_minor FROM task_files WHERE task_id = ? ORDER BY version_major DESC, version_minor DESC LIMIT 1'
  ).get(taskId) as VersionRow | undefined;

  let major = 1, minor = 0;
  if (latest) {
    if (bump_major === 'true') {
      major = latest.version_major + 1;
      minor = 0;
    } else {
      major = latest.version_major;
      minor = latest.version_minor + 1;
    }
  }

  const result = db.prepare(
    `INSERT INTO task_files
     (task_id, original_name, stored_name, mime_type, file_size, version_major, version_minor, stage, change_notes, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    taskId, req.file.originalname, req.file.filename,
    req.file.mimetype, req.file.size,
    major, minor, (access as { status: string }).status,
    change_notes?.trim() || null, uid
  );

  const file = db.prepare(`${FILE_SELECT} WHERE tf.id = ?`)
    .get(result.lastInsertRowid) as unknown as FileRow;

  logActivity(taskId, uid, 'file_uploaded',
    `"${req.file.originalname}" uploaded as v${major}.${minor}${change_notes ? ` — ${change_notes.trim()}` : ''}`);

  res.status(201).json({ file });
}

/* ── Serve a file (download or inline preview) ──────────── */
export function serveFile(req: AuthRequest, res: Response): void {
  const taskId = Number(req.params.id);
  const fileId = Number(req.params.fileId);
  const uid    = req.userId!;
  const role   = req.userRole!;

  const access = taskAccess(taskId, uid, role);
  if (!access) { res.status(404).json({ error: 'Task not found' }); return; }
  if (access === 'forbidden') { res.status(403).json({ error: 'Access denied' }); return; }

  const file = getDatabase()
    .prepare('SELECT * FROM task_files WHERE id = ? AND task_id = ?')
    .get(fileId, taskId) as FileRow | undefined;
  if (!file) { res.status(404).json({ error: 'File not found' }); return; }

  const filePath = path.join(UPLOAD_DIR, file.stored_name);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'File missing from storage' }); return;
  }

  const inline = req.query.preview === 'true';
  res.setHeader('Content-Type', file.mime_type);
  res.setHeader(
    'Content-Disposition',
    `${inline ? 'inline' : 'attachment'}; filename="${encodeURIComponent(file.original_name)}"`
  );
  res.setHeader('Content-Length', file.file_size);
  res.setHeader('Cache-Control', 'private, max-age=3600');
  fs.createReadStream(filePath).pipe(res);
}

/* ── Delete a file version (admin / manager only) ───────── */
export function deleteFile(req: AuthRequest, res: Response): void {
  const taskId = Number(req.params.id);
  const fileId = Number(req.params.fileId);
  const uid    = req.userId!;
  const db     = getDatabase();

  const file = db.prepare('SELECT * FROM task_files WHERE id = ? AND task_id = ?')
    .get(fileId, taskId) as FileRow | undefined;
  if (!file) { res.status(404).json({ error: 'File not found' }); return; }

  const filePath = path.join(UPLOAD_DIR, file.stored_name);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.prepare('DELETE FROM task_files WHERE id = ?').run(fileId);
  logActivity(taskId, uid, 'file_deleted',
    `"${file.original_name}" v${file.version_major}.${file.version_minor} removed`);

  res.json({ message: 'File deleted' });
}
