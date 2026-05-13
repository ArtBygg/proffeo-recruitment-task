import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { map, Observable, of } from 'rxjs';
import {
  CreateTaskDescriptionCommentDTO,
  TaskDescriptionCommentDTO,
  UpdateTaskDescriptionCommentDTO
} from '../dtos/project-tasks/task-description-comment.dto';

/**
 * TaskDescriptionCommentsHttpService - HTTP API layer for task description comment operations.
 *
 * Handles HTTP communication with the task description entries API endpoints (v2).
 * REST paths remain `.../description-entries` as defined by the backend.
 *
 * Scope: Global (`providedIn: 'root'`).
 *
 * Usage: Used by {@link TaskDescriptionCommentsDataService} to perform API calls.
 */
@Injectable({ providedIn: 'root' })
export class TaskDescriptionCommentsHttpService {
  private readonly httpClient = inject(HttpClient);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getComments(taskId: string): Observable<TaskDescriptionCommentDTO[]> {
    return of([]);
  }

  public getComment(taskId: string, commentId: string): Observable<TaskDescriptionCommentDTO> {
    return this.httpClient.get<TaskDescriptionCommentDTO>(
      `${environment.APIEndPoint}tasks/${taskId}/description-entries/${commentId}`
    );
  }

  public createComment(taskId: string, body: CreateTaskDescriptionCommentDTO): Observable<TaskDescriptionCommentDTO> {
    return this.httpClient.post<TaskDescriptionCommentDTO>(
      `${environment.APIEndPoint}tasks/${taskId}/description-entries`,
      body,
      {
        responseType: 'json'
      }
    );
  }

  public updateComment(
    taskId: string,
    commentId: string,
    body: UpdateTaskDescriptionCommentDTO
  ): Observable<TaskDescriptionCommentDTO> {
    return this.httpClient.put<TaskDescriptionCommentDTO>(
      `${environment.APIEndPoint}tasks/${taskId}/description-entries/${commentId}`,
      body
    );
  }

  public deleteComment(taskId: string, commentId: string): Observable<void> {
    return this.httpClient
      .delete(`${environment.APIEndPoint}tasks/${taskId}/description-entries/${commentId}`, {
        responseType: 'text'
      })
      .pipe(map(() => undefined));
  }
}
