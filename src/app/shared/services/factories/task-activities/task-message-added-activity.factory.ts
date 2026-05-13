import { Injectable } from '@angular/core';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskMessageAddedActivity } from '@app/shared/types/models/task-activities/task-message-added-activity';
import { TaskMessageAddedActivityDTO } from '../../dtos/task-activities/task-message-added-activity.dto';
import { AbstractFactory } from '../abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskMessageAddedActivityFactory extends AbstractFactory<
  TaskMessageAddedActivityDTO,
  TaskMessageAddedActivity
> {
  public produce(item: TaskMessageAddedActivityDTO): TaskMessageAddedActivity {
    return {
      id: item.id,
      taskId: item.taskId,
      date: new Date(item.date),
      taskActivityType: TaskActivityType.TaskMessageAdded,
      data: {
        message: item.data?.message,
        filesIds: item.data?.filesIds ?? []
      }
    };
  }
}
