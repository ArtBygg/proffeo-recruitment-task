import { Injectable } from '@angular/core';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskStatusChangedActivity } from '@app/shared/types/models/task-activities/task-status-changed-activity';
import { TaskStatusChangedActivityDTO } from '../../dtos/task-activities/task-status-changed-activity.dto';
import { AbstractFactory } from '../abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskStatusChangedActivityFactory extends AbstractFactory<
  TaskStatusChangedActivityDTO,
  TaskStatusChangedActivity
> {
  public produce(item: TaskStatusChangedActivityDTO): TaskStatusChangedActivity {
    return {
      id: item.id,
      taskId: item.taskId,
      date: new Date(item.date),
      taskActivityType: TaskActivityType.TaskStatusChanged,
      data: {
        from: item.data?.from,
        to: item.data?.to
      }
    };
  }
}
