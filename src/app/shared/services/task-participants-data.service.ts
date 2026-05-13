import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { DataStore } from '@app/store/data-store';
import { IdsCollection } from '@app/store/ids-collection';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { AppEvent } from '../types/models/notifications/app-event';
import { TaskParticipant } from '../types/models/task/task-participant.model';
import { Task } from '../types/models/task/task.model';
import { DataService } from './data-service';
import { TaskParticipantDTO } from './dtos/project-tasks/project-task-participant.dto';
import { TaskParticipantFactory } from './factories/task-participant.factory';
import { LoaderService } from './shared/loader.service';
import { ToastService } from './shared/toast.service';

@Injectable({ providedIn: 'root' })
export class TaskParticipantsDataService extends DataService<TaskParticipantDTO, TaskParticipant> {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly loaderService: LoaderService = inject(LoaderService);
  private readonly taskParticipantFactory: TaskParticipantFactory = inject(TaskParticipantFactory);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly translateService: TranslateService = inject(TranslateService);

  private participants: DataStore<TaskParticipant> = new DataStore<TaskParticipant>();
  private taskParticipants: DataStore<IdsCollection> = new DataStore<IdsCollection>();

  public getById(participantId: string): Signal<TaskParticipant | undefined> {
    return computed(() => this.participants.get(participantId)());
  }

  public getTaskParticipants(taskId: string): Signal<TaskParticipant[] | undefined> {
    if (!taskId) {
      return signal(undefined);
    }

    return computed(() => {
      const taskParticipantsIds = this.taskParticipants.get(taskId)()?.ids ?? [];

      return (
        taskParticipantsIds
          .map(id => this.participants.get(id)?.() ?? null)
          .filter((participant): participant is TaskParticipant => participant !== null) || []
      );
    });
  }

  protected handleEvent(event: AppEvent): void {
    if (event.eventType === 'TaskGroupChanged' || event.eventType === 'TaskCreated') {
      const taskId: string = ((event.data as Task).id || event.data) as string;
      this.fetchTaskParticipants(taskId);
    }
  }

  public upsertLocalData(dto: TaskParticipantDTO): Signal<TaskParticipant> {
    return dto ? this.participants.upsert(this.taskParticipantFactory.produce(dto)) : signal(undefined);
  }

  public upsertLocalDataTaskParticipants(dto: TaskParticipantDTO): Signal<{ id: string; ids: string[] }> {
    if (!dto) return signal(undefined);

    const currentData = this.taskParticipants.get(dto.taskId)();
    const existingIds = currentData?.ids || [];

    const newIds = existingIds.includes(dto.id) ? existingIds : [...existingIds, dto.id];

    return this.taskParticipants.upsert({
      id: dto.taskId,
      ids: newIds
    });
  }

  protected fetchTaskParticipants(taskId: string): void {
    // this.loaderService.startLoading();

    this.httpClient.get<TaskParticipantDTO[]>(environment.APIEndPoint + `tasks/${taskId}/users`).subscribe({
      next: (taskParticipants: TaskParticipantDTO[]) => {
        this.participants.upsertMany(
          taskParticipants.map(taskParticipant => this.taskParticipantFactory.produce(taskParticipant))
        );
        this.taskParticipants.upsert({
          id: taskId,
          ids: taskParticipants.map(itm => itm.id)
        });
      }
      //   error: () => this.loaderService.stopLoading(),
      //   complete: () => this.loaderService.stopLoading()
    });
  }

  public addTaskUsers(taskId: string, participantsIds: string[]): Observable<TaskParticipantDTO[]> {
    this.loaderService.startLoading();

    return this.httpClient
      .post<
        TaskParticipantDTO[]
      >(environment.APIEndPoint + `tasks/${taskId}/add-users`, { projectParticipantIds: participantsIds })
      .pipe(
        tap((addedParticipants: TaskParticipantDTO[]) => {
          this.participants.upsertMany(
            addedParticipants.map(takParticipant => this.taskParticipantFactory.produce(takParticipant))
          );
          const existingParticipants: string[] = this.taskParticipants.get(taskId)().ids ?? [];
          this.taskParticipants.upsert({
            id: taskId,
            ids: existingParticipants.concat(...addedParticipants.map(participant => participant.id))
          });

          this.notificationService.notify({
            eventType: 'TaskDataChanged',
            data: taskId
          });

          this.toastService.success(
            this.translateService.instant('project-participants.toasts.user-successfully-added')
          );
        }),
        finalize(() => this.loaderService.stopLoading())
      );
  }

  public removeTaskUsers(taskId: string, participantsIds: string[]): Observable<TaskParticipantDTO[]> {
    this.loaderService.startLoading();

    return this.httpClient
      .post<
        TaskParticipantDTO[]
      >(environment.APIEndPoint + `tasks/${taskId}/remove-users`, { projectParticipantIds: participantsIds })
      .pipe(
        tap((deletedParticipants: TaskParticipantDTO[]) => {
          const existingTaskParticipants: string[] = this.taskParticipants.get(taskId)().ids ?? [];
          this.taskParticipants.upsert({
            id: taskId,
            ids: existingTaskParticipants.filter(existingParticipants =>
              deletedParticipants.every(user => user.id !== existingParticipants)
            )
          });

          this.notificationService.notify({
            eventType: 'TaskDataChanged',
            data: taskId
          });

          this.toastService.success(
            this.translateService.instant('project-participants.toasts.user-successfully-removed')
          );
        }),
        finalize(() => this.loaderService.stopLoading())
      );
  }
}
