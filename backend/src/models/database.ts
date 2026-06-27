import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// Allow overriding the DB location via env var; default to ../../data/tasks.db
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/tasks.db');
let db: DatabaseSync;

export function getDatabase(): DatabaseSync {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new DatabaseSync(DB_PATH);
    // NOTE: no WAL mode — WAL's shared-memory files (.db-shm/.db-wal) can fail
    // on container overlay filesystems (Railway) and crash the native binding.
    db.exec('PRAGMA foreign_keys=ON;');
    runMigrations();
  }
  return db;
}

/**
 * Eagerly opens + seeds the database at startup so any failure is visible in
 * the deploy logs (instead of crashing on the first request) and so the
 * demo accounts exist before the first login attempt.
 */
export function initializeDatabase(): void {
  const database = getDatabase();
  const count = (database.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number }).n;
  console.log(`[db] ready at ${DB_PATH} — ${count} users seeded`);
}

function tableExists(name: string): boolean {
  const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(name) as any;
  return !!row;
}

function columnExists(table: string, column: string): boolean {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
  return rows.some((r: any) => r.name === column);
}

function runMigrations() {
  const isV1 = tableExists('tasks') && !columnExists('tasks', 'created_by');
  const needsV2 = !tableExists('activity_logs') || isV1;

  if (needsV2) {
    db.exec(`
      DROP TABLE IF EXISTS task_files;
      DROP TABLE IF EXISTS comments;
      DROP TABLE IF EXISTS notifications;
      DROP TABLE IF EXISTS activity_logs;
      DROP TABLE IF EXISTS tasks;
      DROP TABLE IF EXISTS users;
    `);
    createSchema();
    seedDatabase();
    return;
  }

  // V3: migrate from 5-status software workflow to 10-status precast design workflow
  const taskSql: string = (db.prepare(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='tasks'"
  ).get() as any)?.sql ?? '';
  const needsV3 = tableExists('tasks') && taskSql.includes("'todo'");

  if (needsV3) {
    db.exec(`
      DROP TABLE IF EXISTS task_files;
      DROP TABLE IF EXISTS comments;
      DROP TABLE IF EXISTS notifications;
      DROP TABLE IF EXISTS activity_logs;
      DROP TABLE IF EXISTS tasks;
      DROP TABLE IF EXISTS users;
    `);
    createSchema();
    seedDatabase();
    return;
  }

  // V4: add task_files to existing databases that predate the file feature
  if (!tableExists('task_files')) {
    db.exec(`
      CREATE TABLE task_files (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id       INTEGER NOT NULL,
        original_name TEXT    NOT NULL,
        stored_name   TEXT    NOT NULL,
        mime_type     TEXT    NOT NULL,
        file_size     INTEGER NOT NULL,
        version_major INTEGER NOT NULL DEFAULT 1,
        version_minor INTEGER NOT NULL DEFAULT 0,
        stage         TEXT    NOT NULL,
        change_notes  TEXT,
        uploaded_by   INTEGER NOT NULL,
        created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (task_id)     REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_task_files_task ON task_files(task_id);
    `);
  }
}

export function createSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('admin','manager','member')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
      avatar TEXT,
      bio TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'new_request'
        CHECK(status IN ('new_request','under_review','concept_design','structural_design',
                         'shop_drawings','internal_review','client_review','revisions',
                         'approved','issued')),
      priority TEXT NOT NULL DEFAULT 'medium'
        CHECK(priority IN ('low','medium','high','urgent')),
      due_date TEXT,
      tags TEXT DEFAULT '[]',
      created_by INTEGER NOT NULL,
      assigned_to INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info' CHECK(type IN ('info','success','warning','error')),
      read INTEGER NOT NULL DEFAULT 0,
      task_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS task_files (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id       INTEGER NOT NULL,
      original_name TEXT    NOT NULL,
      stored_name   TEXT    NOT NULL,
      mime_type     TEXT    NOT NULL,
      file_size     INTEGER NOT NULL,
      version_major INTEGER NOT NULL DEFAULT 1,
      version_minor INTEGER NOT NULL DEFAULT 0,
      stage         TEXT    NOT NULL,
      change_notes  TEXT,
      uploaded_by   INTEGER NOT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (task_id)     REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_created_by   ON tasks(created_by);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to  ON tasks(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_tasks_status        ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_activity_task       ON activity_logs(task_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user  ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_comments_task       ON comments(task_id);
    CREATE INDEX IF NOT EXISTS idx_task_files_task     ON task_files(task_id);
  `);
}

export function logActivity(taskId: number | null, userId: number, action: string, details?: string) {
  getDatabase().prepare(
    'INSERT INTO activity_logs (task_id, user_id, action, details) VALUES (?, ?, ?, ?)'
  ).run(taskId, userId, action, details || null);
}

export function createNotification(userId: number, title: string, message: string, type: string, taskId?: number) {
  getDatabase().prepare(
    'INSERT INTO notifications (user_id, title, message, type, task_id) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, title, message, type, taskId || null);
}

function seedDatabase() {
  const adminPw = bcrypt.hashSync('admin123', 10);
  const managerPw = bcrypt.hashSync('manager123', 10);
  const memberPw = bcrypt.hashSync('member123', 10);

  const adminId = (db.prepare(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
  ).run('Admin User', 'admin@taskflow.com', adminPw, 'admin')).lastInsertRowid as number;

  const managerId = (db.prepare(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
  ).run('Sarah Manager', 'sarah@taskflow.com', managerPw, 'manager')).lastInsertRowid as number;

  const johnId = (db.prepare(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
  ).run('John Developer', 'john@taskflow.com', memberPw, 'member')).lastInsertRowid as number;

  const emmaId = (db.prepare(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
  ).run('Emma Designer', 'emma@taskflow.com', memberPw, 'member')).lastInsertRowid as number;

  const seedTasks = [
    { title: 'Precast Retaining Wall Panels — Block A', desc: 'Structural design for 15 m retaining wall panels, 200 mm thickness, Grade C35 concrete', status: 'shop_drawings', priority: 'high', created_by: adminId, assigned_to: johnId, offset: 14 },
    { title: 'Hollowcore Slab Layout — Tower 3 Level 5', desc: 'Standard HC265 units, confirm spans with structural engineer, coordinate M&E openings', status: 'internal_review', priority: 'medium', created_by: managerId, assigned_to: emmaId, offset: 7 },
    { title: 'Architectural Façade Panels — Hotel Lobby', desc: 'Exposed aggregate finish, 4.5 m × 1.2 m panels, match approved sample board REF-HT-22', status: 'concept_design', priority: 'high', created_by: adminId, assigned_to: johnId, offset: 21 },
    { title: 'Precast Staircase — Residential Block C', desc: 'L-shaped stair flights, 1 200 mm clear width, non-slip carborundum finish, client RFI-045', status: 'client_review', priority: 'urgent', created_by: managerId, assigned_to: emmaId, offset: 5 },
    { title: 'RC Box Culverts — Road Widening Package', desc: 'Standard box culverts 1 200 × 900 mm, 12 units required, AASHTO HL-93 loading', status: 'approved', priority: 'high', created_by: adminId, assigned_to: johnId, offset: -2 },
    { title: 'Precast Columns — Parking Structure P2', desc: 'Square 400 × 400 mm columns, 8 m height, corbels for beam bearing at +4.0 m and +8.0 m', status: 'new_request', priority: 'medium', created_by: adminId, assigned_to: null, offset: 30 },
    { title: 'Double Tee Beams — Warehouse Roof', desc: 'DT800 units, 18 m clear spans, topping slab 75 mm, coordinate with structural for camber', status: 'structural_design', priority: 'urgent', created_by: managerId, assigned_to: emmaId, offset: 10 },
    { title: 'Boundary Wall Panels — Site Perimeter', desc: 'Decorative ribbed finish, 2.5 m height, 6 m panel lengths, concrete posts at 6 m centres', status: 'issued', priority: 'low', created_by: managerId, assigned_to: johnId, offset: -7 },
    { title: 'Precast Bridge Beams — Interchange BR-07', desc: 'I-beams 1 200 mm depth, 24 m spans, BS 5400 loading, PSC prestress design required', status: 'under_review', priority: 'urgent', created_by: adminId, assigned_to: null, offset: 45 },
    { title: 'Lift Shaft Wall Panels — Commercial Tower', desc: 'Slipform-compatible wall panels, 250 mm thickness, coordinate with lift consultant', status: 'revisions', priority: 'high', created_by: managerId, assigned_to: johnId, offset: 3 },
  ];

  for (const t of seedTasks) {
    const due = new Date();
    due.setDate(due.getDate() + t.offset);
    db.prepare(
      `INSERT INTO tasks (title, description, status, priority, due_date, created_by, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(t.title, t.desc, t.status, t.priority, due.toISOString().split('T')[0], t.created_by, t.assigned_to ?? null);
  }

  // Seed activity logs
  db.prepare(`INSERT INTO activity_logs (task_id, user_id, action, details) VALUES (1, ?, 'task_created', 'Design request "Precast Retaining Wall Panels — Block A" was created')`).run(adminId);
  db.prepare(`INSERT INTO activity_logs (task_id, user_id, action, details) VALUES (1, ?, 'task_assigned', 'Task assigned to John Developer')`).run(adminId);
  db.prepare(`INSERT INTO activity_logs (task_id, user_id, action, details) VALUES (1, ?, 'status_changed', 'Status advanced to Shop Drawings')`).run(johnId);
  db.prepare(`INSERT INTO activity_logs (task_id, user_id, action, details) VALUES (5, ?, 'task_completed', 'RC Box Culverts approved for production')`).run(managerId);
}
