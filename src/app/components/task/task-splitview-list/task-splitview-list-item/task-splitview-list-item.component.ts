import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  output,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TaskTypeSelectComponent } from '@app/components/task/old-shared/task-type-select/task-type-select.component';
import { TaskPrioritySelectComponent } from '@app/components/task/task-priority-select/task-priority-select.component';
import { TaskStatusSelectComponent } from '@app/components/task/task-status-select/task-status-select.component';
import { FileDropComponent } from '@app/shared/components/files/file-drop/file-drop.component';
import { LocationSelectComponent } from '@app/shared/components/location-select/location-select.component';
import { TagComponent } from '@app/shared/components/tag/tag.component';
import { StripHtmlPipe } from '@app/shared/pipes/stripHtml.pipe';
import { TasksActionsService } from '@app/shared/services/actions/tasks-actions.service';
import { FileDataService, FileUrlParams } from '@app/shared/services/file-data.service';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { ModalService } from '@app/shared/services/shared/modal.service';
import { TagsDataService } from '@app/shared/services/tags-data.service';
import { TaskParticipantsDataService } from '@app/shared/services/task-participants-data.service';
import { TasksDataService } from '@app/shared/services/tasks-data.service';
import { AvatarSize } from '@app/shared/types/enums/avatar-size.enum';
import { FileContext } from '@app/shared/types/enums/file-enums';
import { TaskPriority } from '@app/shared/types/enums/task-priority.enum';
import { TASK_STATUS_DISPLAY } from '@app/shared/types/enums/task-status.constants';
import { TaskStatus } from '@app/shared/types/enums/task-status.enum';
import { UploadData } from '@app/shared/types/models/files/upload-data.model';
import { Tag } from '@app/shared/types/models/tag/tag.model';
import { TaskStatusSelectEnum } from '@app/shared/types/models/task/task-status.model';
import { TaskType } from '@app/shared/types/models/task/task-type.model';
import { Task } from '@app/shared/types/models/task/task.model';
import { IsoTimeUtils } from '@app/shared/utils/iso-time-utils';
import { ActiveTaskService } from '@app/views/company/projects/tasks/active-task.service';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PercentageDisplayMode,
  PercentageSelectComponent
} from '../../old-shared/percentage-select/percentage-select.component';
import { TaskDateSelectComponent } from '../../old-shared/task-date-select/task-date-select.component';
import { TaskIndustrySelectComponent } from '../../old-shared/task-industry-select/task-industry-select.component';
import { TaskTimerComponent, TaskTimerMode } from '../../old-shared/task-timer/task-timer.component';
import { TaskUserAssigneesComponent } from '../../old-shared/task-user-assignees/task-user-assignees.component';

@Component({
  selector: 'proffeo-task-splitview-list-item',
  templateUrl: './task-splitview-list-item.component.html',
  imports: [
    MatIconModule,
    MatMenuModule,
    NgClass,
    TaskStatusSelectComponent,
    TaskPrioritySelectComponent,
    TaskTypeSelectComponent,
    TaskDateSelectComponent,
    PercentageSelectComponent,
    TaskIndustrySelectComponent,
    LocationSelectComponent,
    TranslatePipe,
    TaskUserAssigneesComponent,
    TaskTimerComponent,
    StripHtmlPipe,
    FileDropComponent,
    TagComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskSplitviewListItemComponent {
  private readonly taskActionsService: TasksActionsService = inject(TasksActionsService);
  private readonly tasksService: TasksDataService = inject(TasksDataService);
  private readonly taskParticipantsService = inject(TaskParticipantsDataService);
  private readonly modalService = inject(ModalService);
  private readonly fileService = inject(FileDataService);
  private readonly tagsService: TagsDataService = inject(TagsDataService);
  private readonly activeTaskService: ActiveTaskService = inject(ActiveTaskService);
  private readonly deviceService: DeviceService = inject(DeviceService);

  protected readonly isMobile: Signal<boolean> = this.deviceService.isMobile;
  protected readonly tags: Signal<Tag[]> = computed(() => this.tagsService.getTaskTags(this.task().id)());
  protected readonly TaskStatusSelectEnum = TaskStatusSelectEnum;
  protected readonly TaskPriority = TaskPriority;
  protected readonly TASK_STATUS_DISPLAY = TASK_STATUS_DISPLAY;

  protected calculatedIndentWidth: Signal<string> = computed(() => {
    const depth = this.subtaskDepth();
    if (depth === 1) {
      return '18px';
    }

    return `${18 + depth * 4}px`;
  });

  protected calculatedIndent: Signal<string> = computed(() => {
    const depth = this.subtaskDepth();
    if (depth === 1) {
      return '5px';
    }

    return `${5 + depth * 2}px`;
  });

  protected showSubtasks: WritableSignal<boolean> = signal(false);
  protected imgError: WritableSignal<boolean> = signal(false);
  protected avatarUrl = computed(() => this.task()?.getAvatarUrl()());
  protected subtasks: WritableSignal<Task[]> = signal<Task[]>([]);
  protected taskUsers = computed(
    () =>
      this.taskParticipantsService
        .getTaskParticipants(this.task().id)()
        ?.map(tp => tp.projectParticipant()) || []
  );
  protected percentageDisplayMode = PercentageDisplayMode;
  protected AvatarSize = AvatarSize;
  protected taskTimerMode = TaskTimerMode;

  public task: InputSignal<Task> = input.required<Task>();
  public compactMode: InputSignal<boolean> = input(true);
  public hasChildren: InputSignal<boolean> = input(false);
  public isSubtask: InputSignal<boolean> = input(false);
  public taskTypes: InputSignal<TaskType[]> = input.required<TaskType[]>();
  public isSelected: InputSignal<boolean> = input<boolean>(false);
  public subtaskDepth: InputSignal<number> = input<number>(0);
  public taskTypeSelected = output<{ type: TaskType; task: Task }>();
  public statusChanged = output<{ status: TaskStatus; task: Task }>();
  public priorityChanged = output<{ priority: TaskPriority; task: Task }>();
  public taskStartDateSelected = output<{ date: Date; task: Task }>();
  public taskEndDateSelected = output<{ date: Date; task: Task }>();
  public taskProgressSelected = output<{ progress: number; task: Task }>();
  public industryClicked = output<Task>();
  public locationClicked = output<Task>();
  public changeGroupClicked = output<Task>();
  public changeUsersClicked = output<Task>();

  public constructor() {
    effect(() => {
      if (this.showSubtasks() && this.hasChildren()) {
        const taskId = this.task()?.id;
        if (!this.task()?.project()?.id || !taskId) return;

        const subtaskSignal = this.tasksService.getTasksByParent(this.task()?.project()?.id, taskId);
        this.subtasks.set(subtaskSignal() ?? []);
      }
    });
  }

  protected convertDurationToSeconds(duration?: string): number {
    if (!duration) return 0;
    return IsoTimeUtils.convertTimeDurationToSeconds(duration);
  }

  protected onLockTask(): void {
    this.taskActionsService.lockTask(this.task());
  }

  protected onUnlockTask(): void {
    this.taskActionsService.unlockTask(this.task());
  }

  protected onDeleteTask(): void {
    this.taskActionsService.deleteTask(this.task()).subscribe();
  }

  protected onTaskClick(): void {
    this.activeTaskService.setActiveTask(this.task());
  }

  protected onCopyLink(): void {
    this.taskActionsService.copyTaskLink(this.task());
  }

  protected onCopyTaskNumber(): void {
    this.taskActionsService.copyTaskNumber(this.task());
  }

  protected onGeneratePdf(): void {
    this.modalService.openGenerateTaskPdfModal(this.task());
  }

  protected onIndustryClicked(task: Task): void {
    this.industryClicked.emit(task);
  }

  protected openTimeReportModal(): void {
    this.modalService.openTimeReportModal(this.task());
  }

  protected onFilesAdded(files: File[]): void {
    const uploadParams: FileUrlParams = {
      context: FileContext.taskFile,
      taskId: this.task()?.id
    };

    files.forEach(file => {
      const uploadData: UploadData = {
        file: file,
        description: '',
        fileTags: [],
        orderNo: 0
      };
      this.fileService.uploadFile(uploadParams, uploadData);
    });
  }
}
