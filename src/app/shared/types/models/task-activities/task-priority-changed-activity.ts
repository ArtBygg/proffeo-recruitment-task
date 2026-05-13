import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskPriority } from '@app/shared/types/enums/task-priority.enum';
import type { TaskActivity } from './task-activity';

export interface TaskPriorityChangedData {
  from?: TaskPriority;
  to?: TaskPriority;
}

export interface TaskPriorityChangedActivity extends TaskActivity {
  taskActivityType: TaskActivityType.TaskPriorityChanged;
  data?: TaskPriorityChangedData;
}
