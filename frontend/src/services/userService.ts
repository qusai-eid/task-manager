import api from './api';
import { User } from '../types';

export async function getProfile(): Promise<User> {
  const { data } = await api.get('/users/profile');
  return data.user;
}

export async function updateProfile(updates: {
  name?: string;
  bio?: string | null;
  avatar?: string | null;
  currentPassword?: string;
  newPassword?: string;
}): Promise<User> {
  const { data } = await api.put('/users/profile', updates);
  return data.user;
}

export async function removeAvatar(): Promise<User> {
  const { data } = await api.delete('/users/avatar');
  return data.user;
}
