import { Injectable } from '@angular/core';
import { TaskDescriptionAcceptance } from '@app/shared/types/models/task/task-description-acceptance.model';
import { TaskDescriptionAcceptanceDTO } from '../dtos/project-tasks/task-description-acceptance.dto';
import { AbstractFactory } from './abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskDescriptionAcceptanceFactory extends AbstractFactory<
  TaskDescriptionAcceptanceDTO,
  TaskDescriptionAcceptance | undefined
> {
  public produce(item: TaskDescriptionAcceptanceDTO): TaskDescriptionAcceptance | undefined {
    if (!item) {
      return undefined;
    }

    return new TaskDescriptionAcceptance({
      id: item.id,
      createdAt: new Date(item.createdAt),
      createdById: item.createdById,
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined
    });
  }
}
