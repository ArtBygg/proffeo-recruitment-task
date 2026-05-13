import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import type { TaskActivity } from './task-activity';

export interface TaskTimeEstimationData {
  from?: string;
  to?: string;
}

export interface TaskTimeEstimationChangedActivity extends TaskActivity {
  taskActivityType: TaskActivityType.TaskTimeEstimationChanged;
  data?: TaskTimeEstimationData;
}
