// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

// Pagination types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Task specific types
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface TaskSortOptions {
  field: 'title' | 'status' | 'priority' | 'createdAt' | 'updatedAt' | 'dueDate';
  order: 'asc' | 'desc';
}

// Utility types
export type CreateTaskInput = Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'dueDate'>;
export type UpdateTaskInput = Partial<Omit<Task, '_id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'deletedAt'>>;
export type TaskPublic = Omit<Task, 'isDeleted' | 'deletedAt'>;
export type TaskSummary = Pick<Task, '_id' | 'title' | 'status' | 'priority' | 'dueDate'>;

// Database query types
export interface TaskQueryOptions extends PaginationOptions, TaskFilters {
  sort?: TaskSortOptions;
  includeDeleted?: boolean;
}

// Status transition validation
export type StatusTransition = {
  from: TaskStatus;
  to: TaskStatus;
  allowed: boolean;
};

export interface TaskStatusTransitions {
  'To Do': TaskStatus[];
  'In Progress': TaskStatus[];
  'Done': TaskStatus[];
}

// Re-export from existing interfaces
import { PaginationOptions } from '../interfaces/pagination.interface';

// Task interface (will be imported from schema)
export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  completedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
