import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';

export interface TaskActivityDTO {
  id: string;
  taskId: string;
  userId: string;
  date: string;
  activityType: TaskActivityType;
  data: unknown;
}
