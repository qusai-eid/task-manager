import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getDatabase } from '../models/database';

interface ActivityRow {
  id: number; task_id: number | null; user_id: number; action: string; details: string | null; created_at: string;
  user_name: string; user_avatar: string | null; task_title: string | null;
}

export function getActivity(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const limit = Math.min(Number(req.query.limit) || 50, 100);

  const logs = db.prepare(`
    SELECT al.*, u.name as user_name, u.avatar as user_avatar, t.title as task_title
    FROM activity_logs al
    JOIN users u ON al.user_id = u.id
    LEFT JOIN tasks t ON al.task_id = t.id
    ORDER BY al.created_at DESC LIMIT ?
  `).all(limit) as unknown as ActivityRow[];

  res.json({ logs });
}

export function getTaskActivity(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const taskId = Number(req.params.taskId);
  const uid = req.userId as number;
  const role = req.userRole as string;

  const task = db.prepare('SELECT assigned_to FROM tasks WHERE id = ?').get(taskId) as unknown as { assigned_to: number | null } | undefined;
  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
  if (role === 'member' && task.assigned_to !== uid) {
    res.status(403).json({ error: 'Access denied' }); return;
  }

  const logs = db.prepare(`
    SELECT al.*, u.name as user_name, u.avatar as user_avatar, t.title as task_title
    FROM activity_logs al
    JOIN users u ON al.user_id = u.id
    LEFT JOIN tasks t ON al.task_id = t.id
    WHERE al.task_id = ?
    ORDER BY al.created_at ASC
  `).all(taskId) as unknown as ActivityRow[];

  res.json({ logs });
}
