import { Injectable } from '@angular/core';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskDescriptionChangedActivity } from '@app/shared/types/models/task-activities/task-description-changed-activity';
import { TaskDescriptionChangedActivityDTO } from '../../dtos/task-activities/task-description-changed-activity.dto';
import { AbstractFactory } from '../abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskDescriptionChangedActivityFactory extends AbstractFactory<
  TaskDescriptionChangedActivityDTO,
  TaskDescriptionChangedActivity
> {
  public produce(item: TaskDescriptionChangedActivityDTO): TaskDescriptionChangedActivity {
    return {
      id: item.id,
      taskId: item.taskId,
      date: new Date(item.date),
      taskActivityType: TaskActivityType.TaskDescriptionChanged,
      data: {
        from: item.data?.from,
        to: item.data?.to
      }
    };
  }
}
