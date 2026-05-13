import { Injectable } from '@angular/core';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskProgressChangedActivity } from '@app/shared/types/models/task-activities/task-progress-changed-activity';
import { TaskProgressChangedActivityDTO } from '../../dtos/task-activities/task-progress-changed-activity.dto';
import { AbstractFactory } from '../abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskProgressChangedActivityFactory extends AbstractFactory<
  TaskProgressChangedActivityDTO,
  TaskProgressChangedActivity
> {
  public produce(item: TaskProgressChangedActivityDTO): TaskProgressChangedActivity {
    return {
      id: item.id,
      taskId: item.taskId,
      date: new Date(item.date),
      taskActivityType: TaskActivityType.TaskProgressChanged,
      data: {
        from: item.data?.from,
        to: item.data?.to
      }
    };
  }
}
