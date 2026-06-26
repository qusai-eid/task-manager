import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function askMila(messages: ChatMessage[]): Promise<string> {
  const { data } = await api.post('/ai/chat', { messages });
  return data.message as string;
}
