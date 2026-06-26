import { useEffect, useState } from 'react';
import TeamKPIs from '../components/dashboard/TeamKPIs';
import { fetchTeamAnalytics } from '../services/teamAnalyticsService';
import { fetchActivity } from '../services/activityService';
import { TeamAnalyticsData, ActivityLog as Log } from '../types';

export default function TeamKPIsPage() {
  const [teamData, setTeamData] = useState<TeamAnalyticsData | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchTeamAnalytics().then(setTeamData),
      fetchActivity(10).then(setLogs).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: 'var(--text-3)' }}>
        Failed to load team analytics.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="mb-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Team KPIs</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Live performance metrics across all team members</p>
      </div>
      <TeamKPIs data={teamData} activityLogs={logs} />
    </div>
  );
}
