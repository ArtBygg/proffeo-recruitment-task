import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { WorkTimeReport } from '@app/shared/types/models/reports/work-time-report';
import { TaskTimer } from '@app/shared/types/models/task/task-timer';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export type TimerStopResponse = { item1: TaskTimer; item2?: WorkTimeReport };

export interface ActiveTimerDto {
  alreadyTrackedSeconds: number;
  id: string;
  locationId: string;
  projectTaskId: string;
  timerStartedOn: string;
  userId: string;
}

@Injectable({ providedIn: 'root' })
export class TaskTimerHttpService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.APIEndPoint ?? '';

  public getActive(): Observable<ActiveTimerDto | null> {
    return this.http.get<ActiveTimerDto | null>(`${this.base}timers/active`);
  }

  public get(taskId: string): Observable<TaskTimer> {
    return this.http.get<TaskTimer>(`${this.base}tasks/${taskId}/timers`);
  }

  public start(
    taskId: string,
    opts?: { files?: File[]; comment?: string; locationId?: string }
  ): Observable<TaskTimer> {
    const form = new FormData();
    opts?.files?.forEach((f, i) => form.append(`files[${i}].File`, f, f.name));
    const model: { comment: string; locationId?: string } = { comment: opts?.comment ?? '' };
    if (opts?.locationId) model.locationId = opts.locationId;
    form.append('model', JSON.stringify(model));
    return this.http.post<TaskTimer>(`${this.base}tasks/${taskId}/start-timer`, {
      locationId: opts.locationId
    });
  }

  public stop(taskId: string, opts?: { files?: File[]; comment?: string }): Observable<TimerStopResponse> {
    const form = new FormData();
    opts?.files?.forEach((f, i) => form.append(`files[${i}].File`, f, f.name));
    const model: { comment: string } = { comment: opts?.comment ?? '' };
    form.append('model', JSON.stringify(model));
    return this.http.post<TimerStopResponse>(`${this.base}tasks/${taskId}/stop-timer`, form);
  }
}
