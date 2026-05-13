import { Clipboard } from '@angular/cdk/clipboard';
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output, signal, Signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  PercentageSelectComponent,
  PercentageSelectMode
} from '@app/components/task/old-shared/percentage-select/percentage-select.component';
import { TaskDateSelectComponent } from '@app/components/task/old-shared/task-date-select/task-date-select.component';
import { TaskIndustrySelectComponent } from '@app/components/task/old-shared/task-industry-select/task-industry-select.component';
import { TaskPrioritySelectComponent } from '@app/components/task/old-shared/task-priority-select/task-priority-select.component';
import { TaskStatusSelectComponent } from '@app/components/task/old-shared/task-status-select/task-status-select.component';
import { TaskTimerComponent, TaskTimerMode } from '@app/components/task/old-shared/task-timer/task-timer.component';
import { TaskUserAssigneesComponent } from '@app/components/task/old-shared/task-user-assignees/task-user-assignees.component';
import { LocationSelectComponent } from '@app/shared/components/location-select/location-select.component';
import { IntlRelativeTimePipe } from '@app/shared/pipes/intl-relative-time.pipe';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { TasksDataService } from '@app/shared/services/tasks-data.service';
import { TaskPriority } from '@app/shared/types/enums/task-priority.enum';
import { TaskStatus } from '@app/shared/types/enums/task-status.enum';
import { ProjectParticipant } from '@app/shared/types/models/project/project-participant';
import { DropdownItem } from '@app/shared/types/models/shared/dropdown-item';
import { TaskParticipant } from '@app/shared/types/models/task/task-participant.model';
import { Task } from '@app/shared/types/models/task/task.model';
import { TimeSpan } from '@app/shared/types/models/time-span';
import { disableScroll, enableScroll } from '@app/shared/utils/scroll-utils';
import { ActiveTaskService } from '@app/views/company/projects/tasks/active-task.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export enum TaskAction {
  Edit = 'edit',
  Lock = 'lock',
  Unlock = 'unlock',
  Report = 'report',
  Delete = 'delete',
  CopyUrl = 'copyurl',
  CopyNumber = 'copynumber'
}

@Component({
  selector: 'proffeo-task-item',
  templateUrl: './task-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    TaskStatusSelectComponent,
    TaskPrioritySelectComponent,
    PercentageSelectComponent,
    TaskDateSelectComponent,
    NgClass,
    TaskIndustrySelectComponent,
    LocationSelectComponent,
    TaskUserAssigneesComponent,
    TaskTimerComponent,
    TaskUserAssigneesComponent,
    MatIcon,
    IntlRelativeTimePipe,
    MatMenuModule
  ],
  providers: [IntlRelativeTimePipe]
})
export class TaskItemComponent {
  private readonly deviceService: DeviceService = inject(DeviceService);
  private readonly activeTaskService: ActiveTaskService = inject(ActiveTaskService);
  private readonly tasksDataService: TasksDataService = inject(TasksDataService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);

  protected readonly TaskPriority = TaskPriority;
  protected readonly percentageSelectMode: PercentageSelectMode = PercentageSelectMode.COMPACT;
  protected readonly taskTimerMode: typeof TaskTimerMode = TaskTimerMode;
  protected readonly disableScroll = disableScroll;
  protected readonly enableScroll = enableScroll;
  protected readonly isMobile: Signal<boolean> = this.deviceService.isMobile;
  protected readonly activeTaskId = this.activeTaskService.activeTaskId;
  protected timeSpan: TimeSpan;
  protected menuItems: DropdownItem<string>[] = [];
  protected children: Signal<Task[] | null> = signal([]);
  protected expanded: boolean = false;

  public readonly task = input.required<Task>();
  public readonly isReadonly = input<boolean>(false);
  public readonly isCompact = input<boolean>(false);
  public readonly showChildren = input<boolean>(false);
  public readonly isSubtask = input<boolean>(false);
  public readonly isDetailsPanelSubtask = input<boolean>(false);
  public readonly projectParticipants = input<ProjectParticipant[]>();
  public readonly taskUsers = input<TaskParticipant[]>();
  public readonly statusChange = output<{
    status: TaskStatus;
    task: Task;
  }>();
  public readonly priorityChange = output<{
    priority: TaskPriority;
    task: Task;
  }>();
  public readonly completionPercentageChange = output<{
    percentage: number;
    task: Task;
  }>();
  public readonly startDateChange = output<{
    startDate: Date;
    task: Task;
  }>();
  public readonly endDateChange = output<{
    endDate: Date;
    task: Task;
  }>();
  public readonly locationClicked = output<Task>();
  public readonly timerStart = output<Task>();
  public readonly timerStop = output<Task>();
  public readonly industryClicked = output<Task>();
  public readonly lockTask = output<Task>();
  public readonly unlockTask = output<Task>();
  public readonly deleteTask = output<Task>();
  public readonly changeGroupClicked = output<Task>();
  public readonly changeUsers = output<Task>();
  public readonly openTaskDetails = output<Task>();

  /*
    // TODO: to delete, when all info inside the setter is properly initialized
    */
  //   @Input({required: true})
  //   public set task(value: Task) {
  // this._task = value;
  // this.timeSpan = null; // this._task.estimation ? new TimeSpan(this._task.estimation.hours * 3600 * 1000) : null;
  // this.initMenuItems();
  //   }

  public onTaskItemClick(task: Task): void {
    this.openTaskDetails.emit(task);
  }

  protected timerStarted(): void {
    this.timerStart.emit(this.task());
  }

  protected timerStopped(): void {
    const task = this.task();
    if (!task?.timer()) {
      return;
    }
    this.timerStop.emit(task);
  }

  protected handleMenuAction(selectedItem: string): void {
    switch (selectedItem as TaskAction) {
      case TaskAction.Edit:
        this.openTaskDetails.emit(this.task());
        break;
      case TaskAction.Lock:
        this.lockTask.emit(this.task());
        break;
      case TaskAction.Unlock:
        this.unlockTask.emit(this.task());
        break;
      case TaskAction.Report:
        // this.timeReportModalService.openTimeReportModal(this.task);
        break;
      case TaskAction.CopyUrl:
        this.copyTaskUrlToClipboard();
        break;
      case TaskAction.CopyNumber:
        this.copyTaskNumberToClipboard();
        break;
      case TaskAction.Delete:
        this.deleteTask.emit(this.task());
        break;
      default:
        throw new Error(`Unexpected value: ${selectedItem}`);
    }
  }

  protected toggleSubtasks(): void {
    const task = this.task();
    if (!task.project) {
      return;
    }
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.children = this.tasksDataService.getTasksByParent(task.project().id, task.id);
    }
    // else {
    //   this.children.set(null);
    // }
  }

  protected removeHtmlTags(htmlString: string): string {
    const parser: DOMParser = new DOMParser();
    const doc: Document = parser.parseFromString(htmlString, 'text/html');
    return doc.body.textContent || '';
  }

  protected getMenuItems(): DropdownItem<string>[] {
    return [
      // {
      //   value: TaskAction.Lock,
      //   label: this.translateService.instant('tasks-list-actions-menu-lock-task'),
      //   iconName: 'lock',
      //   iconColor: 'text-slate-500',
      //   disabled: this.task.isLocked
      // },
      // {
      //   value: TaskAction.Unlock,
      //   label: this.translateService.instant('tasks-list-actions-menu-unlock-task'),
      //   iconName: 'lock_open',
      //   iconColor: 'text-slate-500',
      //   disabled: !this.task.isLocked
      // },
      // {
      //   value: TaskAction.Report,
      //   label: this.translateService.instant('tasks-list-actions-menu-report-time'),
      //   iconName: 'timer',
      //   iconColor: 'text-slate-500',
      //   disabled: this.isReadonly
      // },
      {
        value: TaskAction.CopyUrl,
        label: this.translateService.instant('tasks-list-actions-menu-copy-url'),
        iconName: 'content_copy',
        iconColor: 'text-slate-500',
        disabled: this.isReadonly()
      },
      {
        value: TaskAction.CopyNumber,
        label: this.translateService.instant('tasks-list-actions-menu-copy-number'),
        iconName: 'content_copy',
        iconColor: 'text-slate-500',
        disabled: this.isReadonly()
      },
      {
        value: TaskAction.Delete,
        label: this.translateService.instant('tasks-list-actions-menu-delete-task'),
        iconName: 'delete',
        iconColor: 'text-rose-600',
        disabled: this.isReadonly()
      }
    ].filter(item => !item.disabled);
  }

  private copyTaskUrlToClipboard(): void {
    const taskUrl = this.task().url();
    this.clipboard.copy(taskUrl);
    this.snackBar.open(this.translateService.instant('url-copied-successfully'), undefined, {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  private copyTaskNumberToClipboard(): void {
    this.clipboard.copy(this.task().taskNumber);
    this.snackBar.open(this.translateService.instant('number-copied-successfully'), undefined, {
      duration: 3000,
      verticalPosition: 'top'
    });
  }
}
