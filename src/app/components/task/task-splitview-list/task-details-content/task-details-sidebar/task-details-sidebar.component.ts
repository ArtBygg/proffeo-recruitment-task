import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  InputSignal,
  signal,
  Signal,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { SelectTagsModalData } from '@app/components/modals/select-tags-modal/select-tags-modal.component';
import { TagFormModalResult } from '@app/components/modals/tag-form-modal/tag-form-modal.component';
import { EstimationSelectComponent } from '@app/components/task/old-shared/estimation-select/estimation-select.component';
import {
  PercentageDisplayMode,
  PercentageSelectComponent
} from '@app/components/task/old-shared/percentage-select/percentage-select.component';
import { TaskDateSelectComponent } from '@app/components/task/old-shared/task-date-select/task-date-select.component';
import { TaskIndustrySelectComponent } from '@app/components/task/old-shared/task-industry-select/task-industry-select.component';
import { TaskTimerComponent, TaskTimerMode } from '@app/components/task/old-shared/task-timer/task-timer.component';
import { TaskTypeSelectComponent } from '@app/components/task/old-shared/task-type-select/task-type-select.component';
import { TaskUserAssigneesComponent } from '@app/components/task/old-shared/task-user-assignees/task-user-assignees.component';
import { TaskPrioritySelectComponent } from '@app/components/task/task-priority-select/task-priority-select.component';
import { TaskStatusSelectComponent } from '@app/components/task/task-status-select/task-status-select.component';
import { LocationSelectComponent } from '@app/shared/components/location-select/location-select.component';
import { TagComponent } from '@app/shared/components/tag/tag.component';
import { TasksActionsService } from '@app/shared/services/actions/tasks-actions.service';
import { ActiveProjectService } from '@app/shared/services/active-project.service';
import { ModalService } from '@app/shared/services/shared/modal.service';
import { TagsDataService } from '@app/shared/services/tags-data.service';
import { TaskParticipantsDataService } from '@app/shared/services/task-participants-data.service';
import { TaskTypesDataService } from '@app/shared/services/task-types-data.service';
import { AvatarSize } from '@app/shared/types/enums/avatar-size.enum';
import { ModalModeEnum } from '@app/shared/types/enums/modal-mode.enum';
import { TaskDescriptionStatus } from '@app/shared/types/enums/task-description-status.enum';
import { TaskPriority } from '@app/shared/types/enums/task-priority.enum';
import { TaskStatus } from '@app/shared/types/enums/task-status.enum';
import { Project } from '@app/shared/types/models/project/project.model';
import { Tag, TagFormModalData } from '@app/shared/types/models/tag/tag.model';
import { TaskEstimation } from '@app/shared/types/models/task/task-estimation';
import { TaskStatusSelectEnum } from '@app/shared/types/models/task/task-status.model';
import { TaskType } from '@app/shared/types/models/task/task-type.model';
import { Task } from '@app/shared/types/models/task/task.model';
import { IsoTimeUtils } from '@app/shared/utils/iso-time-utils';
import { TranslatePipe } from '@ngx-translate/core';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'proffeo-task-details-sidebar',
  imports: [
    MatIconModule,
    MatExpansionModule,
    TaskStatusSelectComponent,
    TaskPrioritySelectComponent,
    TaskTypeSelectComponent,
    TranslatePipe,
    TaskDateSelectComponent,
    PercentageSelectComponent,
    TaskIndustrySelectComponent,
    LocationSelectComponent,
    TagComponent,
    EstimationSelectComponent,
    TaskUserAssigneesComponent,
    TaskTimerComponent
  ],
  templateUrl: './task-details-sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDetailsSidebarComponent {
  private readonly tagsService = inject(TagsDataService);
  private readonly participantsService = inject(TaskParticipantsDataService);
  private readonly taskTypesDataService = inject(TaskTypesDataService);
  private readonly taskActions = inject(TasksActionsService);
  private readonly modalService = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly taskParticipantsService = inject(TaskParticipantsDataService);
  private readonly activeProjectService: ActiveProjectService = inject(ActiveProjectService);

  protected readonly TaskStatusSelectEnum = TaskStatusSelectEnum;
  protected expanded: WritableSignal<boolean> = signal(false);
  protected activeProject: Signal<Project> = this.activeProjectService.activeProject;
  protected activeCompanyTaskTypes: Signal<TaskType[]> = this.taskTypesDataService.getActiveCompanyTaskTypes();
  protected projectTags: Signal<Tag[]> = computed(() => this.tagsService.getProjectTags(this.activeProject()?.id)());
  protected taskUsers = computed(
    () =>
      this.taskParticipantsService
        .getTaskParticipants(this.task().id)()
        ?.map(tp => tp.projectParticipant()) || []
  );
  protected progressWidth = computed(() => `${this.task()?.percentageOfProgress ?? 0}%`);
  protected createdDate = computed(() => {
    const d = this.task()?.createdAt;
    return d ? new Date(d).toLocaleDateString('pl-PL') : '—';
  });
  protected participants = computed(() => {
    const id = this.task()?.id;
    return this.participantsService.getTaskParticipants(id)();
  });
  protected tags = computed(() => {
    const id = this.task()?.id;
    return this.tagsService.getTaskTags(id)();
  });
  protected percentageDisplayMode = PercentageDisplayMode;
  protected AvatarSize = AvatarSize;
  protected taskTimerMode = TaskTimerMode;
  protected showAcceptanceRequestedToggle = computed(
    () => this.task().projectTaskDescriptionStatus === TaskDescriptionStatus.Accepted
  );

  public readonly task: InputSignal<Task> = input.required<Task>();

  protected convertDurationToSeconds(duration?: string): number {
    if (!duration) return 0;
    return IsoTimeUtils.convertTimeDurationToSeconds(duration);
  }

  // TASK METADATA CHANGES
  protected onTaskTypeSelected(type: TaskType): void {
    this.taskActions.updateTaskType(this.task(), type);
  }

  protected onStatusSelected(status: TaskStatus): void {
    this.taskActions.updateTaskStatus(this.task(), status);
  }

  protected onPrioritySelected(priority: TaskPriority): void {
    this.taskActions.updateTaskPriority(this.task(), priority);
  }

  protected onTaskStartDateSelected(startDate: Date): void {
    this.taskActions.updateTaskStartDate(this.task(), startDate);
  }

  protected onTaskEndDateSelected(endDate: Date): void {
    this.taskActions.updateTaskEndDate(this.task(), endDate);
  }

  protected onPercentageChange(percentage: number): void {
    this.taskActions.updateTaskProgress(this.task(), percentage);
  }

  protected onIndustryClicked(): void {
    this.taskActions.openSelectIndustryModal(this.task());
  }

  protected onLocationClicked(): void {
    this.taskActions.openSelectLocationModal(this.task());
  }

  protected onEstimationSelected(estimation: TaskEstimation): void {
    this.taskActions.updateTaskEstimation(this.task(), estimation);
  }

  protected onChangeGroupClicked(): void {
    this.taskActions.openSelectGroupModal(this.task());
  }

  protected onChangeParticipantsClicked(): void {
    this.taskActions.openSelectParticipantsModal(this.task());
  }

  // TASK TAGS METHODS
  protected onAddTagToTask(): void {
    const chosenTags = this.tags();

    const data: SelectTagsModalData = {
      tags: this.projectTags,
      chosenTags: chosenTags || [],
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

  protected openAddTagModal(): void {
    this.modalService
      .openTagFormModal({})
      .afterClosed()
      .pipe(
        filter((result: TagFormModalResult) => !!result),
        switchMap((result: TagFormModalResult) => {
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
      .subscribe();
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
}
