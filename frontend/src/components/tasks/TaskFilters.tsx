import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { TaskFilters as Filters, User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  members?: User[];
}

function GlassSelect({ value, onChange, children, minWidth = 120 }: {
  value: string; onChange: (v: string) => void;
  children: React.ReactNode; minWidth?: number;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="theme-select"
        style={{ minWidth }}
      >
        {children}
      </select>
      <ChevronDown
        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
        style={{ color: 'var(--text-3)' }}
      />
    </div>
  );
}

export default function TaskFilters({ filters, onChange, members = [] }: Props) {
  const { canManage } = useAuth();
  function set(key: keyof Filters, value: string | number | '') {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2.5">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} />
        <input
          type="text"
          value={filters.search || ''}
          onChange={e => set('search', e.target.value)}
          placeholder="Search tasks…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.8)',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Filter row */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-3)' }}>
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </div>

        <GlassSelect value={filters.status || ''} onChange={v => set('status', v)} minWidth={170}>
          <option value="">All Stages</option>
          <option value="new_request">📋 New Request</option>
          <option value="under_review">🔍 Under Review</option>
          <option value="concept_design">✏️ Concept Design</option>
          <option value="structural_design">🏗️ Structural Design</option>
          <option value="shop_drawings">📐 Shop Drawings</option>
          <option value="internal_review">👁️ Internal Review</option>
          <option value="client_review">🤝 Client Review</option>
          <option value="revisions">🔄 Revisions</option>
          <option value="approved">✅ Approved</option>
          <option value="issued">🏭 Issued to Factory</option>
        </GlassSelect>

        <GlassSelect value={filters.priority || ''} onChange={v => set('priority', v)}>
          <option value="">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </GlassSelect>

        {canManage && members.length > 0 && (
          <GlassSelect value={String(filters.assigned_to || '')} onChange={v => set('assigned_to', v ? Number(v) : '')} minWidth={140}>
            <option value="">All Members</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </GlassSelect>
        )}

        <GlassSelect
          value={`${filters.sort || 'created_at'}:${filters.order || 'desc'}`}
          onChange={v => { const [sort, order] = v.split(':'); onChange({ ...filters, sort, order: order as 'asc' | 'desc' }); }}
          minWidth={150}
        >
          <option value="created_at:desc">Newest First</option>
          <option value="created_at:asc">Oldest First</option>
          <option value="due_date:asc">Due Date ↑</option>
          <option value="due_date:desc">Due Date ↓</option>
          <option value="title:asc">Title A–Z</option>
          <option value="priority:desc">Priority ↓</option>
        </GlassSelect>
      </div>
    </div>
  );
}
