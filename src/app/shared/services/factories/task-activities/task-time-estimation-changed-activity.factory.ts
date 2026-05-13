import { Injectable } from '@angular/core';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskTimeEstimationChangedActivity } from '@app/shared/types/models/task-activities/task-time-estimation-changed-activity';
import { TaskTimeEstimationChangedActivityDTO } from '../../dtos/task-activities/task-time-estimation-changed-activity.dto';
import { AbstractFactory } from '../abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskTimeEstimationChangedActivityFactory extends AbstractFactory<
  TaskTimeEstimationChangedActivityDTO,
  TaskTimeEstimationChangedActivity
> {
  public produce(item: TaskTimeEstimationChangedActivityDTO): TaskTimeEstimationChangedActivity {
    return {
      id: item.id,
      taskId: item.taskId,
      date: new Date(item.date),
      taskActivityType: TaskActivityType.TaskTimeEstimationChanged,
      data: {
        from: item.data?.from,
        to: item.data?.to
      }
    };
  }
}
