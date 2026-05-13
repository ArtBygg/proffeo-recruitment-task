import { computed, DestroyRef, inject, Injectable, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectGroupsModalData } from '@app/components/modals/select-groups-modal/select-groups-modal-data';
import {
  MultipleProjectParticipantsModalData,
  MultipleProjectParticipantsResultData
} from '@app/components/modals/select-multiple-project-participants-modal/select-multiple-project-participants-modal.component';
import { TaskCreateData } from '@app/components/task/task-create/task-create.component';
import { ActiveProjectService } from '@app/shared/services/active-project.service';
import { ProjectTaskDTO } from '@app/shared/services/dtos/project-tasks/project-task.dto';
import { CreateTaskDescriptionCommentDTO } from '@app/shared/services/dtos/project-tasks/task-description-comment.dto';
import { ToastService } from '@app/shared/services/shared/toast.service';
import { TaskRole } from '@app/shared/types/enums/task-role.enum';
import { TaskDescriptionComment } from '@app/shared/types/models/task/task-description-comment.model';
import { TaskType } from '@app/shared/types/models/task/task-type.model';
import { Task } from '@app/shared/types/models/task/task.model';
import { TranslateService } from '@ngx-translate/core';
import { catchError, EMPTY, filter, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { SelectMode } from '../../types/enums/select-mode.enum';
import { TaskPriority } from '../../types/enums/task-priority.enum';
import { TaskStatus } from '../../types/enums/task-status.enum';
import { Group } from '../../types/models/group/group.model';
import { Industry } from '../../types/models/industry/industry.model';
import { Location, SelectSingleLocationModalData } from '../../types/models/location/location.model';
import { SelectIndustryModalData } from '../../types/models/project-industry/project-industry.model';
import { ProjectParticipant } from '../../types/models/project/project-participant';
import { TaskEstimation } from '../../types/models/task/task-estimation';
import { LocationsDataService } from '../locations-data.service';
import { ProjectIndustriesDataService } from '../project-industries-data.service';
import { ProjectParticipantsDataService } from '../project-participants-data.service';
import { ModalService } from '../shared/modal.service';
import { TaskDescriptionCommentsDataService } from '../task-description-comments-data.service';
import { TaskParticipantsDataService } from '../task-participants-data.service';
import { TasksDataService } from '../tasks-data.service';

/**
 * TasksActionsService - Facade for shared task mutation operations.
 *
 * Centralizes user-triggered actions that modify task data. Uses {@link ActiveProjectService.activeProjectId}
 * for project-scoped loads and creates (no direct {@link ProjectsDataService} dependency for “active project”).
 *
 * Scope: Route-level (`providers` on the project tasks route).
 *
 * Usage: Task sidebar, content, and split view to avoid duplicated modal/toast logic.
 *
 * Architecture:
 * - {@link TasksActionsService}: Mutations, modals, toasts
 * - {@link ActiveProjectService}: Active project id for scoped data
 * - {@link TasksDataService}: Task store and queries
 * - {@link TasksHttpService}: HTTP API calls
 * - {@link TaskDescriptionCommentsDataService}: Task description review comments (create)
 */
@Injectable()
export class TasksActionsService {
  private readonly tasksDataService: TasksDataService = inject(TasksDataService);
  private readonly taskDescriptionCommentsDataService: TaskDescriptionCommentsDataService = inject(
    TaskDescriptionCommentsDataService
  );
  private readonly destroyRef = inject(DestroyRef);
  private readonly modalService = inject(ModalService);
  private readonly projectIndustriesService = inject(ProjectIndustriesDataService);
  private readonly locationsService = inject(LocationsDataService);
  private readonly projectParticipantsService = inject(ProjectParticipantsDataService);
  private readonly taskParticipantsService = inject(TaskParticipantsDataService);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly activeProjectService = inject(ActiveProjectService);

  private activeProjectId: Signal<string> = this.activeProjectService.activeProjectId;
  private projectIndustries: Signal<Industry[]> = computed(() => {
    const projectIndustries = this.projectIndustriesService.getProjectIndustries(this.activeProjectId())();
    return projectIndustries ? projectIndustries.map(pi => pi.industry()) : [];
  });
  private projectLocations: Signal<Location[]> = computed(() =>
    this.locationsService.getProjectLocations(this.activeProjectId())()
  );

  protected projectGroups: Signal<Group[]> = computed(() =>
    this.projectParticipantsService.getProjectGroups(this.activeProjectId())()
  );
  protected projectParticipants: Signal<ProjectParticipant[]> = computed(() =>
    this.projectParticipantsService.getProjectParticipants(this.activeProjectId())()
  );

  public lockTask(task: Task): void {
    if (!task) return;
    this.tasksDataService
      .lockTask(task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.toastService.success(this.translateService.instant('project-tasks.toasts.lock-success')));
  }

  public unlockTask(task: Task): void {
    if (!task) return;
    this.tasksDataService
      .unlockTask(task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.toastService.success(this.translateService.instant('project-tasks.toasts.unlock-success')));
  }

  public deleteTask(task: Task): Observable<ProjectTaskDTO> {
    if (!task) return EMPTY;
    if (task.subtasksCount > 0) {
      this.modalService.openInformationModal({
        title: this.translateService.instant('task-confirmation-delete-header'),
        desc: this.translateService.instant('task-confirmation-delete-error-description', {
          taskName: task.name
        })
      });
      return EMPTY;
    }

    return this.modalService
      .openConfirmationModal({
        title: this.translateService.instant('task-confirmation-delete-header'),
        desc: this.translateService.instant('task-confirmation-delete-description', {
          taskName: task.name
        })
      })
      .afterClosed()
      .pipe(
        filter(confirmed => confirmed),
        switchMap(() =>
          this.tasksDataService.deleteTask(task).pipe(
            takeUntilDestroyed(this.destroyRef),
            tap(() => this.toastService.success(this.translateService.instant('project-tasks.toasts.delete-success')))
          )
        )
      );
  }

  public copyTaskNumber(task: Task): void {
    const taskNumber = task.taskNumber ?? '';
    navigator.clipboard
      .writeText(taskNumber)
      .then(() => this.toastService.success(this.translateService.instant('project-tasks.toasts.number-copy-success')))
      .catch(() => this.toastService.error(this.translateService.instant('project-tasks.toasts.number-copy-error')));
  }

  public copyTaskLink(task: Task): void {
    if (!task) this.toastService.error(this.translateService.instant('project-tasks.toasts.link-copy-error'));
    const link = task.url();
    navigator.clipboard
      .writeText(link)
      .then(() => this.toastService.success(this.translateService.instant('project-tasks.toasts.link-copy-success')))
      .catch(() => this.toastService.error(this.translateService.instant('project-tasks.toasts.link-copy-error')));
  }

  public updateTaskType(task: Task, type: TaskType): void {
    this.tasksDataService.updateTaskType(task, type).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  public updateTaskStatus(task: Task, status: TaskStatus): void {
    this.tasksDataService.updateTaskStatus(task, status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  public updateTaskPriority(task: Task, priority: TaskPriority): void {
    this.tasksDataService.updateTaskPriority(task, priority).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  public updateTaskAcceptanceRequested(task: Task, acceptanceRequested: boolean | null): Observable<boolean> {
    if (!task) return of(false);
    return this.tasksDataService.updateTaskAcceptanceRequested(task, acceptanceRequested).pipe(
      takeUntilDestroyed(this.destroyRef),
      map(() => true)
    );
  }

  public updateTaskStartDate(task: Task, startDate: Date): void {
    this.tasksDataService.updateStartDate(startDate, task).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  public updateTaskEndDate(task: Task, endDate: Date): void {
    this.tasksDataService.updateEndDate(endDate, task).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  public updateTaskProgress(task: Task, percentage: number): void {
    this.tasksDataService
      .updateCompletionPercentage(percentage, task)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  public openSelectIndustryModal(task: Task): void {
    const selectedIndustry = task.projectIndustry()?.industry();

    const data: SelectIndustryModalData = {
      industries: this.projectIndustries,
      selectMode: SelectMode.SINGLE,
      selectedIndustries: selectedIndustry ? [selectedIndustry] : [],
      title: 'project-industries.modals.select-project-industry-modal-title'
    };

    this.modalService
      .openSelectIndustryModal(data)
      .afterClosed()
      .pipe(
        switchMap((result: Industry) => {
          if (!result) return EMPTY;

          return this.tasksDataService.updateIndustry(result.id, task).pipe(
            catchError(() => {
              this.openSelectIndustryModal(task);
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  public openSelectLocationModal(task: Task): void {
    const data: SelectSingleLocationModalData = {
      locations: this.projectLocations(),
      selectedLocation: task.location(),
      projectId: this.activeProjectId(),
      showEditButton: true,
      isEmptyOptionEnabled: false,
      title: 'project-locations.modals.select-single-location-modal-title'
    };

    this.modalService
      .openSelectSingleLocationModal(data)
      .afterClosed()
      .pipe(
        switchMap((result: Location) => {
          if (!result) return EMPTY;

          return this.tasksDataService.updateLocation(result, task).pipe(
            catchError(() => {
              this.openSelectLocationModal(task);
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  public updateTaskEstimation(task: Task, estimation: TaskEstimation): void {
    this.tasksDataService.updateEstimation(estimation, task).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  public openSelectGroupModal(task: Task): void {
    const selectedGroup = task.projectGroupAdministrator()?.group();
    const data: SelectGroupsModalData = {
      groups: this.projectGroups,
      selectedGroups: selectedGroup ? [selectedGroup] : [],
      lockedGroups: [],
      selectionMode: SelectMode.SINGLE,
      allowHierarchy: false
    };

    this.modalService
      .openSelectGroupsModal(data)
      .afterClosed()
      .pipe(
        switchMap(selectedGroups => {
          const selectedGroupId = selectedGroups?.[0]?.id;
          if (!selectedGroupId) return EMPTY;

          return this.tasksDataService.updateTaskGroup(selectedGroupId, task).pipe(
            catchError(() => {
              this.openSelectGroupModal(task);
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  // group participants selection
  public openSelectParticipantsModal(task: Task): void {
    const groupParticipants = this.projectParticipants()?.filter(
      pp => pp.group()?.id === task.projectGroupAdministrator().group().id
    );

    const groupAdminId = task.projectGroupAdministrator().id;

    const taskParticipants = this.taskParticipantsService.getTaskParticipants(task.id)() ?? [];

    const industryAdminId = taskParticipants.find(pp => pp.role === TaskRole.INDUSTRYADMIN)?.projectParticipant()?.id;

    const groupParticipantIds = new Set((groupParticipants ?? []).map(pp => pp.id));
    const preselectedProjectParticipants = taskParticipants
      .map(tp => tp.projectParticipant())
      .filter(pp => pp != null && groupParticipantIds.has(pp.id));

    const data: MultipleProjectParticipantsModalData = {
      projectParticipants: groupParticipants,
      preselectedProjectParticipants,
      preselectedLockedProjectParticipantsIds: [industryAdminId, groupAdminId].filter(Boolean),
      title: 'project-participants.modals.select-multiple-project-participants'
    };

    this.modalService
      .openSelectMultipleProjectParticipantsModal(data)
      .afterClosed()
      .pipe(
        switchMap((result: MultipleProjectParticipantsResultData) => {
          if (!result) return EMPTY;

          const requests: Observable<unknown>[] = [];

          if (result.idsToAdd.length > 0) {
            requests.push(this.taskParticipantsService.addTaskUsers(task.id, result.idsToAdd));
          }
          if (result.idsToRemove.length > 0) {
            requests.push(this.taskParticipantsService.removeTaskUsers(task.id, result.idsToRemove));
          }

          return requests.length > 0
            ? forkJoin(requests).pipe(
                catchError(() => {
                  this.openSelectParticipantsModal(task);
                  return EMPTY;
                })
              )
            : EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  public createNewTask(createData: TaskCreateData): Observable<ProjectTaskDTO[]> {
    return this.tasksDataService.createNewTask(this.activeProjectId(), createData).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(res => {
        const newTask = res[0];
        this.toastService.success(
          this.translateService.instant('project-tasks.toasts.successfully-created', {
            value: newTask.name
          })
        );
      })
    );
  }

  public updateTaskName(task: Task, name: string): Observable<ProjectTaskDTO> {
    return this.tasksDataService.updateTaskName(task, name).pipe(takeUntilDestroyed(this.destroyRef));
  }

  public updateTaskDescription(task: Task, description: string): Observable<ProjectTaskDTO> {
    return this.tasksDataService.updateTaskDescription(task, description).pipe(takeUntilDestroyed(this.destroyRef));
  }

  public submitTaskDescriptionComment(
    task: Task,
    payload: CreateTaskDescriptionCommentDTO
  ): Observable<TaskDescriptionComment> {
    const taskId = task?.id;
    if (!taskId) {
      return EMPTY;
    }

    return this.taskDescriptionCommentsDataService.createDescriptionComment(taskId, payload).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.toastService.error(this.translateService.instant('task-description-comments.toast-error'));
        return EMPTY;
      })
    );
  }
}
