import api from './api';
import { Comment } from '../types';

export async function fetchComments(taskId: number): Promise<Comment[]> {
  const { data } = await api.get(`/tasks/${taskId}/comments`);
  return data.comments;
}

export async function addComment(taskId: number, content: string): Promise<Comment> {
  const { data } = await api.post(`/tasks/${taskId}/comments`, { content });
  return data.comment;
}

export async function deleteComment(taskId: number, commentId: number): Promise<void> {
  await api.delete(`/tasks/${taskId}/comments/${commentId}`);
}
