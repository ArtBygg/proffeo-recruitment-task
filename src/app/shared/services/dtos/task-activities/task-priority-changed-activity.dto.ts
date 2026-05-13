import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskPriority } from '@app/shared/types/enums/task-priority.enum';
import { TaskActivityDTO } from './task-activity.dto';

export interface TaskPriorityChangedActivityDTO extends TaskActivityDTO {
  activityType: TaskActivityType.TaskPriorityChanged;
  data: {
    from?: TaskPriority;
    to?: TaskPriority;
  };
}
