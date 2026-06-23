import { Search, SlidersHorizontal } from 'lucide-react';
import { TaskFilters as Filters } from '../../types';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function TaskFilters({ filters, onChange }: Props) {
  function set(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={filters.search || ''}
          onChange={e => set('search', e.target.value)}
          placeholder="Search tasks…"
          className="input-field pl-9"
        />
      </div>

      <div className="flex gap-2">
        <div className="relative">
          <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={filters.status || ''}
            onChange={e => set('status', e.target.value)}
            className="input-field pl-8 pr-8 appearance-none cursor-pointer min-w-[120px]"
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <select
          value={filters.priority || ''}
          onChange={e => set('priority', e.target.value)}
          className="input-field appearance-none cursor-pointer min-w-[120px]"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={`${filters.sort || 'created_at'}:${filters.order || 'desc'}`}
          onChange={e => {
            const [sort, order] = e.target.value.split(':');
            onChange({ ...filters, sort, order: order as 'asc' | 'desc' });
          }}
          className="input-field appearance-none cursor-pointer min-w-[130px]"
        >
          <option value="created_at:desc">Newest First</option>
          <option value="created_at:asc">Oldest First</option>
          <option value="due_date:asc">Due Date ↑</option>
          <option value="due_date:desc">Due Date ↓</option>
          <option value="title:asc">Title A–Z</option>
          <option value="priority:desc">Priority ↓</option>
        </select>
      </div>
    </div>
  );
}
