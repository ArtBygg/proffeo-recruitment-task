import { TaskActivity } from '../task-activities/task-activity';
import { User } from '../user/user.model';

export interface ActivityTimelineRow {
  id: string;
  type: 'date' | 'activity';
  date?: Date;
  user?: User;
  activities?: TaskActivity[];
}
