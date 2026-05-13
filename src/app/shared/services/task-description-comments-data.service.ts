import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { AppEvent } from '@app/shared/types/models/notifications/app-event';
import { TaskDescriptionComment } from '@app/shared/types/models/task/task-description-comment.model';
import { DataStore } from '@app/store/data-store';
import { IdsCollection } from '@app/store/ids-collection';
import { catchError, filter, map, Observable, of, tap } from 'rxjs';
import { DataService } from './data-service';
import {
  CreateTaskDescriptionCommentDTO,
  TaskDescriptionCommentDTO,
  UpdateTaskDescriptionCommentDTO
} from './dtos/project-tasks/task-description-comment.dto';
import { TaskDescriptionCommentFactory } from './factories/task-description-comment.factory';
import { TaskDescriptionCommentsHttpService } from './http/task-description-comments-http.service';

/**
 * TaskDescriptionCommentsDataService - Manages task description comment data, caching, and store operations.
 *
 * Scope: Global (`providedIn: 'root'`).
 *
 * Usage: Consumed by components or actions services that display or mutate task description history.
 *
 * Architecture:
 * - {@link TaskDescriptionCommentsDataService}: Data access, queries, store management
 * - {@link TaskDescriptionCommentsHttpService}: HTTP API calls
 */
@Injectable({ providedIn: 'root' })
export class TaskDescriptionCommentsDataService extends DataService<TaskDescriptionCommentDTO, TaskDescriptionComment> {
  private readonly comments = new DataStore<TaskDescriptionComment>();
  private readonly descriptionCommentIdsByTask = new DataStore<IdsCollection>();

  private readonly factory = inject(TaskDescriptionCommentFactory);
  private readonly http = inject(TaskDescriptionCommentsHttpService);

  public getById(id: string): Signal<TaskDescriptionComment> {
    return this.comments.get(id)!;
  }

  public upsertLocalData(dto: TaskDescriptionCommentDTO): Signal<TaskDescriptionComment> {
    const comment = this.factory.produce(dto);
    return comment ? this.comments.upsert(comment)! : signal(undefined);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected handleEvent(_event: AppEvent): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getDescriptionComments(taskId: string): Signal<TaskDescriptionComment[]> {
    return signal([]);
  }

  public createDescriptionComment(
    taskId: string,
    payload: CreateTaskDescriptionCommentDTO
  ): Observable<TaskDescriptionComment> {
    return this.http.createComment(taskId, payload).pipe(
      map(dto => this.factory.produce(dto)),
      filter((comment): comment is TaskDescriptionComment => comment != null),
      tap(comment => {
        this.comments.upsert(comment);

        if (this.descriptionCommentIdsByTask.hasDataForId(taskId)) {
          const collection = this.descriptionCommentIdsByTask.get(taskId)?.();
          if (collection?.ids) {
            this.descriptionCommentIdsByTask.upsert({
              id: taskId,
              ids: collection.ids.concat(comment.id)
            });
          }
        } else {
          this.descriptionCommentIdsByTask.upsert({
            id: taskId,
            ids: [comment.id]
          });
        }

        this.notificationService.notify({
          eventType: 'TaskDescriptionCommentAdded',
          data: { taskId, comment }
        });
      })
    );
  }

  public updateDescriptionComment(
    taskId: string,
    commentId: string,
    payload: UpdateTaskDescriptionCommentDTO
  ): Observable<TaskDescriptionComment> {
    return this.http.updateComment(taskId, commentId, payload).pipe(
      map(dto => this.factory.produce(dto)),
      filter((comment): comment is TaskDescriptionComment => comment != null),
      tap(comment => {
        this.comments.upsert(comment);
        this.notificationService.notify({
          eventType: 'TaskDescriptionCommentUpdated',
          data: { taskId, comment }
        });
      })
    );
  }

  public deleteDescriptionComment(taskId: string, commentId: string): Observable<boolean> {
    return this.http.deleteComment(taskId, commentId).pipe(
      tap(() => {
        this.comments.delete(commentId);
        const collection = this.descriptionCommentIdsByTask.get(taskId)?.();
        if (collection?.ids) {
          this.descriptionCommentIdsByTask.upsert({
            id: taskId,
            ids: collection.ids.filter(id => id !== commentId)
          });
          this.notificationService.notify({
            eventType: 'TaskDescriptionCommentDeleted',
            data: commentId
          });
        }
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  private applyCommentDtos(taskId: string, dtos: TaskDescriptionCommentDTO[]): void {
    const models = dtos
      .map(dto => this.factory.produce(dto))
      .filter((comment): comment is TaskDescriptionComment => comment != null);

    if (models.length > 0) {
      this.comments.upsertMany(models);
    }

    this.descriptionCommentIdsByTask.upsert({
      id: taskId,
      ids: dtos.map(d => d.id)
    });
  }
}
