import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getDatabase } from '../models/database';

interface TaskRow {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  tags: string;
  created_at: string;
  updated_at: string;
}

function parseTask(task: TaskRow) {
  return { ...task, tags: JSON.parse(task.tags || '[]') as string[] };
}

export function getTasks(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const uid = req.userId as number;
  const { status, priority, search, sort = 'created_at', order = 'desc' } = req.query;

  const conditions: string[] = ['user_id = ?'];
  const params: (string | number)[] = [uid];

  if (status) { conditions.push('status = ?'); params.push(status as string); }
  if (priority) { conditions.push('priority = ?'); params.push(priority as string); }
  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const validSorts = ['created_at', 'updated_at', 'due_date', 'title', 'priority'];
  const sortCol = validSorts.includes(sort as string) ? sort : 'created_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  const sql = `SELECT * FROM tasks WHERE ${conditions.join(' AND ')} ORDER BY ${sortCol} ${sortOrder}`;
  const stmt = db.prepare(sql);
  const tasks = (stmt.all(...(params as Parameters<typeof stmt.all>)) as unknown as TaskRow[]).map(parseTask);

  res.json({ tasks });
}

export function getTask(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
    .get(Number(req.params.id), req.userId as number) as unknown as TaskRow | undefined;
  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
  res.json({ task: parseTask(task) });
}

export function createTask(req: AuthRequest, res: Response): void {
  const { title, description, status, priority, due_date, tags } = req.body;
  const db = getDatabase();

  const result = db.prepare(
    `INSERT INTO tasks (user_id, title, description, status, priority, due_date, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    req.userId as number,
    title as string,
    (description as string | null) || null,
    (status as string) || 'todo',
    (priority as string) || 'medium',
    (due_date as string | null) || null,
    JSON.stringify((tags as string[]) || [])
  );

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?')
    .get(result.lastInsertRowid as number) as unknown as TaskRow;
  res.status(201).json({ task: parseTask(task) });
}

export function updateTask(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const uid = req.userId as number;
  const taskId = Number(req.params.id);

  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
    .get(taskId, uid) as unknown as TaskRow | undefined;
  if (!existing) { res.status(404).json({ error: 'Task not found' }); return; }

  const { title, description, status, priority, due_date, tags } = req.body;

  db.prepare(
    `UPDATE tasks SET title=?, description=?, status=?, priority=?, due_date=?, tags=?,
     updated_at=datetime('now') WHERE id=? AND user_id=?`
  ).run(
    (title as string) ?? existing.title,
    description !== undefined ? (description as string | null) : existing.description,
    (status as string) ?? existing.status,
    (priority as string) ?? existing.priority,
    due_date !== undefined ? (due_date as string | null) : existing.due_date,
    JSON.stringify(tags ?? JSON.parse(existing.tags || '[]')),
    taskId,
    uid
  );

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?')
    .get(taskId) as unknown as TaskRow;
  res.json({ task: parseTask(updated) });
}

export function deleteTask(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?')
    .run(Number(req.params.id), req.userId as number);
  if (result.changes === 0) { res.status(404).json({ error: 'Task not found' }); return; }
  res.json({ message: 'Task deleted' });
}

export function getAnalytics(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const uid = req.userId as number;

  const total = (db.prepare('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?').get(uid) as unknown as { count: number }).count;

  const byStatus = db.prepare(
    'SELECT status, COUNT(*) as count FROM tasks WHERE user_id = ? GROUP BY status'
  ).all(uid) as unknown as { status: string; count: number }[];

  const byPriority = db.prepare(
    'SELECT priority, COUNT(*) as count FROM tasks WHERE user_id = ? GROUP BY priority'
  ).all(uid) as unknown as { priority: string; count: number }[];

  const overdue = (db.prepare(
    `SELECT COUNT(*) as count FROM tasks WHERE user_id=? AND due_date < date('now') AND status != 'done'`
  ).get(uid) as unknown as { count: number }).count;

  const recentActivity = db.prepare(
    `SELECT DATE(created_at) as date, COUNT(*) as created
     FROM tasks WHERE user_id=? AND created_at >= date('now', '-7 days')
     GROUP BY DATE(created_at) ORDER BY date ASC`
  ).all(uid) as unknown as { date: string; created: number }[];

  const statusMap = Object.fromEntries(byStatus.map(r => [r.status, r.count]));
  const priorityMap = Object.fromEntries(byPriority.map(r => [r.priority, r.count]));

  res.json({
    analytics: {
      total,
      todo: statusMap['todo'] || 0,
      in_progress: statusMap['in_progress'] || 0,
      done: statusMap['done'] || 0,
      overdue,
      low: priorityMap['low'] || 0,
      medium: priorityMap['medium'] || 0,
      high: priorityMap['high'] || 0,
      recentActivity,
    }
  });
}
