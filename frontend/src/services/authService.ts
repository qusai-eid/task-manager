import api from './api';
import { User } from '../types';

export async function registerUser(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: User }> {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}
