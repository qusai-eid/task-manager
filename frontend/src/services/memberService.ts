import api from './api';
import { User } from '../types';

export async function fetchMembers(): Promise<User[]> {
  const { data } = await api.get('/members');
  return data.members;
}

export async function fetchMember(id: number): Promise<User> {
  const { data } = await api.get(`/members/${id}`);
  return data.member;
}

export async function createMember(member: Partial<User> & { password?: string }): Promise<User> {
  const { data } = await api.post('/members', member);
  return data.member;
}

export async function updateMember(id: number, updates: Partial<User> & { password?: string }): Promise<User> {
  const { data } = await api.put(`/members/${id}`, updates);
  return data.member;
}

export async function deleteMember(id: number): Promise<void> {
  await api.delete(`/members/${id}`);
}

export async function fetchMemberStats(id: number): Promise<{ total: number; completed: number; in_progress: number; todo: number; overdue: number }> {
  const { data } = await api.get(`/members/${id}/stats`);
  return data.stats;
}
