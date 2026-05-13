import { inject, Injectable, Injector } from '@angular/core';
import { TaskComment } from '@app/shared/types/models/task/task-comment';
import { ProjectTaskCommentDTO } from '../dtos/project-tasks/project-task-comment.dto';
import { UsersDataService } from '../users-data.service';
import { AbstractFactory } from './abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskCommentFactory extends AbstractFactory<ProjectTaskCommentDTO, TaskComment> {
  private readonly injector: Injector = inject(Injector);
  private readonly usersService: UsersDataService = this.injector.get(UsersDataService);

  public constructor() {
    super();
  }

  public produce(item: ProjectTaskCommentDTO): TaskComment {
    return item
      ? new TaskComment({
          id: item.id,
          description: item.description,
          createdAt: new Date(item.createdAt),
          createdBy: this.usersService.upsertLocalData(item.createdBy)
          //   attachments: item.attachments
        })
      : undefined;
  }
}
