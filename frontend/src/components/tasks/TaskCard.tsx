import { Task } from '../../types';
import { Calendar, Tag, Trash2, Edit2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (task: Task, status: Task['status']) => void;
}

const priorityStyles = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusIcons = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
};

const statusColors = {
  todo: 'text-gray-400',
  in_progress: 'text-blue-500',
  done: 'text-green-500',
};

const nextStatus: Record<Task['status'], Task['status']> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: Props) {
  const StatusIcon = statusIcons[task.status];
  const isOverdue = task.due_date && task.status !== 'done' && isPast(parseISO(task.due_date));

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow group ${task.status === 'done' ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onStatusChange(task, nextStatus[task.status])}
          className={`mt-0.5 shrink-0 ${statusColors[task.status]} hover:scale-110 transition-transform`}
          title={`Mark as ${nextStatus[task.status]}`}
        >
          <StatusIcon className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-sm font-medium text-gray-900 dark:text-white leading-snug ${task.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
              {task.title}
            </h3>
            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(task)}
                className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 rounded text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center flex-wrap gap-2 mt-2.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}>
              {task.priority}
            </span>

            {task.due_date && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                <Calendar className="w-3 h-3" />
                {format(parseISO(task.due_date), 'MMM d, yyyy')}
                {isOverdue && ' (overdue)'}
              </span>
            )}

            {task.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
