import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase, logActivity } from '../models/database';

interface UserRow { id: number; name: string; email: string; password: string; role: string; status: string; avatar: string | null; bio: string | null; created_at: string; }

function generateToken(userId: number, role: string): string {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  return jwt.sign({ userId, role }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions);
}

function sanitizeUser(user: UserRow) {
  const { password: _, ...rest } = user;
  return rest;
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;
    const db = getDatabase();

    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email as string)) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const hashed = await bcrypt.hash(password as string, 12);
    const result = db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    ).run(name as string, email as string, hashed, 'member');

    const user = db.prepare('SELECT * FROM users WHERE id = ?')
      .get(result.lastInsertRowid as number) as unknown as UserRow;

    logActivity(null, user.id, 'user_registered', `${user.name} joined the team`);
    res.status(201).json({ token: generateToken(user.id, user.role), user: sanitizeUser(user) });
  } catch {
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const db = getDatabase();

    const user = db.prepare('SELECT * FROM users WHERE email = ?')
      .get(email as string) as unknown as UserRow | undefined;

    if (!user || !(await bcrypt.compare(password as string, user.password))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (user.status === 'inactive') {
      res.status(403).json({ error: 'Account is inactive. Contact your administrator.' });
      return;
    }

    res.json({ token: generateToken(user.id, user.role), user: sanitizeUser(user) });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
}
