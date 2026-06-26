import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckSquare, Clock, AlertCircle, Users, ListTodo,
  TrendingUp, Kanban, ArrowRight, Zap
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { type Variants } from 'framer-motion';
import StatsCard from '../components/dashboard/StatsCard';
import ActivityLog from '../components/activity/ActivityLog';
import { fetchAnalytics } from '../services/taskService';
import { fetchActivity } from '../services/activityService';
import { Analytics, ActivityLog as Log } from '../types';
import { useAuth } from '../contexts/AuthContext';

const CHART_COLORS = {
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  gray: '#4b5563',
};

const STATUS_PIE_DATA_COLORS = [
  CHART_COLORS.gray, CHART_COLORS.cyan, CHART_COLORS.purple,
  CHART_COLORS.green, '#334155',
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs" style={{ background: 'var(--menu-bg)', border: '1px solid var(--menu-border)', boxShadow: 'var(--shadow-lg)', color: 'var(--text)' }}>
      {label && <p className="mb-1.5 font-medium" style={{ color: 'var(--text-2)' }}>{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} className="font-semibold" style={{ color: p.color || p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function DashboardPage() {
  const { user, canManage } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    Promise.all([
      fetchAnalytics().then(setAnalytics),
      canManage ? fetchActivity(8).then(setLogs) : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, [canManage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const s = analytics!;
  const completionRate = s.total ? Math.round((s.completed / s.total) * 100) : 0;
  const pending = s.todo + s.in_progress + s.review;

  const statusPieData = [
    { name: 'To Do', value: s.todo },
    { name: 'In Progress', value: s.in_progress },
    { name: 'Review', value: s.review },
    { name: 'Completed', value: s.completed },
    { name: 'Closed', value: s.closed },
  ].filter(d => d.value > 0);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

      {/* Hero header */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl p-7 shine-hover"
        style={{
          background: 'var(--elevated-bg)',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
        {/* Animated gradient orbs */}
        <motion.div className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)', filter: 'blur(32px)' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)', filter: 'blur(24px)' }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />

        {/* Top gradient border */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.6) 30%, rgba(6,182,212,0.6) 70%, transparent 100%)' }} />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-3)' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {greeting}
            </p>
            <h1 className="text-4xl font-bold mb-1.5 tracking-tight" style={{ color: 'var(--text)' }}>
              {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>
              Design Department · Precast Construction
            </p>
            <div className="flex gap-3 mt-5">
              <Link to="/tasks" className="btn-primary text-sm">
                <ListTodo className="w-4 h-4" />My Tasks
              </Link>
              <Link to="/kanban" className="btn-secondary text-sm">
                <Kanban className="w-4 h-4" />Workflow Board
              </Link>
            </div>
          </div>
          <div className="hidden lg:block shrink-0">
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--gradient)', boxShadow: 'var(--shadow-glow-accent)' }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Zap className="w-8 h-8 text-white" fill="white" />
            </motion.div>
          </div>
        </div>

        {/* Completion bar */}
        <div className="relative z-10 mt-6 max-w-sm">
          <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-3)' }}>
            <span className="font-medium">Overall completion</span>
            <span className="font-bold" style={{ color: 'var(--text)' }}>{completionRate}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1.4, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              className="h-full rounded-full"
              style={{ background: 'var(--gradient)', boxShadow: '0 0 10px rgba(124,58,237,0.5)' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Tasks" value={s.total} icon={ListTodo}
          gradient="linear-gradient(135deg,#7c3aed,#4f46e5)" glowColor="#7c3aed" delay={0} />
        <StatsCard title="Completed" value={s.completed} icon={CheckSquare}
          gradient="linear-gradient(135deg,#10b981,#059669)" glowColor="#10b981" delay={80} subtitle={`${completionRate}% rate`} />
        <StatsCard title="Pending" value={pending} icon={Clock}
          gradient="linear-gradient(135deg,#f59e0b,#d97706)" glowColor="#f59e0b" delay={160} />
        <StatsCard title="Overdue" value={s.overdue} icon={AlertCircle}
          gradient="linear-gradient(135deg,#ef4444,#dc2626)" glowColor="#ef4444" delay={240} subtitle={s.overdue ? 'Need attention' : 'All on track'} />
        {canManage && (
          <StatsCard title="Team Members" value={s.totalMembers} icon={Users}
            gradient="linear-gradient(135deg,#06b6d4,#0891b2)" glowColor="#06b6d4" delay={320} />
        )}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart – weekly completions */}
        <motion.div variants={fadeUp} className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Weekly Task Completions</h3>
          </div>
          {s.weeklyCompletion.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={s.weeklyCompletion}>
                <defs>
                  <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="recharts-cartesian-grid" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} className="recharts-cartesian-axis" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} className="recharts-cartesian-axis" axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2.5}
                  fill="url(#gradGreen)" dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--text-3)' }}>No completions this week</div>
          )}
        </motion.div>

        {/* Donut chart – status */}
        <motion.div variants={fadeUp} className="rounded-2xl p-5"
          style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>
          <h3 className="text-sm font-bold mb-5" style={{ color: 'var(--text)' }}>Tasks by Status</h3>
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {statusPieData.map((_, i) => (
                    <Cell key={i} fill={STATUS_PIE_DATA_COLORS[i % STATUS_PIE_DATA_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconSize={8} iconType="circle"
                  formatter={(v) => <span style={{ color: 'var(--text-2)', fontSize: 11 }}>{v}</span>} />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--text-3)' }}>No tasks yet</div>
          )}
        </motion.div>
      </div>

      {/* Priority + Members row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Priority breakdown */}
        <motion.div variants={fadeUp} className="rounded-2xl p-5"
          style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>
          <h3 className="text-sm font-bold mb-5" style={{ color: 'var(--text)' }}>Priority Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'Urgent', value: s.urgent, color: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
              { label: 'High',   value: s.high,   color: '#f97316', glow: 'rgba(249,115,22,0.4)' },
              { label: 'Medium', value: s.medium, color: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
              { label: 'Low',    value: s.low,    color: '#10b981', glow: 'rgba(16,185,129,0.4)' },
            ].map(({ label, value, color, glow }) => {
              const pct = s.total ? (value / s.total) * 100 : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold" style={{ color }}>{label}</span>
                    <span style={{ color: 'var(--text-3)' }}>{value} tasks</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: color, boxShadow: `0 0 8px ${glow}` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Tasks by member bar */}
        {canManage && s.byMember.length > 0 ? (
          <motion.div variants={fadeUp} className="rounded-2xl p-5"
            style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Tasks by Member</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={s.byMember} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="recharts-cartesian-grid" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} className="recharts-cartesian-axis" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} className="recharts-cartesian-axis" axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Total" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Done" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} className="rounded-2xl p-5 flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 100%)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div>
              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>Quick Actions</h3>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>Jump to what matters most.</p>
            </div>
            <div className="space-y-2 mt-4">
              {[
                { label: 'View all tasks', to: '/tasks', icon: ListTodo },
                { label: 'Open Kanban board', to: '/kanban', icon: Kanban },
              ].map(({ label, to, icon: Icon }) => (
                <Link key={to} to={to}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all group"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                  <span className="flex items-center gap-2"><Icon className="w-4 h-4" />{label}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Recent activity */}
      {canManage && logs.length > 0 && (
        <motion.div variants={fadeUp} className="rounded-2xl p-5"
          style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Recent Activity</h3>
            <Link to="/activity"
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ActivityLog logs={logs} compact />
        </motion.div>
      )}

    </motion.div>
  );
}
