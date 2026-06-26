import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import userRoutes from './routes/users';
import memberRoutes from './routes/members';
import activityRoutes from './routes/activity';
import notificationRoutes from './routes/notifications';
import aiRoutes from './routes/ai';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Manual CORS middleware ─────────────────────────────────────────
// Added manually instead of the cors() package so Railway cannot
// silently swallow the headers during a cached/partial redeploy.
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin ?? '*';
  res.setHeader('Access-Control-Allow-Origin',      origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods',     'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers',     'Content-Type,Authorization');
  res.setHeader('Access-Control-Max-Age',           '86400'); // preflight cache 24h
  if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});

app.use(express.json({ limit: '10mb' }));

// ── Health check ───────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', version: '2.0.0' }));

// ── Routes with /api prefix ────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/tasks',         taskRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/members',       memberRoutes);
app.use('/api/activity',      activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai',            aiRoutes);

// ── Alias routes without /api prefix (resilience) ─────────────────
app.use('/auth',          authRoutes);
app.use('/tasks',         taskRoutes);
app.use('/users',         userRoutes);
app.use('/members',       memberRoutes);
app.use('/activity',      activityRoutes);
app.use('/notifications', notificationRoutes);
app.use('/ai',            aiRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`PrecastFlow API running on port ${PORT}`);
});

export default app;
