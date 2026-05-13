import { Injectable } from '@angular/core';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskCreatedActivity } from '@app/shared/types/models/task-activities/task-created-activity';
import { TaskCreatedActivityDTO } from '../../dtos/task-activities/task-created-activity.dto';
import { AbstractFactory } from '../abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskCreatedActivityFactory extends AbstractFactory<TaskCreatedActivityDTO, TaskCreatedActivity> {
  public produce(item: TaskCreatedActivityDTO): TaskCreatedActivity {
    return {
      id: item.id,
      taskId: item.taskId,
      date: new Date(item.date),
      taskActivityType: TaskActivityType.TaskCreated
    };
  }
}
