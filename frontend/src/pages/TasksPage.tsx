import { useState, useEffect, useCallback } from 'react';
import { Plus, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import TaskList from '../components/tasks/TaskList';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskForm from '../components/tasks/TaskForm';
import TaskDetail from '../components/tasks/TaskDetail';
import { Task, TaskFilters as Filters, User, TaskStatus } from '../types';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { fetchMembers } from '../services/memberService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function TasksPage() {
  const { canManage } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [openTask, setOpenTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try { setTasks(await fetchTasks(filters)); }
    catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  useEffect(() => {
    if (canManage) fetchMembers().then(setMembers).catch(() => {});
  }, [canManage]);

  async function handleCreate(data: Partial<Task>) {
    try {
      const task = await createTask(data);
      setTasks(prev => [task, ...prev]);
      setShowForm(false);
      toast.success('Task created!');
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed to create task'); }
  }

  async function handleUpdate(data: Partial<Task>) {
    if (!editTask) return;
    try {
      const updated = await updateTask(editTask.id, data);
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      if (openTask?.id === updated.id) setOpenTask(updated);
      setEditTask(null);
      toast.success('Task updated!');
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed to update task'); }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      if (openTask?.id === id) setOpenTask(null);
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  }

  async function handleStatusChange(task: Task, status: TaskStatus) {
    try {
      const updated = await updateTask(task.id, { status });
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      if (openTask?.id === updated.id) setOpenTask(updated);
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed to update status'); }
  }

  const DONE_STATUSES: string[] = ['approved', 'issued'];
  const doneTasks   = tasks.filter(t => DONE_STATUSES.includes(t.status));
  const activeTasks = tasks.filter(t => !DONE_STATUSES.includes(t.status));

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Tasks</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>{tasks.length} tasks · {activeTasks.length} active</p>
        </div>
        <div className="flex gap-2">
          <Link to="/kanban" className="btn-secondary flex items-center gap-2 text-sm">
            <LayoutGrid className="w-4 h-4" /><span className="hidden sm:inline">Kanban</span>
          </Link>
          {canManage && (
            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /><span className="hidden sm:inline">New Task</span>
            </button>
          )}
        </div>
      </div>

      <TaskFilters filters={filters} onChange={setFilters} members={members} />

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <span className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {activeTasks.length > 0 && (
            <TaskList tasks={activeTasks} onEdit={t => setEditTask(t)} onDelete={handleDelete}
              onStatusChange={handleStatusChange} onOpen={t => setOpenTask(t)} />
          )}
          {doneTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>Approved &amp; Issued ({doneTasks.length})</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              <TaskList tasks={doneTasks} onEdit={t => setEditTask(t)} onDelete={handleDelete}
                onStatusChange={handleStatusChange} onOpen={t => setOpenTask(t)} />
            </div>
          )}
          {tasks.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Plus className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No tasks found</p>
              <p className="text-sm mt-1">Try adjusting your filters or create a new task</p>
            </div>
          )}
        </div>
      )}

      {(showForm || editTask) && (
        <TaskForm task={editTask} members={members}
          onSubmit={editTask ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditTask(null); }} />
      )}

      {openTask && (
        <TaskDetail task={openTask} onClose={() => setOpenTask(null)}
          onEdit={() => { setEditTask(openTask); setOpenTask(null); }} />
      )}
    </div>
  );
}
