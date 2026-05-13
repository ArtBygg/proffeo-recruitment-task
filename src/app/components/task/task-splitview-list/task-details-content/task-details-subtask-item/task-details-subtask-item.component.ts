import { Component, inject, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {
  PercentageDisplayMode,
  PercentageSelectComponent
} from '@app/components/task/old-shared/percentage-select/percentage-select.component';
import { TaskTimerComponent, TaskTimerMode } from '@app/components/task/old-shared/task-timer/task-timer.component';
import { TaskPrioritySelectComponent } from '@app/components/task/task-priority-select/task-priority-select.component';
import { TaskStatusSelectComponent } from '@app/components/task/task-status-select/task-status-select.component';
import { TasksActionsService } from '@app/shared/services/actions/tasks-actions.service';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { TaskPriority } from '@app/shared/types/enums/task-priority.enum';
import { TASK_STATUS_DISPLAY } from '@app/shared/types/enums/task-status.constants';
import { TaskStatus } from '@app/shared/types/enums/task-status.enum';
import { TaskStatusSelectEnum } from '@app/shared/types/models/task/task-status.model';
import { Task } from '@app/shared/types/models/task/task.model';
import { IsoTimeUtils } from '@app/shared/utils/iso-time-utils';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-task-details-subtask-item',
  imports: [
    MatIconModule,
    TaskStatusSelectComponent,
    TaskPrioritySelectComponent,
    MatMenuModule,
    TranslatePipe,
    TaskTimerComponent,
    PercentageSelectComponent
  ],
  templateUrl: './task-details-subtask-item.component.html'
})
export class TaskDetailsSubtaskItemComponent {
  private readonly taskActionsService: TasksActionsService = inject(TasksActionsService);
  private readonly deviceService: DeviceService = inject(DeviceService);

  protected readonly isMobile: Signal<boolean> = this.deviceService.isMobile;

  protected readonly TaskStatusSelectEnum = TaskStatusSelectEnum;

  protected readonly TASK_STATUS_DISPLAY = TASK_STATUS_DISPLAY;
  protected percentageDisplayMode = PercentageDisplayMode;
  protected taskTimerMode = TaskTimerMode;

  public readonly subTask: InputSignal<Task> = input.required<Task>();
  public readonly subTaskClicked: OutputEmitterRef<Task> = output();
  public readonly addTimeReport: OutputEmitterRef<Task> = output();
  public readonly industryClicked = output<Task>();
  public statusChanged = output<TaskStatus>();
  public priorityChanged = output<TaskPriority>();
  public percentageChange = output<number>();

  protected convertDurationToSeconds(duration?: string): number {
    if (!duration) return 0;
    return IsoTimeUtils.convertTimeDurationToSeconds(duration);
  }

  protected copySubtaskLink(): void {
    this.taskActionsService.copyTaskLink(this.subTask());
  }

  protected copySubtaskNumber(): void {
    this.taskActionsService.copyTaskNumber(this.subTask());
  }

  protected deleteSubtask(): void {
    this.taskActionsService.deleteTask(this.subTask()).subscribe();
  }
}
