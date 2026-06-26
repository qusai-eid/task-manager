import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getDatabase, logActivity, createNotification } from '../models/database';

interface TaskRow {
  id: number; title: string; description: string | null; status: string; priority: string;
  due_date: string | null; tags: string; created_by: number; assigned_to: number | null;
  created_at: string; updated_at: string;
}

interface TaskFull extends TaskRow {
  creator_name: string; creator_avatar: string | null;
  assignee_name: string | null; assignee_avatar: string | null; assignee_email: string | null;
}

const FULL_SELECT = `
  SELECT t.*,
    uc.name as creator_name, uc.avatar as creator_avatar,
    ua.name as assignee_name, ua.avatar as assignee_avatar, ua.email as assignee_email
  FROM tasks t
  JOIN users uc ON t.created_by = uc.id
  LEFT JOIN users ua ON t.assigned_to = ua.id
`;

function parseTask(t: TaskFull) {
  return { ...t, tags: JSON.parse(t.tags || '[]') as string[] };
}

const STATUS_ORDER = [
  'new_request', 'under_review', 'concept_design', 'structural_design',
  'shop_drawings', 'internal_review', 'client_review', 'revisions',
  'approved', 'issued',
];

// Statuses that require admin or manager to enter
const MANAGER_ONLY_STATUSES = new Set(['approved', 'issued']);

function canTransition(from: string, to: string, role: string): boolean {
  if (!STATUS_ORDER.includes(from) || !STATUS_ORDER.includes(to)) return false;
  if (MANAGER_ONLY_STATUSES.has(to)) return ['admin', 'manager'].includes(role);
  const fi = STATUS_ORDER.indexOf(from);
  const ti = STATUS_ORDER.indexOf(to);
  return Math.abs(ti - fi) <= 2 || ['admin', 'manager'].includes(role);
}

export function getTasks(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const uid = req.userId as number;
  const role = req.userRole as string;
  const { status, priority, search, assigned_to, sort = 'created_at', order = 'desc' } = req.query;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (role === 'member') {
    conditions.push('t.assigned_to = ?');
    params.push(uid);
  }
  if (status) { conditions.push('t.status = ?'); params.push(status as string); }
  if (priority) { conditions.push('t.priority = ?'); params.push(priority as string); }
  if (assigned_to) { conditions.push('t.assigned_to = ?'); params.push(Number(assigned_to)); }
  if (search) {
    conditions.push('(t.title LIKE ? OR t.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const validSorts = ['created_at', 'updated_at', 'due_date', 'title', 'priority', 'status'];
  const sortCol = validSorts.includes(sort as string) ? `t.${sort}` : 't.created_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  const sql = `${FULL_SELECT} ${where} ORDER BY ${sortCol} ${sortOrder}`;
  const stmt = db.prepare(sql);
  const tasks = (stmt.all(...(params as any)) as unknown as TaskFull[]).map(parseTask);
  res.json({ tasks });
}

export function getTask(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const uid = req.userId as number;
  const role = req.userRole as string;

  const task = db.prepare(`${FULL_SELECT} WHERE t.id = ?`)
    .get(Number(req.params.id)) as unknown as TaskFull | undefined;

  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
  if (role === 'member' && task.assigned_to !== uid) {
    res.status(403).json({ error: 'Access denied' }); return;
  }
  res.json({ task: parseTask(task) });
}

export function createTask(req: AuthRequest, res: Response): void {
  const { title, description, priority, due_date, tags, assigned_to } = req.body;
  const db = getDatabase();
  const uid = req.userId as number;

  const result = db.prepare(
    `INSERT INTO tasks (title, description, status, priority, due_date, tags, created_by, assigned_to)
     VALUES (?, ?, 'new_request', ?, ?, ?, ?, ?)`
  ).run(
    title as string,
    (description as string | null) || null,
    (priority as string) || 'medium',
    (due_date as string | null) || null,
    JSON.stringify((tags as string[]) || []),
    uid,
    assigned_to ? Number(assigned_to) : null
  );

  const taskId = result.lastInsertRowid as number;
  const task = db.prepare(`${FULL_SELECT} WHERE t.id = ?`).get(taskId) as unknown as TaskFull;

  logActivity(taskId, uid, 'task_created', `Task "${title}" was created`);

  if (assigned_to) {
    const assigneeId = Number(assigned_to);
    logActivity(taskId, uid, 'task_assigned', `Task assigned to ${task.assignee_name}`);
    createNotification(assigneeId, 'New Task Assigned', `You have been assigned: "${title}"`, 'info', taskId);

    const admins = db.prepare("SELECT id FROM users WHERE role IN ('admin','manager') AND id != ?").all(uid) as unknown as { id: number }[];
    for (const a of admins) {
      createNotification(a.id, 'Task Created & Assigned', `"${title}" was assigned to ${task.assignee_name}`, 'info', taskId);
    }
  }

  res.status(201).json({ task: parseTask(task) });
}

export function updateTask(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const uid = req.userId as number;
  const role = req.userRole as string;
  const taskId = Number(req.params.id);

  const existing = db.prepare(`${FULL_SELECT} WHERE t.id = ?`).get(taskId) as unknown as TaskFull | undefined;
  if (!existing) { res.status(404).json({ error: 'Task not found' }); return; }

  if (role === 'member' && existing.assigned_to !== uid) {
    res.status(403).json({ error: 'Access denied' }); return;
  }

  // Members may only update `status` — all other fields are admin/manager only
  if (role === 'member') {
    const DETAIL_FIELDS = ['title', 'description', 'priority', 'due_date', 'tags', 'assigned_to'];
    if (DETAIL_FIELDS.some(f => req.body[f] !== undefined)) {
      res.status(403).json({ error: 'Only admins and managers can edit task details' });
      return;
    }
  }

  const { title, description, priority, due_date, tags, assigned_to, status } = req.body;

  if (status && status !== existing.status) {
    if (!canTransition(existing.status, status as string, role)) {
      res.status(403).json({ error: `Cannot move task from ${existing.status} to ${status}` });
      return;
    }
  }

  const newAssignedTo = assigned_to !== undefined ? (assigned_to ? Number(assigned_to) : null) : existing.assigned_to;

  db.prepare(
    `UPDATE tasks SET title=?,description=?,priority=?,due_date=?,tags=?,assigned_to=?,status=?,
     updated_at=datetime('now') WHERE id=?`
  ).run(
    (title as string) ?? existing.title,
    description !== undefined ? (description as string | null) : existing.description,
    (priority as string) ?? existing.priority,
    due_date !== undefined ? (due_date as string | null) : existing.due_date,
    JSON.stringify(tags ?? JSON.parse(existing.tags || '[]')),
    newAssignedTo,
    (status as string) ?? existing.status,
    taskId
  );

  const updated = db.prepare(`${FULL_SELECT} WHERE t.id = ?`).get(taskId) as unknown as TaskFull;

  if (status && status !== existing.status) {
    logActivity(taskId, uid, 'status_changed', `Status changed from ${existing.status} to ${status}`);

    const admins = db.prepare("SELECT id FROM users WHERE role IN ('admin','manager')").all() as unknown as { id: number }[];
    const label = (status as string).replace('_', ' ');
    for (const a of admins) {
      if (a.id !== uid) {
        createNotification(a.id, 'Task Status Updated', `"${updated.title}" is now ${label}`, 'info', taskId);
      }
    }

    if (status === 'approved') {
      for (const a of admins) {
        createNotification(a.id, 'Design Approved', `"${updated.title}" has been approved for production`, 'success', taskId);
      }
      logActivity(taskId, uid, 'task_completed', `"${updated.title}" approved for production`);
    }
    if (status === 'issued') {
      for (const a of admins) {
        createNotification(a.id, 'Issued to Factory', `"${updated.title}" has been issued to the factory`, 'success', taskId);
      }
    }
  }

  if (assigned_to !== undefined && Number(assigned_to) !== existing.assigned_to) {
    logActivity(taskId, uid, 'task_assigned', `Task reassigned to ${updated.assignee_name || 'unassigned'}`);
    if (assigned_to) {
      createNotification(Number(assigned_to), 'Task Assigned', `You have been assigned: "${updated.title}"`, 'info', taskId);
    }
  }

  res.json({ task: parseTask(updated) });
}

export function deleteTask(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const uid = req.userId as number;
  const taskId = Number(req.params.id);

  const task = db.prepare('SELECT title FROM tasks WHERE id = ?').get(taskId) as unknown as { title: string } | undefined;
  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
  logActivity(null, uid, 'task_deleted', `Task "${task.title}" was deleted`);
  res.json({ message: 'Task deleted' });
}

export function getKanban(req: AuthRequest, res: Response): void {
  const db = getDatabase();
  const uid = req.userId as number;
  const role = req.userRole as string;

  const where = role === 'member' ? 'WHERE t.assigned_to = ?' : '';
  const params = role === 'member' ? [uid] : [];

  const sql = `${FULL_SELECT} ${where} ORDER BY t.created_at DESC`;
  const stmt = db.prepare(sql);
  const all = (stmt.all(...(params as any)) as unknown as TaskFull[]).map(parseTask);

  const board = STATUS_ORDER.reduce((acc, s) => ({ ...acc, [s]: all.filter(t => t.status === s) }), {} as Record<string, ReturnType<typeof parseTask>[]>);
  res.json({ board });
}

export function getAnalytics(req: AuthRequest, res: Response): void {
  const db = getDatabase();

  const total = (db.prepare('SELECT COUNT(*) as n FROM tasks').get() as unknown as { n: number }).n;
  const byStatus = db.prepare('SELECT status, COUNT(*) as count FROM tasks GROUP BY status').all() as unknown as { status: string; count: number }[];
  const byPriority = db.prepare('SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority').all() as unknown as { priority: string; count: number }[];
  const overdue = (db.prepare(`SELECT COUNT(*) as n FROM tasks WHERE due_date < date('now') AND status NOT IN ('approved','issued')`).get() as unknown as { n: number }).n;
  const totalMembers = (db.prepare("SELECT COUNT(*) as n FROM users").get() as unknown as { n: number }).n;

  const byMember = db.prepare(`
    SELECT u.name, u.avatar,
      COUNT(t.id) as total,
      SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM users u LEFT JOIN tasks t ON t.assigned_to = u.id
    GROUP BY u.id ORDER BY total DESC LIMIT 10
  `).all() as unknown as { name: string; avatar: string | null; total: number; completed: number }[];

  const weeklyCompletion = db.prepare(`
    SELECT DATE(updated_at) as date, COUNT(*) as completed
    FROM tasks WHERE status IN ('approved','issued') AND updated_at >= date('now', '-7 days')
    GROUP BY DATE(updated_at) ORDER BY date ASC
  `).all() as unknown as { date: string; completed: number }[];

  const statusMap = Object.fromEntries(byStatus.map(r => [r.status, r.count]));
  const priorityMap = Object.fromEntries(byPriority.map(r => [r.priority, r.count]));
  const sumStatuses = (...keys: string[]) => keys.reduce((s, k) => s + (statusMap[k] || 0), 0);

  res.json({
    analytics: {
      total, overdue, totalMembers,
      // Mapped to existing dashboard field names for backwards compatibility:
      // todo        → new_request (awaiting triage)
      // in_progress → active design stages + revisions
      // review      → any review gate
      // completed   → approved for production
      // closed      → issued to factory
      todo:        sumStatuses('new_request'),
      in_progress: sumStatuses('concept_design', 'structural_design', 'shop_drawings', 'revisions'),
      review:      sumStatuses('under_review', 'internal_review', 'client_review'),
      completed:   sumStatuses('approved'),
      closed:      sumStatuses('issued'),
      low: priorityMap['low'] || 0,
      medium: priorityMap['medium'] || 0,
      high: priorityMap['high'] || 0,
      urgent: priorityMap['urgent'] || 0,
      byMember,
      weeklyCompletion,
    }
  });
}
