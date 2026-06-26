import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Tag, Clock, MessageSquare, Activity, Paperclip } from 'lucide-react';
import { Task, Comment, ActivityLog, TaskFile } from '../../types';
import { fetchComments, addComment, deleteComment } from '../../services/commentService';
import { fetchTaskActivity } from '../../services/activityService';
import { getTaskFiles } from '../../services/fileService';
import { PRIORITY_META, STATUS_META, Avatar } from './TaskCard';
import FileUpload from './FileUpload';
import VersionHistory from './VersionHistory';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ACTION_ICONS: Record<string, string> = {
  task_created: '✨', task_assigned: '👤', status_changed: '🔄',
  task_completed: '✅', task_closed: '🔒', comment_added: '💬',
  file_uploaded: '📎', file_deleted: '🗑️',
};

type Tab = 'comments' | 'files' | 'activity';

interface Props {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
}

export default function TaskDetail({ task, onClose, onEdit }: Props) {
  const { user, canManage } = useAuth();
  const [comments,  setComments]  = useState<Comment[]>([]);
  const [activity,  setActivity]  = useState<ActivityLog[]>([]);
  const [files,     setFiles]     = useState<TaskFile[]>([]);
  const [tab,       setTab]       = useState<Tab>('comments');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments(task.id).then(setComments).catch(() => {});
    fetchTaskActivity(task.id).then(setActivity).catch(() => {});
    getTaskFiles(task.id).then(setFiles).catch(() => {});
  }, [task.id]);

  async function handleAddComment() {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const c = await addComment(task.id, newComment.trim());
      setComments(p => [...p, c]);
      setNewComment('');
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  }

  const latestVersion = files.length > 0
    ? { major: files[0].version_major, minor: files[0].version_minor }
    : null;

  const priority = PRIORITY_META[task.priority];
  const status   = STATUS_META[task.status];

  const TABS: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'comments', label: 'Comments', icon: MessageSquare, count: comments.length },
    { id: 'files',    label: 'Files',    icon: Paperclip,     count: files.length    },
    { id: 'activity', label: 'Activity', icon: Activity,       count: activity.length },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'var(--overlay-bg)', backdropFilter: 'blur(12px)' }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="modal-content w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
          style={{ background: 'var(--modal-bg)', border: '1px solid var(--modal-border)', boxShadow: 'var(--modal-shadow)' }}
        >
          {/* Header */}
          <div className="px-6 py-5" style={{ background: 'var(--section-header)', borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ color: status.color, background: `${status.color}15`, border: `1px solid ${status.color}25` }}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${status.dot} mr-1.5`} />
                    {status.label}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                    style={{ color: priority.color, background: priority.bg, border: `1px solid ${priority.color}25` }}>
                    {priority.icon}{priority.label}
                  </span>
                  {files.length > 0 && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                      style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
                      <Paperclip className="w-2.5 h-2.5" />
                      v{files[0].version_major}.{files[0].version_minor}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">{task.title}</h2>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {canManage && (
                  <button onClick={onEdit} className="btn-secondary text-xs px-3 py-1.5">Edit Task</button>
                )}
                <button onClick={onClose} className="btn-ghost p-2 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-5">
              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: User,     label: 'Assigned to', content: task.assignee_name
                    ? <div className="flex items-center gap-1.5"><Avatar name={task.assignee_name} avatar={task.assignee_avatar} size={20} /><span className="text-white/80 text-xs font-medium">{task.assignee_name}</span></div>
                    : <span className="text-white/25 text-xs">Unassigned</span> },
                  { icon: User,     label: 'Created by', content: <div className="flex items-center gap-1.5"><Avatar name={task.creator_name} avatar={task.creator_avatar} size={20} /><span className="text-white/80 text-xs font-medium">{task.creator_name}</span></div> },
                  { icon: Calendar, label: 'Due date',   content: <span className="text-white/70 text-xs font-medium">{task.due_date ? format(parseISO(task.due_date), 'MMM d, yyyy') : '—'}</span> },
                  { icon: Clock,    label: 'Created',    content: <span className="text-white/70 text-xs font-medium">{format(parseISO(task.created_at), 'MMM d, yyyy')}</span> },
                ].map(({ icon: Icon, label, content }) => (
                  <div key={label} className="flex items-start gap-2.5 p-3 rounded-xl"
                    style={{ background: 'var(--subtle-bg)', border: '1px solid var(--subtle-border)' }}>
                    <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--text-3)' }} />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider mb-1 font-semibold" style={{ color: 'var(--text-3)' }}>{label}</p>
                      {content}
                    </div>
                  </div>
                ))}
              </div>

              {task.description && (
                <div className="p-4 rounded-xl"
                  style={{ background: 'var(--subtle-bg)', border: '1px solid var(--subtle-border)' }}>
                  <p className="text-[10px] uppercase tracking-wider mb-2 font-semibold" style={{ color: 'var(--text-3)' }}>Description</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{task.description}</p>
                </div>
              )}

              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-white/25 mt-1" />
                  {task.tags.map(tag => (
                    <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--tag-bg)', border: '1px solid var(--tag-border)', color: 'var(--tag-color)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div>
                <div className="flex mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  {TABS.map(({ id, label, icon: Icon, count }) => (
                    <button key={id} onClick={() => setTab(id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-all ${
                        tab === id ? 'border-violet-500 text-violet-400' : 'border-transparent text-white/30 hover:text-white/60'
                      }`}>
                      <Icon className="w-4 h-4" />{label}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{
                          background: tab === id ? 'rgba(139,92,246,0.2)' : 'var(--subtle-bg)',
                          color: tab === id ? 'var(--accent)' : 'var(--text-3)',
                        }}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Comments */}
                {tab === 'comments' && (
                  <div className="space-y-3">
                    {comments.map(c => (
                      <div key={c.id} className="flex gap-3">
                        <Avatar name={c.author_name} avatar={c.author_avatar} size={28} />
                        <div className="flex-1">
                          <div className="rounded-xl px-3.5 py-3"
                            style={{ background: 'var(--elevated-bg)', border: '1px solid var(--elevated-border)' }}>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{c.author_name}</span>
                              <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{format(parseISO(c.created_at), 'MMM d, HH:mm')}</span>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{c.content}</p>
                          </div>
                          {(c.user_id === user?.id || canManage) && (
                            <button
                              onClick={() => { deleteComment(task.id, c.id); setComments(p => p.filter(x => x.id !== c.id)); }}
                              className="text-[10px] text-white/20 hover:text-red-400 mt-1 ml-1 transition-colors">
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-3 mt-4">
                      <Avatar name={user?.name || '?'} avatar={user?.avatar} size={28} />
                      <div className="flex-1 flex gap-2">
                        <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                          placeholder="Add a comment…"
                          className="input-field" style={{ flex: 1, padding: '0.5rem 0.875rem' }} />
                        <button onClick={handleAddComment} disabled={submitting || !newComment.trim()} className="btn-primary px-4 text-sm">Post</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Files */}
                {tab === 'files' && (
                  <div className="space-y-5">
                    {/* Upload section */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold mb-2.5" style={{ color: 'var(--text-3)' }}>
                        {files.length === 0 ? 'Upload Initial Files' : 'Upload New Version'}
                      </p>
                      <FileUpload
                        taskId={task.id}
                        latestVersion={latestVersion}
                        onUploaded={newFile => setFiles(prev => [newFile, ...prev])}
                      />
                    </div>

                    {/* Version history */}
                    <VersionHistory
                      taskId={task.id}
                      files={files}
                      onDeleted={fileId => setFiles(prev => prev.filter(f => f.id !== fileId))}
                    />
                  </div>
                )}

                {/* Activity */}
                {tab === 'activity' && (
                  <div className="space-y-2">
                    {activity.map(log => (
                      <div key={log.id} className="flex items-start gap-3 py-2">
                        <span className="text-base shrink-0 mt-0.5">{ACTION_ICONS[log.action] || '•'}</span>
                        <div>
                          <p className="text-sm text-white/60">{log.details}</p>
                          <p className="text-[10px] text-white/25 mt-0.5">
                            {format(parseISO(log.created_at), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {!activity.length && <p className="text-sm text-white/25 text-center py-4">No activity yet</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
