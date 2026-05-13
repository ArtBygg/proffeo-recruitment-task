import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { ImportTasksResultDTO } from '../dtos/imports/import-tasks-result.dto';

/**
 * ProjectsHttpService - HTTP API layer for project operations.
 *
 * Handles HTTP communication with the projects API endpoints (v3).
 *
 * Usage: Used by {@link ProjectActionsService} to perform API calls.
 */
@Injectable({ providedIn: 'root' })
export class ProjectsHttpService {
  private readonly httpClient = inject(HttpClient);

  public getImportTasksTemplate(projectId: string): Observable<HttpResponse<Blob>> {
    return this.httpClient.get(`${environment.APIV3EndPoint}project/${projectId}/import-tasks/template`, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  public importTasks(projectId: string, file: File): Observable<ImportTasksResultDTO> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.httpClient.post<ImportTasksResultDTO>(
      `${environment.APIV3EndPoint}project/${projectId}/import-tasks`,
      formData
    );
  }
}
