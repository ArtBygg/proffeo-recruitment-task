import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskStatus } from '@app/shared/types/enums/task-status.enum';
import { TaskActivity } from './task-activity';

export interface TaskStatusChangedData {
  from?: TaskStatus;
  to?: TaskStatus;
}

export interface TaskStatusChangedActivity extends TaskActivity {
  taskActivityType: TaskActivityType.TaskStatusChanged;
  data?: TaskStatusChangedData;
}
