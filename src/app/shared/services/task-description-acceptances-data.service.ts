import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { AppEvent } from '@app/shared/types/models/notifications/app-event';
import { TaskDescriptionAcceptance } from '@app/shared/types/models/task/task-description-acceptance.model';
import { DataStore } from '@app/store/data-store';
import { IdsCollection } from '@app/store/ids-collection';
import { catchError, filter, map, Observable, of, tap } from 'rxjs';
import { DataService } from './data-service';
import { TaskDescriptionAcceptanceDTO } from './dtos/project-tasks/task-description-acceptance.dto';
import { TaskDescriptionAcceptanceFactory } from './factories/task-description-acceptance.factory';
import { TaskDescriptionAcceptancesHttpService } from './http/task-description-acceptances-http.service';

/**
 * TaskDescriptionAcceptancesDataService - Manages task description acceptance data, caching, and store operations.
 *
 * Scope: Global (`providedIn: 'root'`).
 *
 * Usage: Consumed by {@link TaskDescriptionAcceptancesActionsService} or components that display or mutate description acceptances.
 *
 * Architecture:
 * - {@link TaskDescriptionAcceptancesDataService}: Data access, queries, store management
 * - {@link TaskDescriptionAcceptancesHttpService}: HTTP API calls
 */
@Injectable({ providedIn: 'root' })
export class TaskDescriptionAcceptancesDataService extends DataService<
  TaskDescriptionAcceptanceDTO,
  TaskDescriptionAcceptance
> {
  private readonly acceptances = new DataStore<TaskDescriptionAcceptance>();
  private readonly acceptanceIdsByTask = new DataStore<IdsCollection>();

  private readonly factory = inject(TaskDescriptionAcceptanceFactory);
  private readonly http = inject(TaskDescriptionAcceptancesHttpService);

  public getById(id: string): Signal<TaskDescriptionAcceptance> {
    return this.acceptances.get(id)!;
  }

  public upsertLocalData(dto: TaskDescriptionAcceptanceDTO): Signal<TaskDescriptionAcceptance> {
    const acceptance = this.factory.produce(dto);
    return acceptance ? this.acceptances.upsert(acceptance)! : signal(undefined);
  }

  protected handleEvent(event: AppEvent): void {
    void event;
  }

  public getAcceptances(taskId: string): Signal<TaskDescriptionAcceptance[]> {
    if (!this.acceptanceIdsByTask.hasDataForId(taskId)) {
      this.fetchAcceptances(taskId);
    }

    return computed(() => {
      const ids = this.acceptanceIdsByTask.get(taskId)()?.ids ?? [];
      return [...ids]
        .map(acceptanceId => this.acceptances.get(acceptanceId)?.())
        .filter((acceptance): acceptance is TaskDescriptionAcceptance => acceptance != null && acceptance.id != null)
        .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));
    });
  }

  public reloadAcceptances(taskId: string): void {
    this.fetchAcceptances(taskId);
  }

  private fetchAcceptances(taskId: string): void {
    this.http.getAcceptances(taskId).subscribe(dtos => {
      this.applyAcceptanceDtos(taskId, dtos);
    });
  }

  public createAcceptance(taskId: string): Observable<TaskDescriptionAcceptance> {
    return this.http.createAcceptance(taskId).pipe(
      map(dto => this.factory.produce(dto)),
      filter((acceptance): acceptance is TaskDescriptionAcceptance => acceptance != null),
      tap(acceptance => {
        this.acceptances.upsert(acceptance);

        if (this.acceptanceIdsByTask.hasDataForId(taskId)) {
          const collection = this.acceptanceIdsByTask.get(taskId)?.();
          if (collection?.ids) {
            this.acceptanceIdsByTask.upsert({
              id: taskId,
              ids: collection.ids.concat(acceptance.id)
            });
          }
        } else {
          this.acceptanceIdsByTask.upsert({
            id: taskId,
            ids: [acceptance.id]
          });
        }

        this.notificationService.notify({
          eventType: 'TaskDescriptionAcceptanceCreated',
          data: { taskId, acceptance }
        });
      })
    );
  }

  public deleteAcceptance(taskId: string, acceptanceId: string): Observable<boolean> {
    return this.http.deleteAcceptance(taskId, acceptanceId).pipe(
      tap(() => {
        this.acceptances.delete(acceptanceId);
        const collection = this.acceptanceIdsByTask.get(taskId)?.();
        if (collection?.ids) {
          this.acceptanceIdsByTask.upsert({
            id: taskId,
            ids: collection.ids.filter(id => id !== acceptanceId)
          });
          this.notificationService.notify({
            eventType: 'TaskDescriptionAcceptanceDeleted',
            data: { taskId, acceptanceId }
          });
        }
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  private applyAcceptanceDtos(taskId: string, dtos: TaskDescriptionAcceptanceDTO[]): void {
    const models = dtos
      .map(dto => this.factory.produce(dto))
      .filter((acceptance): acceptance is TaskDescriptionAcceptance => acceptance != null);

    if (models.length > 0) {
      this.acceptances.upsertMany(models);
    }

    this.acceptanceIdsByTask.upsert({
      id: taskId,
      ids: dtos.map(d => d.id)
    });
  }
}
