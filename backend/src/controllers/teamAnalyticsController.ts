import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getDatabase } from '../models/database';

function onlineStatus(lastSeen: string | null): 'online' | 'away' | 'offline' {
  if (!lastSeen) return 'offline';
  const diffMin = (Date.now() - new Date(lastSeen).getTime()) / 60_000;
  if (diffMin <= 15) return 'online';
  if (diffMin <= 60) return 'away';
  return 'offline';
}

function workingDaysElapsed(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  let count = 0;
  for (let d = 1; d <= now.getDate(); d++) {
    const day = new Date(year, month, d).getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return Math.max(count, 1);
}

interface RawMember {
  id: number; name: string; email: string; role: string; status: string;
  avatar: string | null; member_since: string;
  total_assigned: number; completed: number; completed_month: number;
  in_progress: number; overdue: number;
  avg_completion_days: number | null;
}

export function getTeamAnalytics(_req: AuthRequest, res: Response): void {
  const db = getDatabase();

  const rawMembers = db.prepare(`
    SELECT
      u.id, u.name, u.email, u.role, u.status, u.avatar,
      u.created_at AS member_since,
      COUNT(t.id)                                                        AS total_assigned,
      SUM(CASE WHEN t.status IN ('approved','issued') THEN 1 ELSE 0 END)              AS completed,
      SUM(CASE WHEN t.status IN ('approved','issued')
               AND  t.updated_at >= date('now','start of month') THEN 1 ELSE 0 END)  AS completed_month,
      SUM(CASE WHEN t.status IN ('concept_design','structural_design','shop_drawings','revisions') THEN 1 ELSE 0 END) AS in_progress,
      SUM(CASE WHEN t.status NOT IN ('approved','issued')
               AND  t.due_date < date('now') THEN 1 ELSE 0 END)                      AS overdue,
      AVG(CASE WHEN t.status IN ('completed','closed')
               THEN julianday(t.updated_at) - julianday(t.created_at)
               END)                                                                   AS avg_completion_days
    FROM users u
    LEFT JOIN tasks t ON t.assigned_to = u.id
    GROUP BY u.id
    ORDER BY completed DESC, u.name
  `).all() as unknown as RawMember[];

  const lastSeenRows = db.prepare(
    `SELECT user_id, MAX(created_at) AS last_seen FROM activity_logs GROUP BY user_id`
  ).all() as unknown as { user_id: number; last_seen: string }[];
  const lastSeenMap: Record<number, string> = {};
  for (const r of lastSeenRows) lastSeenMap[r.user_id] = r.last_seen;

  const attendanceRows = db.prepare(`
    SELECT user_id, COUNT(DISTINCT DATE(created_at)) AS active_days
    FROM activity_logs
    WHERE created_at >= date('now','start of month')
    GROUP BY user_id
  `).all() as unknown as { user_id: number; active_days: number }[];
  const attendanceMap: Record<number, number> = {};
  for (const r of attendanceRows) attendanceMap[r.user_id] = r.active_days;

  const workdays = workingDaysElapsed();

  const members = rawMembers.map(m => {
    const total     = m.total_assigned || 0;
    const done      = m.completed     || 0;
    const inProg    = m.in_progress   || 0;
    const late      = m.overdue       || 0;
    const doneMonth = m.completed_month || 0;

    const completionRate  = total > 0 ? Math.round((done / total) * 100) : 0;
    const overdueRatio    = total > 0 ? Math.round((late / total) * 100) : 0;
    const activityBonus   = total > 0 ? 10 : 0;

    const performanceScore = Math.max(0, Math.min(100,
      Math.round(completionRate * 0.60 - overdueRatio * 0.30 + activityBonus)
    ));

    const activeDays     = attendanceMap[m.id] || 0;
    const attendanceRate = Math.min(100, Math.round((activeDays / workdays) * 100));

    const productivityScore = Math.min(100,
      Math.round(performanceScore * 0.70 + attendanceRate * 0.30)
    );

    const avgDays = m.avg_completion_days != null
      ? Math.round(m.avg_completion_days * 10) / 10
      : null;

    const ls = lastSeenMap[m.id] ?? null;

    return {
      id:                m.id,
      name:              m.name,
      email:             m.email,
      role:              m.role,
      status:            m.status,
      avatar:            m.avatar,
      onlineStatus:      onlineStatus(ls),
      lastSeen:          ls,
      memberSince:       m.member_since,
      totalAssigned:     total,
      completed:         done,
      completedThisMonth: doneMonth,
      inProgress:        inProg,
      overdue:           late,
      completionRate,
      avgCompletionDays: avgDays,
      performanceScore,
      productivityScore,
      attendanceRate,
    };
  });

  const active         = members.filter(m => m.status === 'active');
  const online         = members.filter(m => m.onlineStatus === 'online');
  const totalAssigned  = members.reduce((s, m) => s + m.totalAssigned, 0);
  const totalCompleted = members.reduce((s, m) => s + m.completed, 0);
  const totalOverdue   = members.reduce((s, m) => s + m.overdue, 0);
  const totalInProg    = members.reduce((s, m) => s + m.inProgress, 0);
  const teamCompletion = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
  const teamEfficiency = members.length > 0
    ? Math.round(members.reduce((s, m) => s + m.performanceScore, 0) / members.length)
    : 0;

  const validTimes  = members.filter(m => m.avgCompletionDays !== null);
  const avgCompTime = validTimes.length > 0
    ? Math.round(validTimes.reduce((s, m) => s + (m.avgCompletionDays ?? 0), 0) / validTimes.length * 10) / 10
    : null;

  const newMembersThisMonth = (db.prepare(
    `SELECT COUNT(*) AS n FROM users WHERE created_at >= date('now','start of month')`
  ).get() as unknown as { n: number }).n;

  const topPerformer = [...members]
    .filter(m => m.status === 'active')
    .sort((a, b) => b.completedThisMonth - a.completedThisMonth || b.performanceScore - a.performanceScore)[0] ?? null;

  const workloadDistribution = members
    .filter(m => m.status === 'active')
    .map(m => ({
      name:       m.name.split(' ')[0],
      fullName:   m.name,
      assigned:   m.totalAssigned,
      completed:  m.completed,
      inProgress: m.inProgress,
      overdue:    m.overdue,
    }))
    .sort((a, b) => b.assigned - a.assigned);

  res.json({
    kpis: {
      totalMembers:        members.length,
      activeMembers:       active.length,
      onlineMembers:       online.length,
      teamTotalAssigned:   totalAssigned,
      teamCompleted:       totalCompleted,
      teamOverdue:         totalOverdue,
      teamInProgress:      totalInProg,
      teamCompletionRate:  teamCompletion,
      avgCompletionTimeDays: avgCompTime,
      teamEfficiencyScore:  teamEfficiency,
      newMembersThisMonth,
    },
    members,
    topPerformer,
    workloadDistribution,
  });
}
