import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import authRoutes          from './routes/auth';
import taskRoutes          from './routes/tasks';
import userRoutes          from './routes/users';
import memberRoutes        from './routes/members';
import activityRoutes      from './routes/activity';
import notificationRoutes  from './routes/notifications';
import aiRoutes            from './routes/ai';

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS — must be the very first middleware ───────────────────────
// Sets headers on EVERY response so preflight (OPTIONS) always passes.
app.use((req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin as string | undefined;

  // Echo the caller's Origin back so credentials work across domains
  res.setHeader('Access-Control-Allow-Origin',      origin ?? '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  // Cache preflight for 24 h so the browser doesn't re-check every request
  res.setHeader('Access-Control-Max-Age', '86400');

  // Preflight — respond immediately, nothing else needs to run
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});

// ── Body parser ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ── Health check ───────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '2.0.0', node: process.version });
});

// ── API routes ─────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/tasks',         taskRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/members',       memberRoutes);
app.use('/api/activity',      activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai',            aiRoutes);

// Alias routes without /api prefix (belt-and-suspenders)
app.use('/auth',          authRoutes);
app.use('/tasks',         taskRoutes);
app.use('/users',         userRoutes);
app.use('/members',       memberRoutes);
app.use('/activity',      activityRoutes);
app.use('/notifications', notificationRoutes);
app.use('/ai',            aiRoutes);

// ── 404 fallback ───────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`PrecastFlow API  node ${process.version}  port ${PORT}`);
});

export default app;
