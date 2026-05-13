import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import type { TaskActivity } from './task-activity';

export interface TaskMessageAddedData {
  message?: string;
  filesIds?: string[];
}

export interface TaskMessageAddedActivity extends TaskActivity {
  taskActivityType: TaskActivityType.TaskMessageAdded;
  data?: TaskMessageAddedData;
}
