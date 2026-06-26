import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDatabase, logActivity } from '../models/database';
import { AuthRequest } from '../middleware/auth';

interface UserRow { id: number; name: string; email: string; role: string; status: string; avatar: string | null; bio: string | null; created_at: string; updated_at: string; }

export function getMembers(_req: Request, res: Response): void {
  const db = getDatabase();
  const members = db.prepare(
    'SELECT id, name, email, role, status, avatar, bio, created_at, updated_at FROM users ORDER BY role, name'
  ).all() as unknown as UserRow[];
  res.json({ members });
}

export function getMember(req: Request, res: Response): void {
  const db = getDatabase();
  const member = db.prepare(
    'SELECT id, name, email, role, status, avatar, bio, created_at, updated_at FROM users WHERE id = ?'
  ).get(Number(req.params.id)) as unknown as UserRow | undefined;

  if (!member) { res.status(404).json({ error: 'Member not found' }); return; }
  res.json({ member });
}

export async function createMember(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email, password, role, status, avatar, bio } = req.body;
    const db = getDatabase();

    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email as string)) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    const hashed = await bcrypt.hash((password as string) || 'changeme123', 12);
    const result = db.prepare(
      'INSERT INTO users (name, email, password, role, status, avatar, bio) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      name as string, email as string, hashed,
      (role as string) || 'member',
      (status as string) || 'active',
      (avatar as string | null) || null,
      (bio as string | null) || null
    );

    const member = db.prepare(
      'SELECT id, name, email, role, status, avatar, bio, created_at, updated_at FROM users WHERE id = ?'
    ).get(result.lastInsertRowid as number) as unknown as UserRow;

    logActivity(null, req.userId as number, 'member_created', `${name} was added to the team`);
    res.status(201).json({ member });
  } catch {
    res.status(500).json({ error: 'Failed to create member' });
  }
}

export async function updateMember(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDatabase();
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as unknown as UserRow | undefined;
    if (!existing) { res.status(404).json({ error: 'Member not found' }); return; }

    const { name, email, role, status, avatar, bio, password } = req.body;

    if (email && email !== existing.email) {
      if (db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email as string, id)) {
        res.status(409).json({ error: 'Email already in use' });
        return;
      }
    }

    let passwordUpdate = '';
    const params: (string | number | null)[] = [];

    if (password) {
      const hashed = await bcrypt.hash(password as string, 12);
      passwordUpdate = ', password = ?';
      params.push(hashed);
    }

    db.prepare(
      `UPDATE users SET name=?, email=?, role=?, status=?, avatar=?, bio=?${passwordUpdate}, updated_at=datetime('now') WHERE id=?`
    ).run(
      (name as string) || existing.name,
      (email as string) || existing.email,
      (role as string) || existing.role,
      (status as string) || existing.status,
      avatar !== undefined ? (avatar as string | null) : existing.avatar,
      bio !== undefined ? (bio as string | null) : existing.bio,
      ...params,
      id
    );

    const updated = db.prepare(
      'SELECT id, name, email, role, status, avatar, bio, created_at, updated_at FROM users WHERE id = ?'
    ).get(id) as unknown as UserRow;

    logActivity(null, req.userId as number, 'member_updated', `${updated.name}'s profile was updated`);
    res.json({ member: updated });
  } catch {
    res.status(500).json({ error: 'Failed to update member' });
  }
}

export function deleteMember(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const id = Number(req.params.id);
  if (id === req.userId) { res.status(400).json({ error: 'Cannot delete yourself' }); return; }

  const member = db.prepare('SELECT name FROM users WHERE id = ?').get(id) as unknown as { name: string } | undefined;
  if (!member) { res.status(404).json({ error: 'Member not found' }); return; }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  logActivity(null, req.userId as number, 'member_deleted', `${member.name} was removed from the team`);
  res.json({ message: 'Member deleted' });
}

export function getMemberStats(req: Request, res: Response): void {
  const db = getDatabase();
  const id = Number(req.params.id);

  const taskStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
      SUM(CASE WHEN status NOT IN ('completed','closed') AND due_date < date('now') THEN 1 ELSE 0 END) as overdue
    FROM tasks WHERE assigned_to = ?
  `).get(id) as unknown as Record<string, number>;

  res.json({ stats: taskStats });
}
