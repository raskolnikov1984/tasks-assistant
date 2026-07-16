export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'open' | 'closed';
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
  due_time: string | null;
  created_at: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface TaskWithProject {
  id: string;
  project_id: string;
  project_name: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
  due_time: string | null;
  created_at: string;
}
