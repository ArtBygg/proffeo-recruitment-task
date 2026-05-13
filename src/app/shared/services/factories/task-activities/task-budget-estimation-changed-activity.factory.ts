import { Injectable } from '@angular/core';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskBudgetEstimationChangedActivity } from '@app/shared/types/models/task-activities/task-budget-estimation-changed-activity';
import { TaskBudgetEstimationChangedActivityDTO } from '../../dtos/task-activities/task-budget-estimation-changed-activity.dto';
import { AbstractFactory } from '../abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskBudgetEstimationChangedActivityFactory extends AbstractFactory<
  TaskBudgetEstimationChangedActivityDTO,
  TaskBudgetEstimationChangedActivity
> {
  public produce(item: TaskBudgetEstimationChangedActivityDTO): TaskBudgetEstimationChangedActivity {
    return {
      id: item.id,
      taskId: item.taskId,
      date: new Date(item.date),
      taskActivityType: TaskActivityType.TaskBudgetEstimationChanged,
      data: {
        from: item.data?.from,
        to: item.data?.to
      }
    };
  }
}
