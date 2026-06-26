import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, Wifi, CheckSquare, TrendingUp, Zap,
  Clock, AlertCircle, Star, UserPlus, BarChart2, ArrowUp, ArrowDown,
  Minus, Trophy, Target, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, Cell,
} from 'recharts';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { TeamAnalyticsData, MemberKPI, OnlineStatus, ActivityLog as LogEntry } from '../../types';

const ONLINE_DOT: Record<OnlineStatus, string> = {
  online:  'bg-emerald-500',
  away:    'bg-amber-400',
  offline: 'bg-slate-400',
};
const ONLINE_LABEL: Record<OnlineStatus, string> = {
  online:  'Online',
  away:    'Away',
  offline: 'Offline',
};

const ACTION_META: Record<string, { icon: string; color: string }> = {
  task_created:    { icon: '✨', color: '#8b5cf6' },
  task_assigned:   { icon: '👤', color: '#06b6d4' },
  status_changed:  { icon: '🔄', color: '#f59e0b' },
  task_completed:  { icon: '✅', color: '#10b981' },
  task_closed:     { icon: '🔒', color: '#64748b' },
  comment_added:   { icon: '💬', color: '#3b82f6' },
  task_deleted:    { icon: '🗑️', color: '#ef4444' },
  member_created:  { icon: '👥', color: '#10b981' },
  member_updated:  { icon: '✏️', color: '#f59e0b' },
  member_deleted:  { icon: '❌', color: '#ef4444' },
  user_registered: { icon: '🎉', color: '#8b5cf6' },
};

function scoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}
function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  return 'Needs Improvement';
}

function MiniAvatar({ name, avatar, size = 32 }: { name: string; avatar?: string | null; size?: number }) {
  if (avatar) return (
    <img src={avatar} alt={name}
      className="rounded-full object-cover flex-none"
      style={{ width: size, height: size }} />
  );
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold flex-none"
      style={{ width: size, height: size, fontSize: size * 0.38, background: 'var(--gradient)' }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', color: 'var(--text)' }}>
      {label && <p className="mb-1.5 font-semibold" style={{ color: 'var(--text-2)' }}>{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} className="font-medium py-0.5" style={{ color: p.fill || p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

function KpiTile({
  icon: Icon, label, value, sub, iconBg, iconColor, delay = 0,
}: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; iconBg: string; iconColor: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card rounded-2xl p-4 flex items-start gap-3"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: iconBg }}>
        <Icon className="w-4.5 h-4.5" style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-tight" style={{ color: 'var(--text)' }}>{value}</p>
        <p className="text-xs font-medium mt-0.5 truncate" style={{ color: 'var(--text-2)' }}>{label}</p>
        {sub && <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>{sub}</p>}
      </div>
    </motion.div>
  );
}

function TopPerformerCard({ member }: { member: MemberKPI }) {
  const ringData = [
    { name: 'score', value: member.performanceScore },
    { name: 'rest',  value: 100 - member.performanceScore },
  ];
  const color = scoreColor(member.performanceScore);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      className="card rounded-2xl p-5 relative overflow-hidden h-full">
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: '#f59e0b' }} />

      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,0.12)' }}>
          <Trophy className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
        </div>
        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Top Performer</span>
        <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid rgba(245,158,11,0.2)' }}>
          This Month
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <MiniAvatar name={member.name} avatar={member.avatar} size={56} />
          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${ONLINE_DOT[member.onlineStatus]}`}
            style={{ borderColor: 'var(--surface)' }} />
        </div>

        <div className="relative w-16 h-16 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={ringData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={4} background={{ fill: 'var(--surface-3)' }}>
                {ringData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? color : 'transparent'} />
                ))}
              </RadialBar>
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold" style={{ color }}>{member.performanceScore}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{member.name}</p>
          <p className="text-xs capitalize" style={{ color: 'var(--text-3)' }}>{member.role}</p>
          <div className="mt-2 space-y-1">
            {[
              { label: 'Completed this month', value: member.completedThisMonth },
              { label: 'Completion rate', value: `${member.completionRate}%` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-[10px]">
                <span style={{ color: 'var(--text-3)' }}>{label}</span>
                <span className="font-semibold" style={{ color: 'var(--text-2)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3.5 grid grid-cols-3 gap-2" style={{ borderTop: '1px solid var(--border)' }}>
        {[
          { label: 'Performance', value: `${member.performanceScore}%`, c: color },
          { label: 'Productivity', value: `${member.productivityScore}%`, c: scoreColor(member.productivityScore) },
          { label: 'Avg days',    value: member.avgCompletionDays != null ? `${member.avgCompletionDays}d` : '—', c: 'var(--text-2)' },
        ].map(({ label, value, c }) => (
          <div key={label} className="text-center">
            <p className="text-sm font-bold" style={{ color: c }}>{value}</p>
            <p className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>{label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ScoreRing({ score, size = 40 }: { score: number; size?: number }) {
  const color = scoreColor(score);
  const strokeWidth = 3.5;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--surface-3)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ fontSize: size * 0.26, fontWeight: 700, color }}>{score}</span>
      </div>
    </div>
  );
}

type SortKey = 'name' | 'completionRate' | 'performanceScore' | 'productivityScore' | 'totalAssigned' | 'overdue' | 'attendanceRate';

function SortHeader({
  label, sortKey, current, dir, onClick,
}: {
  label: string; sortKey: SortKey; current: SortKey; dir: 'asc' | 'desc'; onClick: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  const Icon = active ? (dir === 'asc' ? ArrowUp : ArrowDown) : Minus;
  return (
    <button onClick={() => onClick(sortKey)}
      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity whitespace-nowrap"
      style={{ color: active ? 'var(--accent)' : 'var(--text-3)' }}>
      {label}
      <Icon className="w-2.5 h-2.5" />
    </button>
  );
}

function MemberRow({ member, rank }: { member: MemberKPI; rank: number }) {
  return (
    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: rank * 0.04 }}
      className="group"
      style={{ borderBottom: '1px solid var(--border)' }}>

      <td className="px-4 py-3 text-center">
        {rank <= 3 ? (
          <span className="text-sm font-black" style={{ color: rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : '#cd7f32' }}>
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
          </span>
        ) : (
          <span className="text-xs font-semibold" style={{ color: 'var(--text-3)' }}>{rank}</span>
        )}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <MiniAvatar name={member.name} avatar={member.avatar} size={32} />
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border ${ONLINE_DOT[member.onlineStatus]}`}
              style={{ borderColor: 'var(--surface)' }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate max-w-[110px]" style={{ color: 'var(--text)' }}>
              {member.name}
            </p>
            <p className="text-[10px] truncate" style={{ color: 'var(--text-3)' }}>{member.email}</p>
          </div>
        </div>
      </td>

      <td className="px-3 py-3 hidden md:table-cell">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}>
          {member.role}
        </span>
      </td>

      <td className="px-3 py-3 hidden lg:table-cell">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${ONLINE_DOT[member.onlineStatus]}`} />
          <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
            {ONLINE_LABEL[member.onlineStatus]}
          </span>
        </div>
      </td>

      <td className="px-3 py-3 text-center">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{member.totalAssigned}</span>
      </td>

      <td className="px-3 py-3 text-center">
        <span className="text-xs font-semibold" style={{ color: '#10b981' }}>{member.completed}</span>
      </td>

      <td className="px-3 py-3 hidden sm:table-cell">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full min-w-[48px]" style={{ background: 'var(--surface-3)' }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${member.completionRate}%`, background: scoreColor(member.completionRate) }} />
          </div>
          <span className="text-[10px] font-bold w-8 text-right"
            style={{ color: scoreColor(member.completionRate) }}>
            {member.completionRate}%
          </span>
        </div>
      </td>

      <td className="px-3 py-3 text-center hidden md:table-cell">
        <span className="text-xs font-semibold" style={{ color: '#06b6d4' }}>{member.inProgress}</span>
      </td>

      <td className="px-3 py-3 text-center">
        <span className="text-xs font-semibold"
          style={{ color: member.overdue > 0 ? '#ef4444' : 'var(--text-3)' }}>
          {member.overdue}
        </span>
      </td>

      <td className="px-3 py-3 text-center hidden lg:table-cell">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{member.attendanceRate}%</span>
      </td>

      <td className="px-3 py-3 hidden xl:table-cell">
        <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
          {member.lastSeen ? formatDistanceToNow(parseISO(member.lastSeen), { addSuffix: true }) : 'Never'}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <ScoreRing score={member.performanceScore} size={38} />
          <div className="hidden sm:block">
            <p className="text-[9px] font-semibold leading-tight" style={{ color: scoreColor(member.performanceScore) }}>
              {scoreLabel(member.performanceScore)}
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-3)' }}>
              Prod:&nbsp;
              <span className="font-bold" style={{ color: scoreColor(member.productivityScore) }}>
                {member.productivityScore}%
              </span>
            </p>
          </div>
        </div>
      </td>
    </motion.tr>
  );
}

function RecentActivity({ logs }: { logs: LogEntry[] }) {
  const visible = logs.slice(0, 6);
  return (
    <div className="card rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(59,130,246,0.10)' }}>
          <Activity className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />
        </div>
        <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Recent Team Activity</h3>
        <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: 'var(--surface-2)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
          last {visible.length}
        </span>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {visible.map((log) => {
          const meta = ACTION_META[log.action] || { icon: '•', color: 'var(--text-3)' };
          return (
            <div key={log.id} className="flex items-start gap-3 px-5 py-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-none mt-0.5"
                style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}22` }}>
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-snug truncate" style={{ color: 'var(--text-2)' }}>
                  {log.details}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3.5 h-3.5 rounded-full overflow-hidden flex-none">
                    {log.user_avatar ? (
                      <img src={log.user_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[7px] text-white font-bold"
                        style={{ background: 'var(--gradient)' }}>
                        {log.user_name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-3)' }}>
                    {log.user_name}
                  </span>
                  <span style={{ color: 'var(--border-strong)' }}>·</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                    {formatDistanceToNow(parseISO(log.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  data: TeamAnalyticsData;
  activityLogs?: LogEntry[];
}

export default function TeamKPIs({ data, activityLogs }: Props) {
  const { kpis, members, topPerformer, workloadDistribution } = data;
  const [sortKey, setSortKey] = useState<SortKey>('performanceScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const sorted = [...members].sort((a, b) => {
    if (sortKey === 'name') {
      return sortDir === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    const av = a[sortKey] as number;
    const bv = b[sortKey] as number;
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const tiles = [
    { icon: Users,       label: 'Total Members',      value: kpis.totalMembers,               sub: `${kpis.newMembersThisMonth} new this month`,              iconBg: 'rgba(79,70,229,0.10)',  iconColor: '#4f46e5' },
    { icon: UserCheck,   label: 'Active Members',      value: kpis.activeMembers,              sub: `${kpis.totalMembers - kpis.activeMembers} inactive`,       iconBg: 'rgba(16,185,129,0.10)', iconColor: '#10b981' },
    { icon: Wifi,        label: 'Online Now',          value: kpis.onlineMembers,              sub: 'Active in last 15 min',                                    iconBg: 'rgba(6,182,212,0.10)', iconColor: '#06b6d4' },
    { icon: CheckSquare, label: 'Tasks Completed',     value: kpis.teamCompleted,              sub: `of ${kpis.teamTotalAssigned} assigned`,                    iconBg: 'rgba(16,185,129,0.10)', iconColor: '#10b981' },
    { icon: TrendingUp,  label: 'Completion Rate',     value: `${kpis.teamCompletionRate}%`,   sub: 'Team average',                                             iconBg: 'rgba(245,158,11,0.10)', iconColor: '#f59e0b' },
    { icon: AlertCircle, label: 'Overdue Tasks',       value: kpis.teamOverdue,                sub: kpis.teamOverdue > 0 ? 'Needs attention' : 'All on track', iconBg: kpis.teamOverdue > 0 ? 'rgba(239,68,68,0.10)' : 'rgba(16,185,129,0.10)', iconColor: kpis.teamOverdue > 0 ? '#ef4444' : '#10b981' },
    { icon: Clock,       label: 'In Progress',         value: kpis.teamInProgress,             sub: 'Active tasks',                                             iconBg: 'rgba(6,182,212,0.10)', iconColor: '#06b6d4' },
    { icon: BarChart2,   label: 'Avg Completion Time', value: kpis.avgCompletionTimeDays != null ? `${kpis.avgCompletionTimeDays}d` : '—', sub: 'Days per task', iconBg: 'rgba(139,92,246,0.10)', iconColor: '#8b5cf6' },
    { icon: Target,      label: 'Productivity Score',  value: `${kpis.teamEfficiencyScore}/100`, sub: scoreLabel(kpis.teamEfficiencyScore),                   iconBg: 'rgba(245,158,11,0.10)', iconColor: '#f59e0b' },
    { icon: Activity,    label: 'Team Efficiency',     value: `${kpis.teamEfficiencyScore}%`,  sub: 'Based on performance',                                     iconBg: 'rgba(79,70,229,0.10)',  iconColor: '#4f46e5' },
    { icon: UserPlus,    label: 'New Members',         value: kpis.newMembersThisMonth,        sub: 'Joined this month',                                        iconBg: 'rgba(16,185,129,0.10)', iconColor: '#10b981' },
    { icon: Zap,         label: 'Tasks Assigned',      value: kpis.teamTotalAssigned,          sub: 'Total workload',                                           iconBg: 'rgba(124,58,237,0.10)', iconColor: '#7c3aed' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--accent-light)' }}>
          <Users className="w-4 h-4" style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Team Performance KPIs</h2>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>Live metrics across all team members</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {tiles.slice(0, 6).map((t, i) => (
          <KpiTile key={t.label} {...t} delay={i * 0.04} />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {tiles.slice(6).map((t, i) => (
          <KpiTile key={t.label} {...t} delay={(i + 6) * 0.04} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {topPerformer && (
          <div className="lg:col-span-2">
            <TopPerformerCard member={topPerformer} />
          </div>
        )}

        <div className={`card rounded-2xl p-5 ${topPerformer ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.10)' }}>
              <BarChart2 className="w-3.5 h-3.5" style={{ color: '#8b5cf6' }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Workload Distribution</h3>
          </div>
          {workloadDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={workloadDistribution} margin={{ left: -16, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="completed"  name="Completed"   fill="#10b981" radius={[3,3,0,0]} stackId="a" />
                <Bar dataKey="inProgress" name="In Progress" fill="#06b6d4" radius={[0,0,0,0]} stackId="a" />
                <Bar dataKey="overdue"    name="Overdue"     fill="#ef4444" radius={[3,3,0,0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--text-3)' }}>No data</div>
          )}
          <div className="flex gap-4 mt-2 flex-wrap">
            {[['#10b981','Completed'],['#06b6d4','In Progress'],['#ef4444','Overdue']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
                <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.10)' }}>
              <Star className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Member Leaderboard</h3>
          </div>
          <span className="text-[10px] font-medium px-2 py-1 rounded-full"
            style={{ background: 'var(--surface-2)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
            {members.length} members
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-4 py-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>#</span>
                </th>
                <th className="px-4 py-3">
                  <SortHeader label="Member"   sortKey="name"           current={sortKey} dir={sortDir} onClick={handleSort} />
                </th>
                <th className="px-3 py-3 hidden md:table-cell">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Role</span>
                </th>
                <th className="px-3 py-3 hidden lg:table-cell">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Status</span>
                </th>
                <th className="px-3 py-3 text-center">
                  <SortHeader label="Assigned" sortKey="totalAssigned"  current={sortKey} dir={sortDir} onClick={handleSort} />
                </th>
                <th className="px-3 py-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Done</span>
                </th>
                <th className="px-3 py-3 hidden sm:table-cell">
                  <SortHeader label="Rate"     sortKey="completionRate"  current={sortKey} dir={sortDir} onClick={handleSort} />
                </th>
                <th className="px-3 py-3 text-center hidden md:table-cell">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>In Prog.</span>
                </th>
                <th className="px-3 py-3 text-center">
                  <SortHeader label="Overdue"  sortKey="overdue"         current={sortKey} dir={sortDir} onClick={handleSort} />
                </th>
                <th className="px-3 py-3 text-center hidden lg:table-cell">
                  <SortHeader label="Attend."  sortKey="attendanceRate"  current={sortKey} dir={sortDir} onClick={handleSort} />
                </th>
                <th className="px-3 py-3 hidden xl:table-cell">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Last Active</span>
                </th>
                <th className="px-4 py-3">
                  <SortHeader label="Score"    sortKey="performanceScore" current={sortKey} dir={sortDir} onClick={handleSort} />
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((member, i) => (
                <MemberRow key={member.id} member={member} rank={i + 1} />
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-3)' }}>
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activityLogs && activityLogs.length > 0 && (
        <RecentActivity logs={activityLogs} />
      )}
    </div>
  );
}
