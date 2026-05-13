import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import type { TaskActivity } from './task-activity';

export interface TaskProgressChangedData {
  from?: number;
  to?: number;
}

export interface TaskProgressChangedActivity extends TaskActivity {
  taskActivityType: TaskActivityType.TaskProgressChanged;
  data?: TaskProgressChangedData;
}
