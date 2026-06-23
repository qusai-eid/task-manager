import { useEffect, useState } from 'react';
import { CheckSquare, Clock, AlertCircle, TrendingUp, ListTodo, Flame, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import StatsCard from '../components/dashboard/StatsCard';
import { fetchAnalytics } from '../services/taskService';
import { Analytics } from '../types';
import { useAuth } from '../contexts/AuthContext';

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics()
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = analytics!;
  const completionRate = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  const statusData = [
    { name: 'To Do', value: stats.todo },
    { name: 'In Progress', value: stats.in_progress },
    { name: 'Done', value: stats.done },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here's what's happening with your tasks today.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tasks"
          value={stats.total}
          icon={ListTodo}
          color="text-primary-600"
          bgColor="bg-primary-50 dark:bg-primary-900/30"
          subtitle={`${completionRate}% completion rate`}
        />
        <StatsCard
          title="In Progress"
          value={stats.in_progress}
          icon={Clock}
          color="text-yellow-600"
          bgColor="bg-yellow-50 dark:bg-yellow-900/30"
        />
        <StatsCard
          title="Completed"
          value={stats.done}
          icon={CheckSquare}
          color="text-green-600"
          bgColor="bg-green-50 dark:bg-green-900/30"
        />
        <StatsCard
          title="Overdue"
          value={stats.overdue}
          icon={AlertCircle}
          color="text-red-600"
          bgColor="bg-red-50 dark:bg-red-900/30"
          subtitle={stats.overdue > 0 ? 'Needs attention' : 'All on track'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Activity (Last 7 Days)</h2>
          </div>
          {stats.recentActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-gray-500" />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.1)' }}
                />
                <Bar dataKey="created" name="Tasks Created" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No activity in the last 7 days
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Status Breakdown</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconSize={10} iconType="circle" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No tasks yet
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Priority Breakdown</h2>
        <div className="grid grid-cols-3 gap-4">
          <PriorityBar label="High" value={stats.high} total={stats.total} color="bg-red-500" icon={<Flame className="w-4 h-4 text-red-500" />} />
          <PriorityBar label="Medium" value={stats.medium} total={stats.total} color="bg-yellow-500" icon={<Clock className="w-4 h-4 text-yellow-500" />} />
          <PriorityBar label="Low" value={stats.low} total={stats.total} color="bg-green-500" icon={<Leaf className="w-4 h-4 text-green-500" />} />
        </div>
      </div>

      <div className="text-center">
        <Link to="/tasks" className="btn-primary inline-flex items-center gap-2">
          <ListTodo className="w-4 h-4" />
          View All Tasks
        </Link>
      </div>
    </div>
  );
}

function PriorityBar({ label, value, total, color, icon }: { label: string; value: number; total: number; color: string; icon: React.ReactNode }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="ml-auto text-sm font-bold text-gray-900 dark:text-white">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1">{pct}% of tasks</p>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
