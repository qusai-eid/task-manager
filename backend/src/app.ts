import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import userRoutes from './routes/users';
import memberRoutes from './routes/members';
import activityRoutes from './routes/activity';
import notificationRoutes from './routes/notifications';
import aiRoutes from './routes/ai';

const app = express();
const PORT = process.env.PORT || 5000;

// Always allow localhost in dev; in production also allow FRONTEND_URL
// FRONTEND_URL can be comma-separated for multiple domains
const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:5174'];
const PROD_ORIGINS = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : [];
const ALLOWED_ORIGINS = [...DEV_ORIGINS, ...PROD_ORIGINS];

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server requests (no origin) and whitelisted origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true);
    else cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', version: '2.0.0' }));

// Primary routes — with /api prefix (used when frontend has correct baseURL)
app.use('/api/auth',          authRoutes);
app.use('/api/tasks',         taskRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/members',       memberRoutes);
app.use('/api/activity',      activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai',            aiRoutes);

// Alias routes — without /api prefix (resilience for misconfigured VITE_API_URL)
app.use('/auth',          authRoutes);
app.use('/tasks',         taskRoutes);
app.use('/users',         userRoutes);
app.use('/members',       memberRoutes);
app.use('/activity',      activityRoutes);
app.use('/notifications', notificationRoutes);
app.use('/ai',            aiRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`TaskFlow API v2.0 running on http://localhost:${PORT}`);
});

export default app;
