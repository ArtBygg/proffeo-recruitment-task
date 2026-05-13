import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import type { Industry } from '../industry/industry.model';
import type { TaskActivity } from './task-activity';

export interface TaskIndustryChangedData {
  from?: Industry;
  to?: Industry;
}

export interface TaskIndustryChangedActivity extends TaskActivity {
  taskActivityType: TaskActivityType.TaskIndustryChanged;
  data?: TaskIndustryChangedData;
}
