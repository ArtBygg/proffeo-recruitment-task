export enum TaskPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export const TASK_PRIORITY_TRANSLATION_KEYS: ReadonlyMap<TaskPriority, string> = new Map([
  [TaskPriority.NORMAL, 'task-priority-normal'],
  [TaskPriority.MEDIUM, 'task-priority-medium'],
  [TaskPriority.HIGH, 'task-priority-high']
]);
