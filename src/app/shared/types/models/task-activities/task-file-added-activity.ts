import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import type { TaskActivity } from './task-activity';

export interface TaskFileAddedActivityData {
  addedFilesIds?: string[];
}

export interface TaskFileAddedActivity extends TaskActivity {
  taskActivityType: TaskActivityType.TaskFileAdded;
  data?: TaskFileAddedActivityData;
}
