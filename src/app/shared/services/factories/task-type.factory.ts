import { Injectable } from '@angular/core';
import { TaskType } from '@app/shared/types/models/task/task-type.model';
import { TaskTypeDTO } from '../dtos/project-tasks/project-task-type.dt';
import { AbstractFactory } from './abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskTypeFactory extends AbstractFactory<TaskTypeDTO, TaskType> {
  public produce(item: TaskTypeDTO): TaskType {
    return item
      ? new TaskType({
          id: item.id,
          code: item.code,
          name: item.name,
          isDescriptionCommentingEnabled: item.isDescriptionCommentingEnabled
          // allowAccept: item.allowAccept,
          // allowReject: item.allowReject,
          // allowRequestChanges: item.allowRequestChanges,
          // allowReadyForReview: item.allowReadyForReview
        })
      : undefined;
  }
}
