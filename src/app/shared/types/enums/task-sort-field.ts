export enum TaskSortField {
  Id = 'id',
  Name = 'name',
  Type = 'type',
  Status = 'status',
  Priority = 'priority',
  IsLocked = 'islocked',
  CreatedAt = 'createdat',
  LastActivityAt = 'lastactivityat',
  Author = 'author',
  PercentageOfProgress = 'percentageofprogress',
  TaskNumber = 'tasknumber',
  StartDate = 'startdate',
  EndDate = 'enddate'
}

export const TASK_SORT_FIELD_TRANSLATION_KEYS: ReadonlyMap<TaskSortField, string> = new Map([
  [TaskSortField.CreatedAt, 'task-filters.createdAt'],
  [TaskSortField.LastActivityAt, 'task-filters.updatedAt'],
  [TaskSortField.Id, 'task-filters.id'],
  [TaskSortField.Name, 'task-filters.name'],
  [TaskSortField.Type, 'task-filters.taskType'],
  [TaskSortField.Status, 'task-filters.status'],
  [TaskSortField.PercentageOfProgress, 'task-filters.progress'],
  [TaskSortField.Author, 'task-filters.createdBy']
]);
