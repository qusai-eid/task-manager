import { motion } from 'framer-motion';
import { Task, TaskStatus, KanbanBoard as KanbanBoardType } from '../../types';
import { PRIORITY_META, STATUS_META, STATUS_NEXT, Avatar } from './TaskCard';
import { Calendar, Edit2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

const STATUSES: TaskStatus[] = [
  'new_request', 'under_review', 'concept_design', 'structural_design',
  'shop_drawings', 'internal_review', 'client_review', 'revisions',
  'approved', 'issued',
];

const PREV_STATUS: Partial<Record<TaskStatus, TaskStatus>> = {
  under_review:      'new_request',
  concept_design:    'under_review',
  structural_design: 'concept_design',
  shop_drawings:     'structural_design',
  internal_review:   'shop_drawings',
  client_review:     'internal_review',
  revisions:         'client_review',
  approved:          'revisions',
  issued:            'approved',
};

// Statuses that require manager/admin to enter
const MANAGER_ONLY = new Set<TaskStatus>(['approved', 'issued']);

const COLUMN_HEADER: Record<TaskStatus, string> = {
  new_request:       'New Requests',
  under_review:      'Under Review',
  concept_design:    'Concept Design',
  structural_design: 'Structural Design',
  shop_drawings:     'Shop Drawings',
  internal_review:   'Internal Review',
  client_review:     'Client / Consultant Review',
  revisions:         'Revisions',
  approved:          'Approved for Production',
  issued:            'Issued to Factory',
};

const COLUMN_ICON: Record<TaskStatus, string> = {
  new_request:       '📋',
  under_review:      '🔍',
  concept_design:    '✏️',
  structural_design: '🏗️',
  shop_drawings:     '📐',
  internal_review:   '👁️',
  client_review:     '🤝',
  revisions:         '🔄',
  approved:          '✅',
  issued:            '🏭',
};

const COLUMN_COLOR: Record<TaskStatus, string> = {
  new_request:       '#94a3b8',
  under_review:      '#f59e0b',
  concept_design:    '#3b82f6',
  structural_design: '#6366f1',
  shop_drawings:     '#8b5cf6',
  internal_review:   '#f97316',
  client_review:     '#06b6d4',
  revisions:         '#ef4444',
  approved:          '#10b981',
  issued:            '#059669',
};

interface Props {
  board: KanbanBoardType;
  onEdit: (task: Task) => void;
  onOpen: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onNewTask?: () => void;
}

function KanbanCard({ task, onEdit, onOpen, onStatusChange }: {
  task: Task;
  onEdit: (t: Task) => void;
  onOpen: (t: Task) => void;
  onStatusChange: (t: Task, s: TaskStatus) => void;
}) {
  const { canManage, user } = useAuth();
  const canEditDetails = canManage;
  const canProgress    = canManage || task.assigned_to === user?.id;
  const isOverdue = task.due_date
    && !['approved', 'issued'].includes(task.status)
    && isPast(parseISO(task.due_date));
  const priority = PRIORITY_META[task.priority];
  const prev = PREV_STATUS[task.status];
  const next = STATUS_NEXT[task.status];
  const canAdvance = next ? (!MANAGER_ONLY.has(next) || canManage) : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px ${COLUMN_COLOR[task.status]}45` }}
      onClick={() => onOpen(task)}
      className="relative rounded-xl p-3.5 cursor-pointer group shine-hover"
      style={{
        background: 'var(--elevated-bg)',
        border: '1px solid var(--elevated-border)',
        boxShadow: 'var(--elevated-shadow)',
        transition: 'border-color 150ms, box-shadow 150ms',
      }}
    >
      {/* Priority accent bar */}
      <div className="absolute top-0 left-4 right-4 h-0.5 rounded-full"
        style={{ background: priority.color, opacity: 0.5 }} />

      <div className="flex items-start justify-between gap-1.5 mt-1 mb-2">
        <p className="text-xs font-semibold leading-snug flex-1" style={{ color: 'var(--text)' }}>
          {task.title}
        </p>
        {canEditDetails && (
          <button
            onClick={e => { e.stopPropagation(); onEdit(task); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all shrink-0"
            style={{ color: 'var(--text-3)' }}
            title="Edit task details"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {task.description && (
        <p className="text-[11px] mb-2.5 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-3)' }}>
          {task.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
          style={{ color: priority.color, background: priority.bg }}>
          {priority.icon}{priority.label}
        </span>
        {task.due_date && (
          <span className={`text-[10px] flex items-center gap-0.5 font-medium ${isOverdue ? 'text-red-400' : ''}`}
            style={isOverdue ? {} : { color: 'var(--text-3)' }}>
            <Calendar className="w-2.5 h-2.5" />
            {format(parseISO(task.due_date), 'MMM d')}
            {isOverdue && ' ⚠'}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        {task.assignee_name
          ? <div className="flex items-center gap-1.5">
              <Avatar name={task.assignee_name} avatar={task.assignee_avatar} size={20} />
              <span className="text-[10px] max-w-[80px] truncate" style={{ color: 'var(--text-3)' }}>
                {task.assignee_name}
              </span>
            </div>
          : <div className="w-5 h-5 rounded-full border border-dashed" style={{ borderColor: 'var(--border)' }} />}
      </div>

      {/* Move buttons */}
      {canProgress && (prev || (next && canAdvance)) && (
        <div className="flex gap-1.5 mt-3 pt-2.5" style={{ borderTop: '1px solid var(--border)' }}
          onClick={e => e.stopPropagation()}>
          {prev && (
            <button
              onClick={() => onStatusChange(task, prev)}
              className="flex-1 flex items-center justify-center gap-0.5 text-[10px] font-medium py-1 rounded-lg transition-all"
              style={{ color: 'var(--text-3)', background: 'var(--surface-2)' }}
            >
              <ChevronLeft className="w-3 h-3" />{STATUS_META[prev].label}
            </button>
          )}
          {next && canAdvance && (
            <button
              onClick={() => onStatusChange(task, next)}
              className="flex-1 flex items-center justify-center gap-0.5 text-[10px] font-semibold py-1 rounded-lg transition-all hover:scale-105"
              style={{ color: STATUS_META[next].color, background: `${STATUS_META[next].color}14`,
                border: `1px solid ${STATUS_META[next].color}25` }}
            >
              {STATUS_META[next].label}<ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function KanbanBoard({ board, onEdit, onOpen, onStatusChange, onNewTask }: Props) {
  const { canManage } = useAuth();

  return (
    <div className="flex gap-3.5 overflow-x-auto pb-4">
      {STATUSES.map((status, idx) => {
        const tasks = board[status] || [];
        const color = COLUMN_COLOR[status];
        const isGate = MANAGER_ONLY.has(status); // approval gate columns

        return (
          <motion.div
            key={status}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: idx * 0.03, ease: 'easeOut' }}
            className="flex-none w-64 flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: 'var(--elevated-bg)',
              border: `1px solid ${color}28`,
              minHeight: 480,
              boxShadow: isGate
                ? `0 0 0 1px ${color}30, 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)`
                : 'var(--elevated-shadow)',
            }}
          >
            {/* Column header */}
            <div className="px-3.5 py-3"
              style={{
                borderBottom: `1px solid ${color}25`,
                background: `linear-gradient(to bottom, ${color}12, transparent)`,
              }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm shrink-0">{COLUMN_ICON[status]}</span>
                  <span className="text-xs font-bold truncate" style={{ color: 'var(--text)' }}>
                    {COLUMN_HEADER[status]}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ color, background: `${color}15`, border: `1px solid ${color}25` }}>
                    {tasks.length}
                  </span>
                  {status === 'new_request' && canManage && onNewTask && (
                    <button onClick={onNewTask}
                      className="p-1 rounded-lg transition-all"
                      style={{ color, background: `${color}10` }}>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stage progress indicator */}
              <div className="mt-2 flex gap-0.5">
                {STATUSES.map((s, i) => (
                  <div key={s} className="flex-1 h-0.5 rounded-full transition-all"
                    style={{ background: i <= idx ? color : 'var(--surface-3)', opacity: i === idx ? 1 : 0.4 }} />
                ))}
              </div>

              {isGate && (
                <p className="text-[9px] font-semibold mt-1.5 uppercase tracking-widest"
                  style={{ color }}>
                  Manager approval required
                </p>
              )}
            </div>

            {/* Cards */}
            <div className="flex-1 p-2.5 space-y-2 overflow-y-auto">
              {tasks.map(task => (
                <KanbanCard key={task.id} task={task}
                  onEdit={onEdit} onOpen={onOpen} onStatusChange={onStatusChange} />
              ))}
              {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-24 rounded-xl gap-1.5"
                  style={{ border: `1px dashed ${color}25` }}>
                  <span className="text-lg opacity-30">{COLUMN_ICON[status]}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>No tasks</span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
