import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import TaskList from '../components/tasks/TaskList';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskForm from '../components/tasks/TaskForm';
import { Task, TaskFilters as Filters } from '../types';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import toast from 'react-hot-toast';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTasks(filters);
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleCreate(data: Partial<Task>) {
    try {
      const task = await createTask(data);
      setTasks(prev => [task, ...prev]);
      setShowForm(false);
      toast.success('Task created!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    }
  }

  async function handleUpdate(data: Partial<Task>) {
    if (!editTask) return;
    try {
      const updated = await updateTask(editTask.id, data);
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      setEditTask(null);
      toast.success('Task updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update task');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  }

  async function handleStatusChange(task: Task, status: Task['status']) {
    try {
      const updated = await updateTask(task.id, { status });
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch {
      toast.error('Failed to update status');
    }
  }

  const activeTasks = tasks.filter(t => t.status !== 'done');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {activeTasks.length} active
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>

      <TaskFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <span className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {activeTasks.length > 0 && (
            <TaskList
              tasks={activeTasks}
              onEdit={task => setEditTask(task)}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          )}

          {doneTasks.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                Completed ({doneTasks.length})
                <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </h2>
              <TaskList
                tasks={doneTasks}
                onEdit={task => setEditTask(task)}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}

          {tasks.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No tasks yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "New Task" to create your first one</p>
            </div>
          )}
        </div>
      )}

      {(showForm || editTask) && (
        <TaskForm
          task={editTask}
          onSubmit={editTask ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditTask(null); }}
        />
      )}
    </div>
  );
}
