import api from './api';
import { Notification } from '../types';

export async function fetchNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const { data } = await api.get('/notifications');
  return data;
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.put('/notifications/read-all');
}
