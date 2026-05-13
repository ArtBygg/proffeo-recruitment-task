import { DestroyRef, inject, Injectable, signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataStore } from '@app/store/data-store';
import { IdsCollection } from '@app/store/ids-collection';
import { TranslateService } from '@ngx-translate/core';
import { TaskComment } from '../types/models/task/task-comment';
import { DataService } from './data-service';
import { ProjectTaskCommentDTO } from './dtos/project-tasks/project-task-comment.dto';
import { TaskCommentFactory } from './factories/task-comment.factory';
import { FileDataService } from './file-data.service';
import { TaskCommentsHttpService } from './http/task-comments-http.service';
import { ToastService } from './shared/toast.service';

@Injectable({ providedIn: 'root' })
export class TaskCommentsDataService extends DataService<ProjectTaskCommentDTO, TaskComment> {
  private readonly comments: DataStore<TaskComment> = new DataStore<TaskComment>();
  private readonly taskComments: DataStore<IdsCollection> = new DataStore<IdsCollection>();

  private readonly taskCommentFactory: TaskCommentFactory = inject(TaskCommentFactory);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly taskCommentsHttpService: TaskCommentsHttpService = inject(TaskCommentsHttpService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly fileDataService: FileDataService = inject(FileDataService);

  public getById(id: string): Signal<TaskComment> {
    return this.comments.get(id);
  }

  public upsertLocalData(dto: ProjectTaskCommentDTO): Signal<TaskComment> {
    const comment = this.taskCommentFactory.produce(dto);
    return comment ? this.comments.upsert(comment) : signal(undefined);
  }

  public addCommentToTask(taskId: string, comment: string, files?: File[]): void {
    this.taskCommentsHttpService
      .createComment(taskId, comment, files)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (comment: ProjectTaskCommentDTO) => {
          this.upsertLocalData(comment);
          const existingTaskComments: string[] = this.taskComments.get(taskId)()?.ids ?? [];
          this.taskComments.upsert({ id: taskId, ids: existingTaskComments.concat(comment.id) });
          if (files?.length) {
            this.fileDataService.reloadTaskFiles(taskId);
          }
          this.toastService.success(this.translateService.instant('project-tasks.toasts.comment-added'));

          this.notificationService.notify({
            eventType: 'TaskDataChanged',
            data: taskId
          });
        }
      });
  }
}
