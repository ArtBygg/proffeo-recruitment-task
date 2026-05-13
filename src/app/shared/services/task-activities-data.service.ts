import { inject, Injectable, signal, Signal } from '@angular/core';
import { DataStore } from '@app/store/data-store';
import { AppEvent } from '../types/models/notifications/app-event';
import { TaskActivity } from '../types/models/task-activities/task-activity';
import { DataService } from './data-service';
import { TaskActivityDTO } from './dtos/task-activities/task-activity.dto';
import { TaskActivityFactory } from './factories/task-activities/task-activity.factory';

@Injectable({ providedIn: 'root' })
export class TaskActivitiesDataService extends DataService<TaskActivityDTO, TaskActivity> {
  private readonly activities: DataStore<TaskActivity> = new DataStore<TaskActivity>();

  private readonly taskActivityFactory: TaskActivityFactory = inject(TaskActivityFactory);

  public getById(id: string): Signal<TaskActivity> {
    return this.activities.get(id);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected handleEvent(_event: AppEvent): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getTaskActivities(taskId: string): Signal<TaskActivity[]> {
    return signal([]);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public reloadTaskActivities(taskId: string): void {
  }

  public upsertLocalData(dto: TaskActivityDTO): Signal<TaskActivity> {
    const activity = this.taskActivityFactory.produce(dto);
    return activity ? this.activities.upsert(activity) : signal(undefined);
  }
}
