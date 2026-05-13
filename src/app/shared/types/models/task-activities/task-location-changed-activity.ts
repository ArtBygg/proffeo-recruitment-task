import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import type { Location } from '../location/location.model';
import type { TaskActivity } from './task-activity';

export interface TaskLocationChangedData {
  from?: Location;
  to?: Location;
}

export interface TaskLocationChangedActivity extends TaskActivity {
  taskActivityType: TaskActivityType.TaskLocationChanged;
  data?: TaskLocationChangedData;
}
