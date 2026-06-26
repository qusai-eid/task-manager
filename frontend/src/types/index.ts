export type TaskStatus =
  | 'new_request'
  | 'under_review'
  | 'concept_design'
  | 'structural_design'
  | 'shop_drawings'
  | 'internal_review'
  | 'client_review'
  | 'revisions'
  | 'approved'
  | 'issued';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type UserRole = 'admin' | 'manager' | 'member';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  tags: string[];
  created_by: number;
  assigned_to: number | null;
  creator_name: string;
  creator_avatar: string | null;
  assignee_name: string | null;
  assignee_avatar: string | null;
  assignee_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
}

export interface ActivityLog {
  id: number;
  task_id: number | null;
  user_id: number;
  action: string;
  details: string | null;
  created_at: string;
  user_name: string;
  user_avatar: string | null;
  task_title: string | null;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: number;
  task_id: number | null;
  task_title: string | null;
  created_at: string;
}

export interface Analytics {
  total: number;
  overdue: number;
  totalMembers: number;
  todo: number;
  in_progress: number;
  review: number;
  completed: number;
  closed: number;
  low: number;
  medium: number;
  high: number;
  urgent: number;
  byMember: { name: string; avatar: string | null; total: number; completed: number }[];
  weeklyCompletion: { date: string; completed: number }[];
}

export interface TaskFilters {
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  search?: string;
  assigned_to?: number | '';
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface KanbanBoard {
  new_request:       Task[];
  under_review:      Task[];
  concept_design:    Task[];
  structural_design: Task[];
  shop_drawings:     Task[];
  internal_review:   Task[];
  client_review:     Task[];
  revisions:         Task[];
  approved:          Task[];
  issued:            Task[];
}

export interface TaskFile {
  id: number;
  task_id: number;
  original_name: string;
  stored_name: string;
  mime_type: string;
  file_size: number;
  version_major: number;
  version_minor: number;
  stage: string;
  change_notes: string | null;
  uploaded_by: number;
  created_at: string;
  uploader_name: string;
  uploader_avatar: string | null;
}

export type OnlineStatus = 'online' | 'away' | 'offline';

export interface MemberKPI {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
  onlineStatus: OnlineStatus;
  lastSeen: string | null;
  memberSince: string;
  totalAssigned: number;
  completed: number;
  completedThisMonth: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
  avgCompletionDays: number | null;
  performanceScore: number;
  productivityScore: number;
  attendanceRate: number;
}

export interface TeamKPIs {
  totalMembers: number;
  activeMembers: number;
  onlineMembers: number;
  teamTotalAssigned: number;
  teamCompleted: number;
  teamOverdue: number;
  teamInProgress: number;
  teamCompletionRate: number;
  avgCompletionTimeDays: number | null;
  teamEfficiencyScore: number;
  newMembersThisMonth: number;
}

export interface TeamAnalyticsData {
  kpis: TeamKPIs;
  members: MemberKPI[];
  topPerformer: MemberKPI | null;
  workloadDistribution: {
    name: string;
    fullName: string;
    assigned: number;
    completed: number;
    inProgress: number;
    overdue: number;
  }[];
}
