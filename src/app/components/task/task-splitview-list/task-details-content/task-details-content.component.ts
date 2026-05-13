import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
  Signal,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  CreateTaskModalData,
  CreateTaskModalResultData
} from '@app/components/modals/create-task-modal/create-task-modal.component';
import { SelectTagsModalData } from '@app/components/modals/select-tags-modal/select-tags-modal.component';
import { TaskTimeReportsComponent } from '@app/components/task/old-shared/task-time-reports/task-time-reports.component';
import { TaskTimerComponent, TaskTimerMode } from '@app/components/task/old-shared/task-timer/task-timer.component';
import { TaskTypeSelectComponent } from '@app/components/task/old-shared/task-type-select/task-type-select.component';
import { TaskDescriptionAcceptancePanelComponent } from '@app/components/task/task-description-acceptance-panel/task-description-acceptance-panel.component';
import type { TaskDescriptionCommentRow } from '@app/components/task/task-description-comments/task-description-comment-row.types';
import {
  formatTaskDescriptionCommentRelativeTime,
  presentationForTaskDescriptionCommentAction
} from '@app/components/task/task-description-comments/task-description-comment.presentation';
import { TaskDetailsDescriptionComponent } from '@app/components/task/task-details/task-details-description/task-details-description.component';
import { TaskPrioritySelectComponent } from '@app/components/task/task-priority-select/task-priority-select.component';
import { TaskDetailsSidebarComponent } from '@app/components/task/task-splitview-list/task-details-content/task-details-sidebar/task-details-sidebar.component';
import { TaskDetailsSubtaskItemComponent } from '@app/components/task/task-splitview-list/task-details-content/task-details-subtask-item/task-details-subtask-item.component';
import { TaskStatusSelectComponent } from '@app/components/task/task-status-select/task-status-select.component';
import { TaskTimelineComponent } from '@app/components/task/task-timeline/task-timeline.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType, IconSize } from '@app/shared/components/button/button.types';
import { FileDropComponent } from '@app/shared/components/files/file-drop/file-drop.component';
import { FileHorizontalListComponent } from '@app/shared/components/files/file-horizontal-list/file-horizontal-list.component';
import { FileMiniListComponent } from '@app/shared/components/files/file-mini-list/file-mini-list.component';
import { InputWithButtonsComponent } from '@app/shared/components/input-with-buttons.component/input-with-buttons.component';
import { TagComponent } from '@app/shared/components/tag/tag.component';
import { TimelineContainerComponent } from '@app/shared/components/timeline/timeline-container/timeline-container.component';
import { TimelineContentComponent } from '@app/shared/components/timeline/timeline-content/timeline-content.component';
import { TimelineEntryComponent } from '@app/shared/components/timeline/timeline-entry/timeline-entry.component';
import { TimelineHeaderComponent } from '@app/shared/components/timeline/timeline-header/timeline-header.component';
import { TasksActionsService } from '@app/shared/services/actions/tasks-actions.service';
import { ActiveProjectService } from '@app/shared/services/active-project.service';
import { AuthService } from '@app/shared/services/auth.service';
import { FileDataService, FileUrlParams } from '@app/shared/services/file-data.service';
import { LocationsDataService } from '@app/shared/services/locations-data.service';
import { ProjectIndustriesDataService } from '@app/shared/services/project-industries-data.service';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { ModalService } from '@app/shared/services/shared/modal.service';
import { TagsDataService } from '@app/shared/services/tags-data.service';
import { TaskActivitiesDataService } from '@app/shared/services/task-activities-data.service';
import { TaskDescriptionCommentsDataService } from '@app/shared/services/task-description-comments-data.service';
import { TaskParticipantsDataService } from '@app/shared/services/task-participants-data.service';
import { TaskTypesDataService } from '@app/shared/services/task-types-data.service';
import { UsersDataService } from '@app/shared/services/users-data.service';
import { FileContext } from '@app/shared/types/enums/file-enums';
import { ModalModeEnum } from '@app/shared/types/enums/modal-mode.enum';
import { TaskDescriptionCommentAction } from '@app/shared/types/enums/task-description-comment-action.enum';
import { TaskDescriptionStatus } from '@app/shared/types/enums/task-description-status.enum';
import { TaskPriority } from '@app/shared/types/enums/task-priority.enum';
import { TaskStatus } from '@app/shared/types/enums/task-status.enum';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { FileUploadInfo } from '@app/shared/types/models/files/file-upload-info';
import { UploadData } from '@app/shared/types/models/files/upload-data.model';
import { Project } from '@app/shared/types/models/project/project.model';
import { Tag, TagFormModalData } from '@app/shared/types/models/tag/tag.model';
import { TaskActivity } from '@app/shared/types/models/task-activities/task-activity';
import { TaskStatusSelectEnum } from '@app/shared/types/models/task/task-status.model';
import { TaskType } from '@app/shared/types/models/task/task-type.model';
import { Task } from '@app/shared/types/models/task/task.model';
import { User } from '@app/shared/types/models/user/user.model';
import { IsoTimeUtils } from '@app/shared/utils/iso-time-utils';
import { ActiveTaskService } from '@app/views/company/projects/tasks/active-task.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, finalize, switchMap } from 'rxjs';

enum TAB {
  DESCRIPTION = 0,
  FILES = 1,
  TIMELINE = 2,
  TIME_REPORTS = 3,
  PRIVATE_NOTES = 4
}
@Component({
  selector: 'proffeo-task-details-content',
  templateUrl: './task-details-content.component.html',
  styleUrls: ['./task-details-content.component.scss'],
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatExpansionModule,
    TaskDetailsSidebarComponent,
    MatTabsModule,
    NgClass,
    TaskDetailsSubtaskItemComponent,
    MatMenuModule,
    ButtonComponent,
    TaskTimelineComponent,
    TaskTimeReportsComponent,
    FileDropComponent,
    TranslateModule,
    TaskDescriptionAcceptancePanelComponent,
    TaskDetailsDescriptionComponent,
    InputWithButtonsComponent,
    TagComponent,
    TaskPrioritySelectComponent,
    TaskStatusSelectComponent,
    FileMiniListComponent,
    TaskTypeSelectComponent,
    TaskTimerComponent,
    FileHorizontalListComponent,
    TimelineContainerComponent,
    TimelineEntryComponent,
    TimelineHeaderComponent,
    TimelineContentComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDetailsContentComponent {
  private readonly subtasksPanelSyncedTaskId: WritableSignal<string | undefined> = signal(undefined);

  private readonly activeTaskService: ActiveTaskService = inject(ActiveTaskService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly taskActionsService: TasksActionsService = inject(TasksActionsService);
  private readonly fileService = inject(FileDataService);
  private readonly modalService = inject(ModalService);
  private readonly activeProjectService: ActiveProjectService = inject(ActiveProjectService);
  private readonly projectIndustriesService: ProjectIndustriesDataService = inject(ProjectIndustriesDataService);
  private readonly tagsService: TagsDataService = inject(TagsDataService);
  private readonly taskTypesDataService: TaskTypesDataService = inject(TaskTypesDataService);
  private readonly taskActivitiesDataService: TaskActivitiesDataService = inject(TaskActivitiesDataService);
  private readonly taskParticipantsDataService: TaskParticipantsDataService = inject(TaskParticipantsDataService);
  private readonly locationsDataService: LocationsDataService = inject(LocationsDataService);
  private readonly descriptionCommentsData = inject(TaskDescriptionCommentsDataService);
  private readonly usersData = inject(UsersDataService);
  private readonly authService = inject(AuthService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly deviceService: DeviceService = inject(DeviceService);

  private readonly descriptionCommentsRaw = computed(() => {
    const id = this.task()?.id;
    if (!id) {
      return [];
    }
    return this.descriptionCommentsData.getDescriptionComments(id)();
  });

  private readonly initSubtasksPanelVisibility = effect(() => {
    const currentTask = this.task();
    const taskId = currentTask?.id;
    if (!taskId) {
      return;
    }
    if (taskId !== this.subtasksPanelSyncedTaskId()) {
      this.subtasksPanelSyncedTaskId.set(taskId);
      this.showTaskSubtasksPanel.set(true);
    }
  });

  protected readonly isMobile: Signal<boolean> = this.deviceService.isMobile;
  protected readonly activeProject: Signal<Project> = this.activeProjectService.activeProject;

  protected readonly taskTimerMode: typeof TaskTimerMode = TaskTimerMode;
  protected readonly IsoTimeUtils: typeof IsoTimeUtils = IsoTimeUtils;
  protected readonly ButtonType: typeof ButtonType = ButtonType;
  protected readonly IconSize: typeof IconSize = IconSize;
  protected readonly TaskStatusSelectEnum: typeof TaskStatusSelectEnum = TaskStatusSelectEnum;
  protected readonly MAX_TASK_NAME_LENGTH: number = 100;
  protected readonly TAB: typeof TAB = TAB;
  protected readonly tags: Signal<Tag[]> = computed(() => this.tagsService.getTaskTags(this.task().id)());
  protected readonly currentUser: Signal<User> = this.authService.currentUser;
  protected readonly descriptionCommentDraft = signal('');
  protected readonly descriptionCommentSubmitting = signal(false);
  protected readonly requestAcceptanceSubmitting = signal(false);

  protected readonly files = computed(() =>
    this.fileService.getFiles({
      context: FileContext.taskFile,
      taskId: this.task().id
    })()
  );
  protected readonly descriptionFiles = computed(() =>
    this.fileService.getFiles({
      context: FileContext.taskDescriptionFile,
      taskId: this.task().id
    })()
  );
  protected readonly projectTags: Signal<Tag[]> = computed(() =>
    this.tagsService.getProjectTags(this.activeProject()?.id)()
  );

  protected readonly activeUploads: Signal<FileUploadInfo[]> = computed(() =>
    this.fileService.getActiveUploads(this.task()?.id)()
  );
  protected readonly taskParticipants = computed(
    () => this.taskParticipantsDataService.getTaskParticipants(this.task()?.id)() ?? []
  );

  protected readonly descriptionCommentRows = computed((): TaskDescriptionCommentRow[] => {
    const lang = this.translateService.currentLang;
    return this.descriptionCommentsRaw().map(comment => ({
      comment,
      user: this.usersData.getById(comment.createdById),
      relativeTime: formatTaskDescriptionCommentRelativeTime(comment.createdAt, lang),
      ...presentationForTaskDescriptionCommentAction(comment.action)
    }));
  });

  protected readonly showDescriptionCommentAccept = computed(() => {
    return this.task()?.projectTaskDescriptionStatus === TaskDescriptionStatus.InProgress;
  });

  protected readonly showDescriptionCommentReject = computed(() => {
    const task = this.task();
    const statusAllows =
      task?.projectTaskDescriptionStatus === TaskDescriptionStatus.ReviewRequested ||
      task?.projectTaskDescriptionStatus === TaskDescriptionStatus.Accepted;
    return !!statusAllows;
  });

  protected readonly showDescriptionCommentRequestChange = computed(() => {
    const task = this.task();
    const statusAllows =
      task?.projectTaskDescriptionStatus === TaskDescriptionStatus.ReviewRequested ||
      task?.projectTaskDescriptionStatus === TaskDescriptionStatus.Accepted;
    return !!statusAllows;
  });

  protected readonly showDescriptionCommentReadyForReview = computed(() => {
    const task = this.task();
    const statusAllows =
      task?.projectTaskDescriptionStatus === TaskDescriptionStatus.InProgress ||
      task?.projectTaskDescriptionStatus === TaskDescriptionStatus.Rejected;
    return !!statusAllows;
  });

  protected readonly showRequestAcceptance = computed(() => {
    const task = this.task();
    return (
      !task?.acceptanceRequested &&
      this.taskParticipants()?.length &&
      task?.projectTaskDescriptionStatus === TaskDescriptionStatus.Accepted
    );
  });

  protected readonly showDescriptionCommentSendReview = computed(
    () =>
      !this.showDescriptionCommentAccept() &&
      !this.showDescriptionCommentReject() &&
      !this.showDescriptionCommentRequestChange() &&
      !this.showDescriptionCommentReadyForReview()
  );

  protected readonly showTaskSubtasksPanel: WritableSignal<boolean> = signal(true);
  protected readonly isTaskSubtasksPanelContentVisible: Signal<boolean> = computed(() => {
    const subtasksCount = this.task().subtasksCount ?? 0;
    return subtasksCount === 0 || this.showTaskSubtasksPanel();
  });

  protected activeCompanyTaskTypes: Signal<TaskType[]> = this.taskTypesDataService.getActiveCompanyTaskTypes();
  protected FileContext = FileContext;
  protected currentTabIndex: WritableSignal<number> = signal(TAB.DESCRIPTION);

  protected showMore: WritableSignal<boolean> = signal(false);
  protected isNameEditing: WritableSignal<boolean> = signal(false);
  protected showSidebar: WritableSignal<boolean> = signal(false);
  protected isDescriptionLong: Signal<boolean> = computed(() => {
    const description = this.task().description ?? '';
    const textContent = description.replace(/<[^>]*>/g, '');
    return textContent.length > 500;
  });
  protected projectIndustries = computed(() =>
    this.projectIndustriesService.getProjectIndustries(this.task().project()?.id)()
  );
  protected projectLocations = computed(() =>
    this.locationsDataService.getProjectLocations(this.task().project()?.id)()
  );

  public readonly task: Signal<Task> = this.activeTaskService.activeTask;
  public readonly activeTaskSubtasks: Signal<Task[]> = this.activeTaskService.activeTaskSubtasks;
  public readonly taskActivities: Signal<TaskActivity[]> = this.activeTaskService.activeTaskActivities;

  protected toggleTaskSubtasksPanel(event: MouseEvent): void {
    event.stopPropagation();
    this.showTaskSubtasksPanel.update(isOpen => !isOpen);
  }

  protected onDesktopSubtasksPanelExpandedChange(isExpanded: boolean): void {
    this.showTaskSubtasksPanel.set(isExpanded);
  }

  protected onAddSubtaskFromPanelClick(event: MouseEvent): void {
    event.stopPropagation();
    this.startSubtaskCreation();
  }

  protected startSubtaskCreation(): void {
    const data: CreateTaskModalData = {
      project: this.task().project,
      taskTypes: this.taskTypesDataService.getActiveCompanyTaskTypes(),
      parentTask: this.task(),
      projectIndustries: this.projectIndustries,
      projectLocations: this.projectLocations,
      taskPrototype: this.task()
    };
    this.openCreateSubtaskModal(data);
  }

  private openCreateSubtaskModal(data: CreateTaskModalData): void {
    this.modalService
      .openCreateTaskModal(data)
      .afterClosed()
      .subscribe((result: CreateTaskModalResultData) => {
        if (result.reopenModal) {
          this.openCreateSubtaskModal(data);
        }
      });
  }

  protected onSubtaskClick(subtask: Task): void {
    this.activeTaskService.setActiveTask(subtask);
  }

  protected onLockTask(): void {
    this.taskActionsService.lockTask(this.task());
  }

  protected onUnlockTask(): void {
    this.taskActionsService.unlockTask(this.task());
  }

  protected onDeleteTask(): void {
    this.taskActionsService.deleteTask(this.task()).subscribe(() => this.activeTaskService.unsetActiveTask());
  }

  protected onCopyLink(): void {
    this.taskActionsService.copyTaskLink(this.task());
  }

  protected onCopyTaskNumber(): void {
    this.taskActionsService.copyTaskNumber(this.task());
  }

  protected openTimeReportModal(task: Task): void {
    this.modalService
      .openTimeReportModal(task)
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.fileService.reloadTaskFiles(this.task().id);
        }
      });
  }

  protected onGeneratePdf(task: Task): void {
    this.modalService.openGenerateTaskPdfModal(task);
  }

  protected onFilesAdded(files: File[], context: FileContext.taskDescriptionFile | FileContext.taskFile): void {
    const uploadParams: FileUrlParams = {
      context,
      taskId: this.task().id
    };
    files.forEach(file => {
      const uploadData: UploadData = {
        file: file,
        description: '',
        fileTags: [],
        orderNo: this.files()?.length ?? 0
      };
      this.fileService.uploadFile(uploadParams, uploadData);
    });
  }

  protected onFileDelete(file: FileInfo): void {
    this.modalService
      .openConfirmationModal({
        title: this.translateService.instant('delete-file-modal-delete'),
        desc: this.translateService.instant('delete-file-modal-confirmation', {
          fileName: file.name
        })
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (confirmed) {
          this.fileService.deleteFile({ context: FileContext.taskFile, taskId: this.task().id }, file);
        }
      });
  }

  protected onSetFileAsAvatar(file: FileInfo): void {
    this.fileService.setTaskAvatar(this.task().id, file.id);
  }

  // METADATA CHANGED
  protected onTaskNameChanged(name: string): void {
    this.taskActionsService.updateTaskName(this.task(), name).subscribe(() => this.isNameEditing.set(false));
  }

  protected openAddTagModal(): void {
    this.modalService
      .openTagFormModal({})
      .afterClosed()
      .pipe(
        filter(result => !!result),
        switchMap(result => {
          const activeProjectId = this.activeProject()?.id;
          return this.tagsService.createTag(
            activeProjectId,
            new Tag({
              ...result,
              projectId: activeProjectId
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({ next: () => {}, error: () => {} });
  }

  protected openEditTagModal(tag: Tag): void {
    const data: TagFormModalData = { projectTagToEdit: tag, mode: ModalModeEnum.EDIT };
    this.modalService
      .openTagFormModal(data)
      .afterClosed()
      .pipe(
        filter(result => !!result),
        switchMap(result => this.tagsService.updateTag(this.activeProject()?.id, tag.id, result)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  protected editTaskTags(): void {
    const data: SelectTagsModalData = {
      tags: this.projectTags,
      chosenTags: this.tags() || [],
      onAddTag: () => this.openAddTagModal(),
      onEditTag: (tag: Tag) => this.openEditTagModal(tag)
    };

    this.modalService
      .openSelectTagsModal(data)
      .afterClosed()
      .pipe(
        filter(selectedTags => !!selectedTags),
        switchMap((selectedTags: Tag[]) => {
          const tags = selectedTags.map(tag => tag.id);
          return this.tagsService.updateTaskTags(this.task().id, tags);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  // TODO: change to leave description in editing mode
  // when error is caught
  protected changeDescription(description: string): void {
    this.taskActionsService.updateTaskDescription(this.task(), description).subscribe();
  }

  // SUBTASKS UPDATES
  protected onStatusSelected(status: TaskStatus, task: Task): void {
    this.taskActionsService.updateTaskStatus(task, status);
  }

  protected onPrioritySelected(priority: TaskPriority, task: Task): void {
    this.taskActionsService.updateTaskPriority(task, priority);
  }

  protected onTaskTypeSelected(type: TaskType): void {
    this.taskActionsService.updateTaskType(this.task(), type);
  }

  protected onDescriptionCommentDraftInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.descriptionCommentDraft.set(value);
  }

  protected onDescriptionCommentAcceptClicked(): void {
    this.runDescriptionCommentSubmit({
      action: TaskDescriptionCommentAction.Accept,
      content: this.optionalDescriptionCommentDraft()
    });
  }

  protected onDescriptionCommentRejectClicked(): void {
    this.runDescriptionCommentSubmit({
      action: TaskDescriptionCommentAction.Reject,
      content: this.optionalDescriptionCommentDraft()
    });
  }

  protected onDescriptionCommentRequestChangeClicked(): void {
    this.runDescriptionCommentSubmit({
      action: TaskDescriptionCommentAction.RequestChanges,
      content: this.optionalDescriptionCommentDraft()
    });
  }

  protected onDescriptionCommentReadyForReviewClicked(): void {
    this.runDescriptionCommentSubmit({
      action: TaskDescriptionCommentAction.ReadyForReview,
      content: this.optionalDescriptionCommentDraft()
    });
  }

  protected onDescriptionCommentSendReviewClicked(): void {
    const text = this.descriptionCommentDraft().trim();
    this.runDescriptionCommentSubmit({
      action: TaskDescriptionCommentAction.Save,
      content: text.length > 0 ? text : undefined
    });
  }

  protected onRequestAcceptanceClicked(): void {
    const task = this.task();
    if (
      !task?.id ||
      task.projectTaskDescriptionStatus != TaskDescriptionStatus.Accepted ||
      this.taskParticipants()?.length === 0 ||
      this.requestAcceptanceSubmitting()
    ) {
      return;
    }
    this.requestAcceptanceSubmitting.set(true);

    this.taskActionsService
      .updateTaskAcceptanceRequested(task, true)
      .pipe(finalize(() => this.requestAcceptanceSubmitting.set(false)))
      .subscribe();
  }

  private optionalDescriptionCommentDraft(): string | undefined {
    const text = this.descriptionCommentDraft().trim();
    return text.length > 0 ? text : undefined;
  }

  private runDescriptionCommentSubmit(payload: {
    action: TaskDescriptionCommentAction;
    content?: string | null;
  }): void {
    const task = this.task();
    if (!task?.id || this.descriptionCommentSubmitting()) {
      return;
    }
    this.descriptionCommentSubmitting.set(true);
    this.taskActionsService
      .submitTaskDescriptionComment(task, {
        action: payload.action,
        content: payload.content ?? undefined
      })
      .pipe(finalize(() => this.descriptionCommentSubmitting.set(false)))
      .subscribe(() => {
        this.descriptionCommentDraft.set('');
      });
  }

  protected onTabSelected(index: number): void {
    const previousIndex = this.currentTabIndex();
    this.currentTabIndex.set(index);
    if (index === TAB.TIMELINE && previousIndex !== TAB.TIMELINE) {
      const taskId = this.task()?.id;
      if (taskId) {
        this.taskActivitiesDataService.reloadTaskActivities(taskId);
      }
    }
  }
}
