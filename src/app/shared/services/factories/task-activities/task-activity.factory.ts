import { inject, Injectable, Injector } from '@angular/core';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskActivity } from '@app/shared/types/models/task-activities/task-activity';
import { TaskActivityDTO } from '../../dtos/task-activities/task-activity.dto';
import { TaskBudgetEstimationChangedActivityDTO } from '../../dtos/task-activities/task-budget-estimation-changed-activity.dto';
import { TaskCreatedActivityDTO } from '../../dtos/task-activities/task-created-activity.dto';
import { TaskDescriptionChangedActivityDTO } from '../../dtos/task-activities/task-description-changed-activity.dto';
import { TaskFileAddedActivityDTO } from '../../dtos/task-activities/task-file-added-activity.dto';
import { TaskIndustryChangedActivityDTO } from '../../dtos/task-activities/task-industry-changed-activity.dto';
import { TaskLocationChangedActivityDTO } from '../../dtos/task-activities/task-location-changed-activity.dto';
import { TaskMessageAddedActivityDTO } from '../../dtos/task-activities/task-message-added-activity.dto';
import { TaskParticipantsAssignedActivityDTO } from '../../dtos/task-activities/task-participants-assigned-activity.dto';
import { TaskPriorityChangedActivityDTO } from '../../dtos/task-activities/task-priority-changed-activity.dto';
import { TaskProgressChangedActivityDTO } from '../../dtos/task-activities/task-progress-changed-activity.dto';
import { TaskStatusChangedActivityDTO } from '../../dtos/task-activities/task-status-changed-activity.dto';
import { TaskTimeEstimationChangedActivityDTO } from '../../dtos/task-activities/task-time-estimation-changed-activity.dto';
import { TaskTimeReportAddedActivityDTO } from '../../dtos/task-activities/task-time-report-added-activity.dto';
import { UsersDataService } from '../../users-data.service';
import { AbstractFactory } from '../abstract.factory';
import { TaskBudgetEstimationChangedActivityFactory } from './task-budget-estimation-changed-activity.factory';
import { TaskCreatedActivityFactory } from './task-created-activity.factory';
import { TaskDescriptionChangedActivityFactory } from './task-description-changed-activity.factory';
import { TaskFileAddedActivityFactory } from './task-file-added-activity.factory';
import { TaskIndustryChangedActivityFactory } from './task-industry-changed-activity.factory';
import { TaskLocationChangedActivityFactory } from './task-location-changed-activity.factory';
import { TaskMessageAddedActivityFactory } from './task-message-added-activity.factory';
import { TaskParticipantsAssignedActivityFactory } from './task-participants-assigned-activity.factory';
import { TaskPriorityChangedActivityFactory } from './task-priority-changed-activity.factory';
import { TaskProgressChangedActivityFactory } from './task-progress-changed-activity.factory';
import { TaskStatusChangedActivityFactory } from './task-status-changed-activity.factory';
import { TaskTimeEstimationChangedActivityFactory } from './task-time-estimation-changed-activity.factory';
import { TaskTimeReportAddedActivityFactory } from './task-time-report-added-activity.factory';

@Injectable({ providedIn: 'root' })
export class TaskActivityFactory extends AbstractFactory<TaskActivityDTO, TaskActivity> {
  private readonly injector: Injector = inject(Injector);
  private readonly usersService: UsersDataService = this.injector.get<UsersDataService>(UsersDataService);
  private readonly taskCreatedActivityFactory = this.injector.get(TaskCreatedActivityFactory);
  private readonly statusChangedFactory = this.injector.get(TaskStatusChangedActivityFactory);
  private readonly priorityChangedFactory = this.injector.get(TaskPriorityChangedActivityFactory);
  private readonly taskProgressChangedFactory = this.injector.get(TaskProgressChangedActivityFactory);
  private readonly taskBudgetEstimationChangedFactory = this.injector.get(TaskBudgetEstimationChangedActivityFactory);
  private readonly timeEstimationChangedFactory = this.injector.get(TaskTimeEstimationChangedActivityFactory);
  private readonly taskLocationChangedFactory = this.injector.get(TaskLocationChangedActivityFactory);
  private readonly industryChangedFactory = this.injector.get(TaskIndustryChangedActivityFactory);
  private readonly taskParticipantsAssignedFactory = this.injector.get(TaskParticipantsAssignedActivityFactory);
  private readonly taskFileAddedFactory = this.injector.get(TaskFileAddedActivityFactory);
  private readonly taskMessageAddedFactory = this.injector.get(TaskMessageAddedActivityFactory);
  private readonly taskTimeReportAddedFactory = this.injector.get(TaskTimeReportAddedActivityFactory);
  private readonly taskDescriptionChangedFactory = this.injector.get(TaskDescriptionChangedActivityFactory);

  public constructor() {
    super();
  }

  public produce(item: TaskActivityDTO): TaskActivity {
    const user = this.usersService.getById(item.userId);
    let activity: TaskActivity;

    switch (item.activityType) {
      case TaskActivityType.TaskCreated:
        activity = this.taskCreatedActivityFactory.produce(item as TaskCreatedActivityDTO);
        break;
      case TaskActivityType.TaskStatusChanged:
        activity = this.statusChangedFactory.produce(item as TaskStatusChangedActivityDTO);
        break;
      case TaskActivityType.TaskPriorityChanged:
        activity = this.priorityChangedFactory.produce(item as TaskPriorityChangedActivityDTO);
        break;
      case TaskActivityType.TaskProgressChanged:
        activity = this.taskProgressChangedFactory.produce(item as TaskProgressChangedActivityDTO);
        break;
      case TaskActivityType.TaskBudgetEstimationChanged:
        activity = this.taskBudgetEstimationChangedFactory.produce(item as TaskBudgetEstimationChangedActivityDTO);
        break;
      case TaskActivityType.TaskTimeEstimationChanged:
        activity = this.timeEstimationChangedFactory.produce(item as TaskTimeEstimationChangedActivityDTO);
        break;
      case TaskActivityType.TaskLocationChanged:
        activity = this.taskLocationChangedFactory.produce(item as TaskLocationChangedActivityDTO);
        break;
      case TaskActivityType.TaskIndustryChanged:
        activity = this.industryChangedFactory.produce(item as TaskIndustryChangedActivityDTO);
        break;
      case TaskActivityType.TaskParticipantsAssigned:
        activity = this.taskParticipantsAssignedFactory.produce(item as TaskParticipantsAssignedActivityDTO);
        break;
      case TaskActivityType.TaskFileAdded:
        activity = this.taskFileAddedFactory.produce(item as TaskFileAddedActivityDTO);
        break;
      case TaskActivityType.TaskMessageAdded:
        activity = this.taskMessageAddedFactory.produce(item as TaskMessageAddedActivityDTO);
        break;
      case TaskActivityType.TaskTimeReportAdded:
        activity = this.taskTimeReportAddedFactory.produce(item as TaskTimeReportAddedActivityDTO);
        break;
      case TaskActivityType.TaskDescriptionChanged:
        activity = this.taskDescriptionChangedFactory.produce(item as TaskDescriptionChangedActivityDTO);
        break;
      default:
        throw new Error('Unrecognized Activity type');
    }

    return { ...activity, user };
  }
}
