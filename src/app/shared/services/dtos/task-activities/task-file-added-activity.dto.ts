import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskActivityDTO } from './task-activity.dto';

export interface TaskFileAddedActivityDTO extends TaskActivityDTO {
  activityType: TaskActivityType.TaskFileAdded;
  data: { addedFilesIds: string[] } | undefined;
}
