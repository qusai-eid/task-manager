import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../models/database';

interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  avatar: string | null;
  bio: string | null;
  created_at: string;
}

function generateToken(userId: number): string {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ userId }, secret, { expiresIn } as jwt.SignOptions);
}

function sanitizeUser(user: UserRow) {
  const { password: _, ...sanitized } = user;
  return sanitized;
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;
    const db = getDatabase();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email as string);
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const hashed = await bcrypt.hash(password as string, 12);
    const result = db.prepare(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
    ).run(name as string, email as string, hashed);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid as number) as unknown as UserRow;
    const token = generateToken(user.id);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch {
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const db = getDatabase();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email as string) as unknown as UserRow | undefined;
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password as string, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id);
    res.json({ token, user: sanitizeUser(user) });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
}
