import api from './api';
import { ActivityLog } from '../types';

export async function fetchActivity(limit = 30): Promise<ActivityLog[]> {
  const { data } = await api.get(`/activity?limit=${limit}`);
  return data.logs;
}

export async function fetchTaskActivity(taskId: number): Promise<ActivityLog[]> {
  const { data } = await api.get(`/tasks/${taskId}/activity`);
  return data.logs;
}
