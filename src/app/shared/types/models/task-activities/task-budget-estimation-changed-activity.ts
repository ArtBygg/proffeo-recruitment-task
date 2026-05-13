import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import type { TaskActivity } from './task-activity';

export interface TaskBudgetEstimationData {
  from?: number;
  to?: number;
}

export interface TaskBudgetEstimationChangedActivity extends TaskActivity {
  taskActivityType: TaskActivityType.TaskBudgetEstimationChanged;
  data?: TaskBudgetEstimationData;
}
