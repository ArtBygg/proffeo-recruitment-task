import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import type { User } from '../user/user.model';
import type { TaskActivity } from './task-activity';

export interface TaskParticipant {
  user?: User;
  taskParticipantEvent: string;
}

export interface TaskParticipantsAssignedData {
  participants?: TaskParticipant[];
}

export interface TaskParticipantsAssignedActivity extends TaskActivity {
  taskActivityType: TaskActivityType.TaskParticipantsAssigned;
  data?: TaskParticipantsAssignedData;
}
