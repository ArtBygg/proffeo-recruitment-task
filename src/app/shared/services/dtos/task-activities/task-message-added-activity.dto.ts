import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskActivityDTO } from './task-activity.dto';

export interface TaskMessageAddedActivityDTO extends TaskActivityDTO {
  activityType: TaskActivityType.TaskMessageAdded;
  data: {
    message: string;
    filesIds: string[];
  };
}
