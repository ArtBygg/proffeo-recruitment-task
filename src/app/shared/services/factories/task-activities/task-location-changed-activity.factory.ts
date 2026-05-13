import { inject, Injectable, Injector } from '@angular/core';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskLocationChangedActivity } from '@app/shared/types/models/task-activities/task-location-changed-activity';
import { TaskLocationChangedActivityDTO } from '../../dtos/task-activities/task-location-changed-activity.dto';
import { LocationsDataService } from '../../locations-data.service';
import { AbstractFactory } from '../abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskLocationChangedActivityFactory extends AbstractFactory<
  TaskLocationChangedActivityDTO,
  TaskLocationChangedActivity
> {
  private readonly injector: Injector = inject(Injector);
  private readonly locationsService: LocationsDataService = this.injector.get(LocationsDataService);

  public constructor() {
    super();
  }

  public produce(item: TaskLocationChangedActivityDTO): TaskLocationChangedActivity {
    return {
      id: item.id,
      taskId: item.taskId,
      date: new Date(item.date),
      taskActivityType: TaskActivityType.TaskLocationChanged,
      data: {
        from: item.data?.from ? this.locationsService.getById(item.data.from)() : undefined,
        to: item.data?.to ? this.locationsService.getById(item.data.to)() : undefined
      }
    };
  }
}
