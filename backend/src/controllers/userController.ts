import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';
import { getDatabase } from '../models/database';

interface UserRow { id: number; name: string; email: string; password: string; role: string; status: string; avatar: string | null; bio: string | null; created_at: string; updated_at: string; }

const ALLOWED_MIME_PREFIXES = ['data:image/jpeg;', 'data:image/jpg;', 'data:image/png;', 'data:image/webp;'];
const MAX_BASE64_LEN = 7_000_000; // ≈ 5 MB binary

function validateAvatarPayload(avatar: unknown): string | null {
  if (avatar === null || avatar === undefined) return null;
  if (typeof avatar !== 'string') return 'Avatar must be a string or null';
  if (!avatar.startsWith('data:')) return null;
  if (!ALLOWED_MIME_PREFIXES.some(p => avatar.startsWith(p))) {
    return 'Supported formats: JPG, PNG, WebP';
  }
  const b64 = avatar.split(',')[1] ?? '';
  if (b64.length > MAX_BASE64_LEN) return 'Image must be under 5 MB';
  return null;
}

export function getProfile(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const user = db.prepare(
    'SELECT id, name, email, role, status, avatar, bio, created_at, updated_at FROM users WHERE id = ?'
  ).get(req.userId as number) as unknown as Omit<UserRow, 'password'> | undefined;

  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ user });
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, bio, avatar, currentPassword, newPassword } = req.body;
    const db = getDatabase();
    const uid = req.userId as number;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(uid) as unknown as UserRow | undefined;
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    if (avatar !== undefined) {
      const avatarError = validateAvatarPayload(avatar);
      if (avatarError) { res.status(400).json({ error: avatarError }); return; }
    }

    if (newPassword) {
      if (!currentPassword) { res.status(400).json({ error: 'Current password required' }); return; }
      const valid = await bcrypt.compare(currentPassword as string, user.password);
      if (!valid) { res.status(401).json({ error: 'Current password is incorrect' }); return; }
      const hashed = await bcrypt.hash(newPassword as string, 12);
      db.prepare("UPDATE users SET password=?, updated_at=datetime('now') WHERE id=?").run(hashed, uid);
    }

    db.prepare("UPDATE users SET name=?, bio=?, avatar=?, updated_at=datetime('now') WHERE id=?").run(
      (name as string) || user.name,
      bio !== undefined ? (bio as string | null) : user.bio,
      avatar !== undefined ? (avatar as string | null) : user.avatar,
      uid
    );

    const updated = db.prepare(
      'SELECT id, name, email, role, status, avatar, bio, created_at, updated_at FROM users WHERE id = ?'
    ).get(uid) as unknown as Omit<UserRow, 'password'>;

    res.json({ user: updated });
  } catch {
    res.status(500).json({ error: 'Update failed' });
  }
}
