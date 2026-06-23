import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';
import { getDatabase } from '../models/database';

interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  avatar: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export function getProfile(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const user = db.prepare(
    'SELECT id, name, email, avatar, bio, created_at, updated_at FROM users WHERE id = ?'
  ).get(req.userId as number) as unknown as Omit<UserRow, 'password'> | undefined;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, bio, avatar, currentPassword, newPassword } = req.body;
    const db = getDatabase();
    const uid = req.userId as number;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(uid) as unknown as UserRow | undefined;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: 'Current password required to set new password' });
        return;
      }
      const valid = await bcrypt.compare(currentPassword as string, user.password);
      if (!valid) {
        res.status(401).json({ error: 'Current password is incorrect' });
        return;
      }
      const hashed = await bcrypt.hash(newPassword as string, 12);
      db.prepare("UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?").run(hashed, uid);
    }

    db.prepare(
      "UPDATE users SET name = ?, bio = ?, avatar = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(
      (name as string) || user.name,
      bio !== undefined ? (bio as string | null) : user.bio,
      avatar !== undefined ? (avatar as string | null) : user.avatar,
      uid
    );

    const updated = db.prepare(
      'SELECT id, name, email, avatar, bio, created_at, updated_at FROM users WHERE id = ?'
    ).get(uid) as unknown as Omit<UserRow, 'password'>;

    res.json({ user: updated });
  } catch {
    res.status(500).json({ error: 'Update failed' });
  }
}
