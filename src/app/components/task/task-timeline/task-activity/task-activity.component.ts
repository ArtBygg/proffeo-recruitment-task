import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { TaskActivityContentComponent } from '@app/components/task/task-timeline/task-activity-content/task-activity-content.component';
import { AvatarComponent } from '@app/shared/components/group-avatars/avatar/proffeo-avatar.component';
import { AuthService } from '@app/shared/services/auth.service';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskActivity } from '@app/shared/types/models/task-activities/task-activity';
import { MessageAddedActivityComponent } from '../activities/message-added-activity/message-added-activity.component';

@Component({
  selector: 'proffeo-task-activity',
  templateUrl: './task-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, NgClass, AvatarComponent, MatTooltip, MessageAddedActivityComponent, TaskActivityContentComponent]
})
export class TaskActivityComponent {
  private readonly authService: AuthService = inject(AuthService);

  protected readonly TaskActivityType = TaskActivityType;
  protected readonly currentUserId: Signal<string | undefined> = computed(() => this.authService.currentUser()?.id);

  protected readonly groupedTaskTimelineEvents: Signal<TaskActivity[]> = computed(() =>
    this.groupedTaskActivities().filter(
      (activity: TaskActivity) => activity.taskActivityType !== TaskActivityType.TaskMessageAdded
    )
  );

  protected readonly groupContainsTimelineEvent: Signal<boolean> = computed(
    () => this.groupedTaskTimelineEvents().length > 0
  );

  public readonly groupedTaskActivities = input.required<TaskActivity[]>();
}
