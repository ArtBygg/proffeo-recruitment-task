import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BudgetEstimationChangedActivityComponent } from '@app/components/task/task-timeline/activities/budget-estimation-changed-activity/budget-estimation-changed-activity.component';
import { IndustryChangedActivityComponent } from '@app/components/task/task-timeline/activities/industry-changed-activity/industry-changed-activity.component';
import { LocationChangedActivityComponent } from '@app/components/task/task-timeline/activities/location-changed-activity/location-changed-activity.component';
import { ParticipantsAssignedActivityComponent } from '@app/components/task/task-timeline/activities/participants-assigned-activity/participants-assigned-activity.component';
import { PriorityChangedActivityComponent } from '@app/components/task/task-timeline/activities/priority-changed-activity/priority-changed-activity.component';
import { ProgressChangedActivityComponent } from '@app/components/task/task-timeline/activities/progress-changed-activity/progress-changed-activity.component';
import { StatusChangedActivityComponent } from '@app/components/task/task-timeline/activities/status-changed-activity/status-changed-activity.component';
import { TaskCreatedActivityComponent } from '@app/components/task/task-timeline/activities/task-created-activity/task-created-activity.component';
import { TaskDescriptionChangedActivityComponent } from '@app/components/task/task-timeline/activities/task-description-changed-activity/task-description-changed-activity.component';
import { TimeEstimationChangedActivityComponent } from '@app/components/task/task-timeline/activities/time-estimation-changed-activity/time-estimation-changed-activity.component';
import { TimeReportAddedActivityComponent } from '@app/components/task/task-timeline/activities/time-report-added-activity/time-report-added-activity.component';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskActivity } from '@app/shared/types/models/task-activities/task-activity';
import { FileAddedActivityComponent } from '../activities/file-added-activity/file-added-activity.component';

@Component({
  selector: 'proffeo-task-activity-content',
  standalone: true,
  templateUrl: './task-activity-content.component.html',
  styleUrl: './task-activity-content.component.scss',
  imports: [
    TaskCreatedActivityComponent,
    LocationChangedActivityComponent,
    BudgetEstimationChangedActivityComponent,
    TimeEstimationChangedActivityComponent,
    StatusChangedActivityComponent,
    PriorityChangedActivityComponent,
    ProgressChangedActivityComponent,
    IndustryChangedActivityComponent,
    ParticipantsAssignedActivityComponent,
    TimeReportAddedActivityComponent,
    TaskDescriptionChangedActivityComponent,
    FileAddedActivityComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskActivityContentComponent {
  protected readonly TaskActivityType = TaskActivityType;

  public readonly activity = input.required<TaskActivity>();
}
