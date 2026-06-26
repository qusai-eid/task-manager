import { motion } from 'framer-motion';
import { Task, TaskStatus } from '../../types';
import { Calendar, Tag, Trash2, Edit2, ChevronRight, Flame, AlertTriangle, ArrowUp, Minus } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onOpen: (task: Task) => void;
}

export const PRIORITY_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  low:    { label: 'Low',    color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: <Minus className="w-2.5 h-2.5" /> },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: <ArrowUp className="w-2.5 h-2.5" /> },
  high:   { label: 'High',   color: '#f97316', bg: 'rgba(249,115,22,0.12)',  icon: <AlertTriangle className="w-2.5 h-2.5" /> },
  urgent: { label: 'Urgent', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: <Flame className="w-2.5 h-2.5" /> },
};

export const STATUS_META: Record<TaskStatus, { label: string; color: string; dot: string }> = {
  new_request:       { label: 'New Request',    color: '#94a3b8', dot: 'bg-slate-400'   },
  under_review:      { label: 'Under Review',   color: '#f59e0b', dot: 'bg-amber-400'   },
  concept_design:    { label: 'Concept Design', color: '#3b82f6', dot: 'bg-blue-400'    },
  structural_design: { label: 'Structural',     color: '#6366f1', dot: 'bg-indigo-400'  },
  shop_drawings:     { label: 'Shop Drawings',  color: '#8b5cf6', dot: 'bg-violet-400'  },
  internal_review:   { label: 'Int. Review',    color: '#f97316', dot: 'bg-orange-400'  },
  client_review:     { label: 'Client Review',  color: '#06b6d4', dot: 'bg-cyan-400'    },
  revisions:         { label: 'Revisions',      color: '#ef4444', dot: 'bg-red-400'     },
  approved:          { label: 'Approved',        color: '#10b981', dot: 'bg-emerald-400' },
  issued:            { label: 'Issued',          color: '#059669', dot: 'bg-emerald-600' },
};

// Primary forward path through the design workflow
export const STATUS_NEXT: Partial<Record<TaskStatus, TaskStatus>> = {
  new_request:       'under_review',
  under_review:      'concept_design',
  concept_design:    'structural_design',
  structural_design: 'shop_drawings',
  shop_drawings:     'internal_review',
  internal_review:   'client_review',
  client_review:     'revisions',    // client requests changes → send to revisions
  revisions:         'approved',     // revisions complete → approved for production (manager-only)
  approved:          'issued',        // manager-only: issue to factory
};

export function Avatar({ name, avatar, size = 24 }: { name: string; avatar?: string | null; size?: number }) {
  if (avatar) return (
    <img src={avatar} alt={name} style={{ width: size, height: size }}
      className="rounded-full object-cover ring-1 ring-white/10" title={name} />
  );
  return (
    <div style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold ring-1 ring-white/10"
      title={name}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, onOpen }: Props) {
  const { canManage, user } = useAuth();
  const isOverdue = task.due_date && !['approved', 'issued'].includes(task.status) && isPast(parseISO(task.due_date));
  const canEditDetails = canManage;                                   // full edit: admin / manager only
  const canProgress    = canManage || task.assigned_to === user?.id; // status change: assigned member ok
  const nextStatus = STATUS_NEXT[task.status];
  const priority = PRIORITY_META[task.priority];
  const status = STATUS_META[task.status];
  const isDone = task.status === 'approved' || task.status === 'issued';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(139,92,246,0.25)' }}
      onClick={() => onOpen(task)}
      className="relative rounded-xl p-4 cursor-pointer group"
      style={{
        background: 'var(--elevated-bg)',
        border: '1px solid var(--elevated-border)',
        boxShadow: 'var(--elevated-shadow)',
        opacity: isDone ? 0.6 : 1,
        transition: 'border-color 150ms, box-shadow 150ms',
      }}
    >
      {/* Left accent line */}
      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ background: priority.color, opacity: 0.6 }} />

      <div className="flex items-start gap-3 pl-3">
        {/* Status dot */}
        <div className="mt-1 shrink-0">
          <span className={`block w-2 h-2 rounded-full ${status.dot} ring-2 ring-current/20`} style={{ color: status.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-sm font-semibold leading-snug flex-1"
              style={{ color: isDone ? 'var(--text-3)' : 'var(--text)', textDecoration: isDone ? 'line-through' : 'none' }}>
              {task.title}
            </h3>
            {/* Actions */}
            <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
              {canEditDetails && (
                <button onClick={() => onEdit(task)}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: 'var(--text-3)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'}
                  title="Edit task details">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {canManage && (
                <button onClick={() => onDelete(task.id)}
                  className="p-1.5 rounded-lg hover:text-red-400 hover:bg-red-500/10 transition-all"
                  style={{ color: 'var(--text-3)' }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {task.description && (
            <p className="text-xs mb-2.5 line-clamp-1" style={{ color: 'var(--text-3)' }}>{task.description}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Priority badge */}
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ color: priority.color, background: priority.bg, border: `1px solid ${priority.color}25` }}>
                {priority.icon}{priority.label}
              </span>

              {/* Tags */}
              {task.tags.slice(0, 2).map(tag => (
                <span key={tag} className="flex items-center gap-0.5 text-[10px]" style={{ color: 'var(--text-3)' }}>
                  <Tag className="w-2.5 h-2.5" />{tag}
                </span>
              ))}

              {/* Due date */}
              {task.due_date && (
                <span className="flex items-center gap-1 text-[11px] font-medium"
                  style={{ color: isOverdue ? '#ef4444' : 'var(--text-3)' }}>
                  <Calendar className="w-2.5 h-2.5" />
                  {format(parseISO(task.due_date), 'MMM d')}
                  {isOverdue && ' ⚠'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Assignee */}
              {task.assignee_name
                ? <Avatar name={task.assignee_name} avatar={task.assignee_avatar} size={22} />
                : <div className="w-5 h-5 rounded-full border border-dashed" style={{ borderColor: 'var(--border-strong)' }} />}

              {/* Next status button */}
              {nextStatus && canProgress && !isDone && (
                <button
                  onClick={e => { e.stopPropagation(); onStatusChange(task, nextStatus); }}
                  className="flex items-center gap-0.5 text-[11px] font-semibold px-2 py-1 rounded-lg transition-all hover:scale-105"
                  style={{ color: STATUS_META[nextStatus].color, background: `${STATUS_META[nextStatus].color}15`, border: `1px solid ${STATUS_META[nextStatus].color}25` }}>
                  {STATUS_META[nextStatus].label}
                  <ChevronRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
