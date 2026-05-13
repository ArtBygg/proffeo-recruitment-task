import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskActivityDTO } from './task-activity.dto';

export interface TaskDescriptionChangedActivityDTO extends TaskActivityDTO {
  activityType: TaskActivityType.TaskDescriptionChanged;
  data: {
    from?: string;
    to?: string;
  };
}
