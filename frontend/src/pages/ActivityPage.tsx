import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw } from 'lucide-react';
import ActivityLogComponent from '../components/activity/ActivityLog';
import { fetchActivity } from '../services/activityService';
import { ActivityLog } from '../types';
import toast from 'react-hot-toast';

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);

  async function load(l = limit) {
    setLoading(true);
    try { setLogs(await fetchActivity(l)); }
    catch { toast.error('Failed to load activity'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [limit]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <Activity className="w-4.5 h-4.5 text-violet-400" />
            </div>
            Activity Log
          </h1>
          <p className="text-sm mt-1 ml-12" style={{ color: 'var(--text-3)' }}>Full audit trail of all team actions</p>
        </div>
        <motion.button onClick={() => load()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh
        </motion.button>
      </div>

      <div className="rounded-2xl p-6" style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>
        {loading && !logs.length ? (
          <div className="flex justify-center py-12">
            <span className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <ActivityLogComponent logs={logs} />
            {logs.length >= limit && (
              <div className="mt-6 text-center">
                <button onClick={() => setLimit(l => l + 50)} className="btn-secondary text-sm">
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
