import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';

export interface TaskActivityFilterConfig {
  value: TaskActivityType;
  translationKey: string;
}

export const ACTIVITY_FILTER_CONFIGS: readonly TaskActivityFilterConfig[] = [
  { value: TaskActivityType.TaskBudgetEstimationChanged, translationKey: 'activity-filters.budget-estimation-changed' },
  { value: TaskActivityType.TaskCreated, translationKey: 'activity-filters.task-created' },
  { value: TaskActivityType.TaskDescriptionChanged, translationKey: 'activity-filters.description-changed' },
  { value: TaskActivityType.TaskFileAdded, translationKey: 'activity-filters.file-added' },
  { value: TaskActivityType.TaskIndustryChanged, translationKey: 'activity-filters.industry-changed' },
  { value: TaskActivityType.TaskLocationChanged, translationKey: 'activity-filters.location-changed' },
  { value: TaskActivityType.TaskMessageAdded, translationKey: 'activity-filters.message-added' },
  { value: TaskActivityType.TaskParticipantsAssigned, translationKey: 'activity-filters.participants-assigned' },
  { value: TaskActivityType.TaskPriorityChanged, translationKey: 'activity-filters.priority-changed' },
  { value: TaskActivityType.TaskProgressChanged, translationKey: 'activity-filters.progress-changed' },
  { value: TaskActivityType.TaskStatusChanged, translationKey: 'activity-filters.status-changed' },
  { value: TaskActivityType.TaskTimeEstimationChanged, translationKey: 'activity-filters.time-estimation-changed' },
  { value: TaskActivityType.TaskTimeReportAdded, translationKey: 'activity-filters.time-report-added' }
] as const;

export type ActivityFiltersMap = Record<TaskActivityType, boolean>;

export function getDefaultActivityFiltersMap(): ActivityFiltersMap {
  const map = {} as ActivityFiltersMap;
  for (const key of Object.values(TaskActivityType)) {
    map[key] = true;
  }
  return map;
}
