import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskStatus } from '@app/shared/types/enums/task-status.enum';
import { TaskActivityDTO } from './task-activity.dto';

export interface TaskStatusChangedActivityDTO extends TaskActivityDTO {
  activityType: TaskActivityType.TaskStatusChanged;
  data: {
    from?: TaskStatus;
    to?: TaskStatus;
  };
}
