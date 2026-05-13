import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TaskDetailsPdfRequest } from '@app/shared/types/models/pdf/task-details/task-details-pdf-request.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskDetailsPdfHttpService {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly endpoint = 'documents/pdf/task/';

  public createTaskDetailsPdf(taskId: string, body: TaskDetailsPdfRequest): Observable<HttpResponse<ArrayBuffer>> {
    return this.httpClient.post(`${environment.APIEndPoint}${this.endpoint}${taskId}`, body, {
      observe: 'response',
      responseType: 'arraybuffer'
    });
  }
}
