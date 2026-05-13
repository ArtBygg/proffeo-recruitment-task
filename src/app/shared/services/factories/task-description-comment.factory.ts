import { Injectable } from '@angular/core';
import { TaskDescriptionComment } from '@app/shared/types/models/task/task-description-comment.model';
import { TaskDescriptionCommentDTO } from '../dtos/project-tasks/task-description-comment.dto';
import { AbstractFactory } from './abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskDescriptionCommentFactory extends AbstractFactory<
  TaskDescriptionCommentDTO,
  TaskDescriptionComment | undefined
> {
  public produce(item: TaskDescriptionCommentDTO): TaskDescriptionComment | undefined {
    if (!item) {
      return undefined;
    }

    return new TaskDescriptionComment({
      id: item.id,
      projectTaskDescriptionId: item.projectTaskDescriptionId,
      action: item.action,
      content: item.content ?? undefined,
      createdAt: new Date(item.createdAt),
      createdById: item.createdById,
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined
    });
  }
}
