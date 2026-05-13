import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import type { TaskActivity } from './task-activity';

export interface TaskDescriptionChangedData {
  from?: string;
  to?: string;
}

export interface TaskDescriptionChangedActivity extends TaskActivity {
  taskActivityType: TaskActivityType.TaskDescriptionChanged;
  data?: TaskDescriptionChangedData;
}
