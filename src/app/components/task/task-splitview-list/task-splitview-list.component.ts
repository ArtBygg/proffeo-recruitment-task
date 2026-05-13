import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal
} from '@angular/core';
import { TaskListToolbarComponent } from '@app/components/task/task-list-toolbar/task-list-toolbar.component';
import { TaskDetailsContentComponent } from '@app/components/task/task-splitview-list/task-details-content/task-details-content.component';
import { TaskSplitviewListItemComponent } from '@app/components/task/task-splitview-list/task-splitview-list-item/task-splitview-list-item.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType, IconSize } from '@app/shared/components/button/button.types';
import { TasksActionsService } from '@app/shared/services/actions/tasks-actions.service';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { TaskTypesDataService } from '@app/shared/services/task-types-data.service';
import { TaskPriority } from '@app/shared/types/enums/task-priority.enum';
import { TaskStatus } from '@app/shared/types/enums/task-status.enum';
import { TaskType } from '@app/shared/types/models/task/task-type.model';
import { Task } from '@app/shared/types/models/task/task.model';
import { TasksPageData } from '@app/shared/types/models/tasks-page-data';
import { ActiveTaskService } from '@app/views/company/projects/tasks/active-task.service';
import { TasksListActionsService } from '@app/views/company/projects/tasks/tasks-list-actions.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-task-splitview-list',
  templateUrl: './task-splitview-list.component.html',
  imports: [
    TaskListToolbarComponent,
    TaskDetailsContentComponent,
    TaskSplitviewListItemComponent,
    ButtonComponent,
    NgClass,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskSplitviewListComponent {
  private readonly activeTaskService: ActiveTaskService = inject(ActiveTaskService);
  private readonly taskActions: TasksActionsService = inject(TasksActionsService);
  private readonly tasksListActions: TasksListActionsService = inject(TasksListActionsService);
  private readonly deviceService: DeviceService = inject(DeviceService);
  private readonly taskTypesService: TaskTypesDataService = inject(TaskTypesDataService);

  protected readonly ButtonType: typeof ButtonType = ButtonType;
  protected readonly IconSize: typeof IconSize = IconSize;
  protected readonly isMobile: Signal<boolean> = this.deviceService.isMobile;
  protected activeCompanyTaskTypes: Signal<TaskType[]> = this.taskTypesService.getActiveCompanyTaskTypes();

  public readonly allTasks: InputSignal<TasksPageData> = input<TasksPageData>();
  public readonly isLoading: InputSignal<boolean> = input<boolean>(false);
  public readonly searchText: InputSignal<string | undefined> = input<string | undefined>();
  public readonly searchTextChanged: OutputEmitterRef<string | null> = output();
  public readonly activeTask: Signal<Task> = this.activeTaskService.activeTask;

  protected onTaskTypeSelected(event: { type: TaskType; task: Task }): void {
    this.taskActions.updateTaskType(event.task, event.type);
  }

  protected onStatusChanged(event: { status: TaskStatus; task: Task }): void {
    this.taskActions.updateTaskStatus(event.task, event.status);
  }

  protected onPriorityChanged(event: { priority: TaskPriority; task: Task }): void {
    this.taskActions.updateTaskPriority(event.task, event.priority);
  }

  protected onTaskStartDateSelected(event: { date: Date; task: Task }): void {
    this.taskActions.updateTaskStartDate(event.task, event.date);
  }

  protected onTaskEndDateSelected(event: { date: Date; task: Task }): void {
    this.taskActions.updateTaskEndDate(event.task, event.date);
  }

  protected onTaskProgressSelected(event: { progress: number; task: Task }): void {
    this.taskActions.updateTaskProgress(event.task, event.progress);
  }

  protected onIndustryClicked(task: Task): void {
    this.taskActions.openSelectIndustryModal(task);
  }

  protected onLocationClicked(task: Task): void {
    this.taskActions.openSelectLocationModal(task);
  }

  protected onChangeGroupClicked(task: Task): void {
    this.taskActions.openSelectGroupModal(task);
  }

  protected onChangeUsersClicked(task: Task): void {
    this.taskActions.openSelectParticipantsModal(task);
  }

  protected onStartTaskCreation(): void {
    this.tasksListActions.startTaskCreation();
  }
}
