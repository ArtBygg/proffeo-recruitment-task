import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import type { TaskActivity } from './task-activity';

export interface TaskCreatedActivity extends TaskActivity {
  taskActivityType: TaskActivityType.TaskCreated;
}
