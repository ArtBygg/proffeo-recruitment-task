import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskActivityDTO } from './task-activity.dto';

export interface TaskCreatedActivityDTO extends TaskActivityDTO {
  activityType: TaskActivityType.TaskCreated;
}
