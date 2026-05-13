import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { map, Observable } from 'rxjs';
import { TaskDescriptionAcceptanceDTO } from '../dtos/project-tasks/task-description-acceptance.dto';

/**
 * TaskDescriptionAcceptancesHttpService - HTTP API layer for task description acceptance operations.
 *
 * Handles HTTP communication with the task description acceptances API endpoints.
 *
 * Scope: Global (`providedIn: 'root'`).
 *
 * Usage: Used by {@link TaskDescriptionAcceptancesDataService} to perform API calls.
 */
@Injectable({ providedIn: 'root' })
export class TaskDescriptionAcceptancesHttpService {
  private readonly httpClient = inject(HttpClient);

  public getAcceptances(taskId: string): Observable<TaskDescriptionAcceptanceDTO[]> {
    return this.httpClient.get<TaskDescriptionAcceptanceDTO[]>(
      `${environment.APIEndPoint}tasks/${taskId}/description-acceptances`
    );
  }

  public getAcceptance(taskId: string, acceptanceId: string): Observable<TaskDescriptionAcceptanceDTO> {
    return this.httpClient.get<TaskDescriptionAcceptanceDTO>(
      `${environment.APIEndPoint}tasks/${taskId}/description-acceptances/${acceptanceId}`
    );
  }

  public createAcceptance(taskId: string): Observable<TaskDescriptionAcceptanceDTO> {
    return this.httpClient.post<TaskDescriptionAcceptanceDTO>(
      `${environment.APIEndPoint}tasks/${taskId}/description-acceptances`,
      null,
      { responseType: 'json' }
    );
  }

  public deleteAcceptance(taskId: string, acceptanceId: string): Observable<void> {
    return this.httpClient
      .delete(`${environment.APIEndPoint}tasks/${taskId}/description-acceptances/${acceptanceId}`, {
        responseType: 'text'
      })
      .pipe(map(() => undefined));
  }
}
