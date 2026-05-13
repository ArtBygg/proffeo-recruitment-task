import { inject, Injectable } from '@angular/core';
import { TaskDescriptionAcceptance } from '@app/shared/types/models/task/task-description-acceptance.model';
import { Observable } from 'rxjs';
import { TaskDescriptionAcceptancesDataService } from '../task-description-acceptances-data.service';

/**
 * TaskDescriptionAcceptancesActionsService - Facade for task description acceptance mutations.
 *
 * Thin wrapper around {@link TaskDescriptionAcceptancesDataService} for components and views.
 *
 * Scope: Global (`providedIn: 'root'`).
 *
 * Usage: Used when the UI needs to create or delete description acceptances without talking to the data layer directly.
 *
 * Architecture:
 * - {@link TaskDescriptionAcceptancesActionsService}: User-triggered acceptance actions
 * - {@link TaskDescriptionAcceptancesDataService}: Caching, store updates, notifications
 * - {@link TaskDescriptionAcceptancesHttpService}: HTTP API calls
 */
@Injectable({ providedIn: 'root' })
export class TaskDescriptionAcceptancesActionsService {
  private readonly acceptancesDataService = inject(TaskDescriptionAcceptancesDataService);

  public createAcceptance(taskId: string): Observable<TaskDescriptionAcceptance> {
    return this.acceptancesDataService.createAcceptance(taskId);
  }

  public deleteAcceptance(taskId: string, acceptanceId: string): Observable<boolean> {
    return this.acceptancesDataService.deleteAcceptance(taskId, acceptanceId);
  }
}
