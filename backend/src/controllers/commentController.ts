import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getDatabase, logActivity } from '../models/database';

interface CommentRow {
  id: number; task_id: number; user_id: number; content: string; created_at: string;
  author_name: string; author_avatar: string | null;
}

export function getComments(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const taskId = Number(req.params.taskId);
  const uid = req.userId as number;
  const role = req.userRole as string;

  const task = db.prepare('SELECT assigned_to FROM tasks WHERE id = ?').get(taskId) as unknown as { assigned_to: number | null } | undefined;
  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
  if (role === 'member' && task.assigned_to !== uid) {
    res.status(403).json({ error: 'Access denied' }); return;
  }

  const comments = db.prepare(`
    SELECT c.*, u.name as author_name, u.avatar as author_avatar
    FROM comments c JOIN users u ON c.user_id = u.id
    WHERE c.task_id = ? ORDER BY c.created_at ASC
  `).all(taskId) as unknown as CommentRow[];

  res.json({ comments });
}

export function addComment(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const taskId = Number(req.params.taskId);
  const uid = req.userId as number;
  const role = req.userRole as string;
  const { content } = req.body;

  const task = db.prepare('SELECT assigned_to, title FROM tasks WHERE id = ?').get(taskId) as unknown as { assigned_to: number | null; title: string } | undefined;
  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
  if (role === 'member' && task.assigned_to !== uid) {
    res.status(403).json({ error: 'Access denied' }); return;
  }

  const result = db.prepare(
    'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)'
  ).run(taskId, uid, content as string);

  const comment = db.prepare(`
    SELECT c.*, u.name as author_name, u.avatar as author_avatar
    FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?
  `).get(result.lastInsertRowid as number) as unknown as CommentRow;

  logActivity(taskId, uid, 'comment_added', `Comment added on "${task.title}"`);
  res.status(201).json({ comment });
}

export function deleteComment(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const uid = req.userId as number;
  const role = req.userRole as string;
  const { id } = req.params;

  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(Number(id)) as unknown as CommentRow | undefined;
  if (!comment) { res.status(404).json({ error: 'Comment not found' }); return; }

  if (role === 'member' && comment.user_id !== uid) {
    res.status(403).json({ error: 'Can only delete your own comments' }); return;
  }

  db.prepare('DELETE FROM comments WHERE id = ?').run(Number(id));
  res.json({ message: 'Comment deleted' });
}
