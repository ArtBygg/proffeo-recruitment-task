import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { TaskActivityDTO } from './task-activity.dto';

export interface TaskTimeReportAddedActivityDTO extends TaskActivityDTO {
  activityType: TaskActivityType.TaskTimeReportAdded;
  data: {
    duration: string | undefined;
    date: Date | undefined;
    message: string | undefined;
    files: FileInfo[] | undefined;
  };
}
