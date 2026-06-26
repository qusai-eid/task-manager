import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getDatabase } from '../models/database';

export function getNotifications(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const uid = req.userId as number;

  const notifications = db.prepare(
    `SELECT n.*, t.title as task_title FROM notifications n
     LEFT JOIN tasks t ON n.task_id = t.id
     WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 50`
  ).all(uid) as unknown as object[];

  const unreadCount = (db.prepare(
    'SELECT COUNT(*) as n FROM notifications WHERE user_id = ? AND read = 0'
  ).get(uid) as unknown as { n: number }).n;

  res.json({ notifications, unreadCount });
}

export function markRead(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const uid = req.userId as number;
  db.prepare(
    "UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?"
  ).run(Number(req.params.id), uid);
  res.json({ message: 'Marked as read' });
}

export function markAllRead(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  db.prepare("UPDATE notifications SET read = 1 WHERE user_id = ?").run(req.userId as number);
  res.json({ message: 'All notifications marked as read' });
}
