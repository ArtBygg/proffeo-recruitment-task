import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskActivityDTO } from './task-activity.dto';

export interface TaskTimeEstimationChangedActivityDTO extends TaskActivityDTO {
  activityType: TaskActivityType.TaskTimeEstimationChanged;
  data: {
    from?: string;
    to?: string;
  };
}
