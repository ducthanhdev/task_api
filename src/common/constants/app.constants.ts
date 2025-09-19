import { TaskStatus } from '../../tasks/schemas/task.schema';

export const APP_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,

  // Task validation
  TASK_TITLE_MAX_LENGTH: 120,
  TASK_DESCRIPTION_MAX_LENGTH: 500,

  // API
  API_PREFIX: 'api',
  SWAGGER_PATH: 'docs',

  // Database
  DEFAULT_SORT_FIELD: 'createdAt',
  DEFAULT_SORT_ORDER: -1,

  // Error messages
  ERROR_MESSAGES: {
    TASK_NOT_FOUND: 'Task không tồn tại',
    INVALID_ID: 'ID không hợp lệ',
    VALIDATION_FAILED: 'Dữ liệu không hợp lệ',
    INTERNAL_ERROR: 'Lỗi hệ thống',
  },
} as const;

// Task status transitions
export const TASK_STATUS_TRANSITIONS = {
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.TODO, TaskStatus.DONE],
  [TaskStatus.DONE]: [TaskStatus.IN_PROGRESS],
} as const;
