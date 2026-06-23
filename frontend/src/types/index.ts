export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  total: number;
  todo: number;
  in_progress: number;
  done: number;
  overdue: number;
  low: number;
  medium: number;
  high: number;
  recentActivity: { date: string; created: number }[];
}

export interface TaskFilters {
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
