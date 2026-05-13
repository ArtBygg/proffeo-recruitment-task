import { TaskSortField } from '../types/enums/task-sort-field';

export function mapColumnToSortField(column: string): TaskSortField {
  const mapping: { [key: string]: TaskSortField } = {
    name: TaskSortField.Name,
    taskType: TaskSortField.Type,
    taskNumber: TaskSortField.TaskNumber,
    status: TaskSortField.Status,
    priority: TaskSortField.Priority,
    createdBy: TaskSortField.Author,
    createdAt: TaskSortField.CreatedAt,
    endDate: TaskSortField.EndDate,
    lastActivityAt: TaskSortField.LastActivityAt,
    isLocked: TaskSortField.IsLocked,
    percentageOfProgress: TaskSortField.PercentageOfProgress,
    startDate: TaskSortField.StartDate
  };
  return mapping[column] || TaskSortField.LastActivityAt;
}

export function mapSortFieldToColumn(sortField: TaskSortField): string {
  const mapping: { [key in TaskSortField]: string } = {
    [TaskSortField.Id]: 'id',
    [TaskSortField.Name]: 'name',
    [TaskSortField.Type]: 'taskType',
    [TaskSortField.TaskNumber]: 'taskNumber',
    [TaskSortField.Status]: 'status',
    [TaskSortField.Priority]: 'priority',
    [TaskSortField.IsLocked]: 'isLocked',
    [TaskSortField.Author]: 'createdBy',
    [TaskSortField.CreatedAt]: 'createdAt',
    [TaskSortField.LastActivityAt]: 'lastActivityAt',
    [TaskSortField.PercentageOfProgress]: 'percentageOfProgress',
    [TaskSortField.StartDate]: 'startDate',
    [TaskSortField.EndDate]: 'endDate'
  };
  return mapping[sortField] || 'lastActivityAt';
}
