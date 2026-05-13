import { Injectable } from '@angular/core';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskPriorityChangedActivity } from '@app/shared/types/models/task-activities/task-priority-changed-activity';
import { TaskPriorityChangedActivityDTO } from '../../dtos/task-activities/task-priority-changed-activity.dto';
import { AbstractFactory } from '../abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskPriorityChangedActivityFactory extends AbstractFactory<
  TaskPriorityChangedActivityDTO,
  TaskPriorityChangedActivity
> {
  public produce(item: TaskPriorityChangedActivityDTO): TaskPriorityChangedActivity {
    return {
      id: item.id,
      taskId: item.taskId,
      date: new Date(item.date),
      taskActivityType: TaskActivityType.TaskPriorityChanged,
      data: {
        from: item.data?.from,
        to: item.data?.to
      }
    };
  }
}
