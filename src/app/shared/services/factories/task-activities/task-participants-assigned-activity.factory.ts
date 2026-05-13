import { Injectable } from '@angular/core';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskParticipantsAssignedActivity } from '@app/shared/types/models/task-activities/task-participants-assigned-activity';
import { TaskParticipantsAssignedActivityDTO } from '../../dtos/task-activities/task-participants-assigned-activity.dto';
import { AbstractFactory } from '../abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskParticipantsAssignedActivityFactory extends AbstractFactory<
  TaskParticipantsAssignedActivityDTO,
  TaskParticipantsAssignedActivity
> {
  public produce(item: TaskParticipantsAssignedActivityDTO): TaskParticipantsAssignedActivity {
    return {
      id: item.id,
      taskId: item.taskId,
      date: new Date(item.date),
      taskActivityType: TaskActivityType.TaskParticipantsAssigned,
      data: {
        participants: item.data?.participants
      }
    };
  }
}
