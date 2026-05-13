import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskParticipant } from '@app/shared/types/models/task-activities/task-participants-assigned-activity';
import { TaskActivityDTO } from './task-activity.dto';

export interface TaskParticipantsAssignedActivityDTO extends TaskActivityDTO {
  activityType: TaskActivityType.TaskParticipantsAssigned;
  data: {
    participants: TaskParticipant[];
  };
}
