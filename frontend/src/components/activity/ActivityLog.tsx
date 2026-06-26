import { motion } from 'framer-motion';
import { ActivityLog as Log } from '../../types';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

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
  file_uploaded:   { icon: '📎', color: '#f59e0b' },
  file_deleted:    { icon: '🗑️', color: '#ef4444' },
};

function UserAvatar({ name, avatar }: { name: string; avatar?: string | null }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="w-4 h-4 rounded-full object-cover flex-none"
      />
    );
  }
  return (
    <div
      className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold flex-none"
      style={{ background: 'var(--gradient)' }}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}

export default function ActivityLog({ logs, compact = false }: { logs: Log[]; compact?: boolean }) {
  if (!logs.length) {
    return (
      <div className="py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>
        No activity to show
      </div>
    );
  }

  return (
    <div className="relative space-y-1">
      <div className="absolute left-[18px] top-3 bottom-3 w-px"
        style={{ background: 'var(--border)' }} />

      {logs.map((log, i) => {
        const meta = ACTION_META[log.action] || { icon: '•', color: 'var(--text-3)' };
        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="relative flex gap-4 py-2.5 pl-1"
          >
            <div
              className="relative z-10 flex-none w-9 h-9 rounded-xl flex items-center justify-center text-sm"
              style={{
                background: `${meta.color}12`,
                border:     `1px solid ${meta.color}22`,
              }}
            >
              {meta.icon}
            </div>

            <div className="flex-1 min-w-0 pt-1.5">
              <p className="text-sm leading-snug" style={{ color: 'var(--text-2)' }}>{log.details}</p>
              {!compact && log.task_title && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                  on <span className="font-medium" style={{ color: meta.color }}>{log.task_title}</span>
                </p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <UserAvatar name={log.user_name} avatar={log.user_avatar} />
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-3)' }}>{log.user_name}</span>
                <span style={{ color: 'var(--border-strong)' }}>·</span>
                <span className="text-[11px]" style={{ color: 'var(--text-3)' }}
                  title={format(parseISO(log.created_at), 'PPpp')}>
                  {formatDistanceToNow(parseISO(log.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
