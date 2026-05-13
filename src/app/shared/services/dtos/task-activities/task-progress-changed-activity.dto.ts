import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskActivityDTO } from './task-activity.dto';

export interface TaskProgressChangedActivityDTO extends TaskActivityDTO {
  activityType: TaskActivityType.TaskProgressChanged;
  data: {
    from?: number;
    to?: number;
  };
}
