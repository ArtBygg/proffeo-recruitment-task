import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { FileInfo } from '../files/file-info';
import { TaskActivity } from './task-activity';

export interface TaskTimeReportAddedData {
  duration?: string;
  date?: Date;
  message?: string;
  files?: FileInfo[];
}

export interface TaskTimeReportAddedActivity extends TaskActivity {
  taskActivityType: TaskActivityType.TaskTimeReportAdded;
  data?: TaskTimeReportAddedData;
}
