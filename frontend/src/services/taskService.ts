import api from './api';
import { Task, TaskFilters, Analytics } from '../types';

export async function fetchTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.search) params.set('search', filters.search);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.order) params.set('order', filters.order);
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

export async function updateTask(id: number, task: Partial<Task>): Promise<Task> {
  const { data } = await api.put(`/tasks/${id}`, task);
  return data.task;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function fetchAnalytics(): Promise<Analytics> {
  const { data } = await api.get('/tasks/analytics');
  return data.analytics;
}
