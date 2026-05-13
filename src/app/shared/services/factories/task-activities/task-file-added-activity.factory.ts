import { Injectable } from '@angular/core';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskFileAddedActivity } from '@app/shared/types/models/task-activities/task-file-added-activity';
import { TaskFileAddedActivityDTO } from '../../dtos/task-activities/task-file-added-activity.dto';
import { AbstractFactory } from '../abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskFileAddedActivityFactory extends AbstractFactory<TaskFileAddedActivityDTO, TaskFileAddedActivity> {
  public produce(item: TaskFileAddedActivityDTO): TaskFileAddedActivity {
    return {
      id: item.id,
      taskId: item.taskId,
      date: new Date(item.date),
      taskActivityType: TaskActivityType.TaskFileAdded,
      data: {
        addedFilesIds: item.data?.addedFilesIds
      }
    };
  }
}
