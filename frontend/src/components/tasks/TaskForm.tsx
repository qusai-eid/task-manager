import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Tag } from 'lucide-react';
import { Task, User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  task?: Task | null;
  members?: User[];
  onSubmit: (data: Partial<Task>) => Promise<void>;
  onCancel: () => void;
}

export default function TaskForm({ task, members = [], onSubmit, onCancel }: Props) {
  const { canManage } = useAuth();
  const [title,      setTitle]      = useState('');
  const [description,setDescription]= useState('');
  const [status,     setStatus]     = useState<Task['status']>('new_request');
  const [priority,   setPriority]   = useState<Task['priority']>('medium');
  const [dueDate,    setDueDate]    = useState('');
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [tagInput,   setTagInput]   = useState('');
  const [tags,       setTags]       = useState<string[]>([]);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title); setDescription(task.description || '');
      setStatus(task.status); setPriority(task.priority);
      setDueDate(task.due_date ? task.due_date.slice(0, 10) : '');
      setAssignedTo(task.assigned_to); setTags(task.tags || []);
    }
  }, [task]);

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit({ title, description: description || null, status, priority, due_date: dueDate || null, tags, assigned_to: assignedTo }); }
    finally { setLoading(false); }
  }

  const FIELD = 'flex flex-col gap-1.5';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'var(--overlay-bg)', backdropFilter: 'blur(8px)' }}
        onClick={e => e.target === e.currentTarget && onCancel()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="modal-content w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col rounded-2xl"
          style={{ background: 'var(--modal-bg)', border: '1px solid var(--modal-border)', boxShadow: 'var(--modal-shadow)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>{task ? 'Edit Task' : 'Create Task'}</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{task ? 'Update task details' : 'Add a new task to the board'}</p>
            </div>
            <button onClick={onCancel} className="btn-ghost p-2 rounded-xl">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
            <div className="px-6 py-5 space-y-4">
              <div className={FIELD}>
                <label className="label">Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                  className="input-field" placeholder="Describe the design task…" />
              </div>

              <div className={FIELD}>
                <label className="label">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  className="input-field" style={{ resize: 'none', lineHeight: 1.6 }} placeholder="Add context, references, or requirements…" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={FIELD}>
                  <label className="label">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as Task['status'])} className="input-field">
                    <option value="new_request">📋 New Request</option>
                    <option value="under_review">🔍 Under Review</option>
                    <option value="concept_design">✏️ Concept Design</option>
                    <option value="structural_design">🏗️ Structural Design</option>
                    <option value="shop_drawings">📐 Shop Drawings</option>
                    <option value="internal_review">👁️ Internal Review</option>
                    <option value="client_review">🤝 Client Review</option>
                    <option value="revisions">🔄 Revisions</option>
                    {canManage && <option value="approved">✅ Approved for Production</option>}
                    {canManage && <option value="issued">🏭 Issued to Factory</option>}
                  </select>
                </div>
                <div className={FIELD}>
                  <label className="label">Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value as Task['priority'])} className="input-field">
                    <option value="urgent">🔴 Urgent</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={FIELD}>
                  <label className="label">Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-field" />
                </div>
                {canManage && members.length > 0 && (
                  <div className={FIELD}>
                    <label className="label">Assign To</label>
                    <select value={assignedTo || ''} onChange={e => setAssignedTo(e.target.value ? Number(e.target.value) : null)} className="input-field">
                      <option value="">Unassigned</option>
                      {members.filter(m => m.status === 'active').map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className={FIELD}>
                <label className="label">Tags</label>
                <div className="flex gap-2">
                  <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    className="input-field" style={{ flex: 1 }} placeholder="Add tag + Enter" />
                  <button type="button" onClick={addTag}
                    className="px-3 rounded-xl transition-colors"
                    style={{ background: 'var(--elevated-bg)', border: '1px solid var(--elevated-border)', color: 'var(--text-3)' }}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: 'var(--tag-bg)', border: '1px solid var(--tag-border)', color: 'var(--tag-color)' }}>
                        <Tag className="w-2.5 h-2.5" />{tag}
                        <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}
                          className="ml-0.5 hover:text-red-400 transition-colors">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
              <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Saving…</span>
                  : task ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
