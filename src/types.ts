export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface House {
  id: string;
  name: string;
  address?: string;
  propertyType?: string;
  ownerId: string;
  collaborators: string[]; // Array of collaborator emails
  createdAt: string;
}

export interface Person {
  id: string;
  houseId: string; // The house this person belongs to
  name: string;
  colorClass: string; // Tailwind class for avatar background (e.g., 'bg-emerald-500')
  collaborators: string[]; // Copy of house collaborators for sub-document security
}

export interface Project {
  id: string;
  houseId: string; // The house this project belongs to
  name: string;
  description?: string;
  colorClass: string; // Tailwind color class for highlights (e.g., 'emerald')
  collaborators: string[]; // Copy of house collaborators for sub-document security
}

export interface TaskNote {
  id: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  houseId: string; // The house this task belongs to
  projectId: string;
  title: string;
  status: TaskStatus;
  targetDate?: string; // YYYY-MM-DD or custom string
  assigneeId?: string; // ID of Person
  notes: TaskNote[];
  createdAt: string;
  kind: 'chore' | 'project';
  priority?: TaskPriority;
  collaborators: string[]; // Copy of house collaborators for sub-document security
}

