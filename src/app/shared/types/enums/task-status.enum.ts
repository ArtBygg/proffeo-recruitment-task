export enum TaskStatus {
  TO_DO = 'TO_DO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  IN_PLANNING = 'IN_PLANNING',
  IN_REVIEW = 'IN_REVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export const TASK_STATUS_TRANSLATION_KEYS: ReadonlyMap<TaskStatus, string> = new Map([
  [TaskStatus.TO_DO, 'task-statuses.toDo'],
  [TaskStatus.IN_PROGRESS, 'task-statuses.inProgress'],
  [TaskStatus.DONE, 'task-statuses.done'],
  [TaskStatus.IN_PLANNING, 'task-statuses.inPlanning'],
  [TaskStatus.IN_REVIEW, 'task-statuses.inReview'],
  [TaskStatus.ACCEPTED, 'task-statuses.accepted'],
  [TaskStatus.REJECTED, 'task-statuses.rejected']
]);
