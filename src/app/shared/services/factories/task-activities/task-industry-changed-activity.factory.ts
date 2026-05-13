import { inject, Injectable, Injector } from '@angular/core';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskIndustryChangedActivity } from '@app/shared/types/models/task-activities/task-industry-changed-activity';
import { CompanyIndustriesDataService } from '../../company-industries-data.service';
import { TaskIndustryChangedActivityDTO } from '../../dtos/task-activities/task-industry-changed-activity.dto';
import { AbstractFactory } from '../abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskIndustryChangedActivityFactory extends AbstractFactory<
  TaskIndustryChangedActivityDTO,
  TaskIndustryChangedActivity
> {
  private readonly injector: Injector = inject(Injector);
  private readonly industriesService: CompanyIndustriesDataService = this.injector.get(CompanyIndustriesDataService);

  public constructor() {
    super();
  }

  public produce(item: TaskIndustryChangedActivityDTO): TaskIndustryChangedActivity {
    return {
      id: item.id,
      taskId: item.taskId,
      date: new Date(item.date),
      taskActivityType: TaskActivityType.TaskIndustryChanged,
      data: {
        from: item.data?.from ? this.industriesService.getById(item.data.from)() : undefined,
        to: item.data?.to ? this.industriesService.getById(item.data.to)() : undefined
      }
    };
  }
}
