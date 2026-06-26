import { useState, useEffect, useCallback } from 'react';
import { Plus, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskForm from '../components/tasks/TaskForm';
import TaskDetail from '../components/tasks/TaskDetail';
import { Task, KanbanBoard as Board, TaskStatus, User } from '../types';
import { fetchKanban, createTask, updateTask } from '../services/taskService';
import { fetchMembers } from '../services/memberService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function KanbanPage() {
  const { canManage } = useAuth();
  const [board, setBoard] = useState<Board | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [openTask, setOpenTask] = useState<Task | null>(null);

  const loadBoard = useCallback(async () => {
    setLoading(true);
    try { setBoard(await fetchKanban()); }
    catch { toast.error('Failed to load board'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadBoard(); }, [loadBoard]);
  useEffect(() => {
    if (canManage) fetchMembers().then(setMembers).catch(() => {});
  }, [canManage]);

  async function handleCreate(data: Partial<Task>) {
    try {
      await createTask(data);
      await loadBoard();
      setShowForm(false);
      toast.success('Task created!');
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed to create task'); }
  }

  async function handleUpdate(data: Partial<Task>) {
    if (!editTask) return;
    try {
      await updateTask(editTask.id, data);
      await loadBoard();
      setEditTask(null);
      toast.success('Task updated!');
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed to update task'); }
  }

  async function handleStatusChange(task: Task, status: TaskStatus) {
    try {
      await updateTask(task.id, { status });
      await loadBoard();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Cannot move task'); }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><span className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>;
  }

  const total = board ? Object.values(board).flat().length : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Design Workflow Board</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>{total} total tasks across {10} stages</p>
        </div>
        <div className="flex gap-2">
          <Link to="/tasks" className="btn-secondary flex items-center gap-2 text-sm">
            <List className="w-4 h-4" /><span className="hidden sm:inline">List View</span>
          </Link>
          {canManage && (
            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /><span className="hidden sm:inline">New Task</span>
            </button>
          )}
        </div>
      </div>

      {board && (
        <KanbanBoard
          board={board}
          onEdit={t => setEditTask(t)}
          onOpen={t => setOpenTask(t)}
          onStatusChange={handleStatusChange}
        />
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
