import { Injectable } from '@angular/core';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskTimeReportAddedActivity } from '@app/shared/types/models/task-activities/task-time-report-added-activity';
import { TaskTimeReportAddedActivityDTO } from '../../dtos/task-activities/task-time-report-added-activity.dto';
import { AbstractFactory } from '../abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskTimeReportAddedActivityFactory extends AbstractFactory<
  TaskTimeReportAddedActivityDTO,
  TaskTimeReportAddedActivity
> {
  public produce(item: TaskTimeReportAddedActivityDTO): TaskTimeReportAddedActivity {
    return {
      id: item.id,
      taskId: item.taskId,
      date: new Date(item.date),
      taskActivityType: TaskActivityType.TaskTimeReportAdded,
      data: {
        duration: item.data?.duration,
        date: item.data?.date ? new Date(item.data.date) : undefined,
        message: item.data?.message,
        files: item.data?.files
      }
    };
  }
}
