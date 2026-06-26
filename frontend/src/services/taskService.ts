import api from './api';
import { Task, TaskFilters, Analytics, KanbanBoard } from '../types';

export async function fetchTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v !== '' && v !== undefined) params.set(k, String(v)); });
  const { data } = await api.get(`/tasks?${params}`);
  return data.tasks;
}

export async function fetchTask(id: number): Promise<Task> {
  const { data } = await api.get(`/tasks/${id}`);
  return data.task;
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  const { data } = await api.post('/tasks', task);
  return data.task;
}

export async function updateTask(id: number, task: Partial<Task> & { status?: string }): Promise<Task> {
  const { data } = await api.put(`/tasks/${id}`, task);
  return data.task;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function fetchKanban(): Promise<KanbanBoard> {
  const { data } = await api.get('/tasks/kanban');
  return data.board;
}

export async function fetchAnalytics(): Promise<Analytics> {
  const { data } = await api.get('/tasks/analytics');
  return data.analytics;
}
