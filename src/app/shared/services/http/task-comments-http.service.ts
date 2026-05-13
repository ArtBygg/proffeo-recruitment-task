import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { ProjectTaskCommentDTO } from '../dtos/project-tasks/project-task-comment.dto';

/**
 * TaskCommentsHttpService - HTTP API layer for task comments.
 *
 * Handles HTTP communication with the task comments API endpoints.
 *
 * Scope: Global (`providedIn: 'root'`).
 *
 * Usage: Used by {@link TaskCommentsDataService} to perform API calls.
 *
 * Architecture:
 * - {@link TaskCommentsDataService}: Data access, caching, store management
 * - {@link TaskCommentsHttpService}: HTTP API calls
 */
@Injectable({ providedIn: 'root' })
export class TaskCommentsHttpService {
  private readonly httpClient = inject(HttpClient);

  public createComment(taskId: string, comment: string, files?: File[]): Observable<ProjectTaskCommentDTO> {
    const formData = new FormData();
    formData.append('model', JSON.stringify({ description: comment }));

    files?.forEach((file, index) => {
      formData.append(`files[${index}].orderNo`, index.toString());
      formData.append(`files[${index}].file`, file);
    });
    return this.httpClient.post<ProjectTaskCommentDTO>(`${environment.APIEndPoint}tasks/${taskId}/comments`, formData);
  }
}
