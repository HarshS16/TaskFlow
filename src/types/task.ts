export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  category?: string;
  tags?: string[];
  colorTheme?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ViewMode = 'grid' | 'list' | 'calendar';