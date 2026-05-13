import { computed, DestroyRef, inject, Injectable, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CreateTaskModalData,
  CreateTaskModalResultData
} from '@app/components/modals/create-task-modal/create-task-modal.component';
import { TaskFiltersService } from '@app/components/task/task-list-toolbar/task-filters.service';
import { ActiveProjectService } from '@app/shared/services/active-project.service';
import { LocationsDataService } from '@app/shared/services/locations-data.service';
import { ProjectIndustriesDataService } from '@app/shared/services/project-industries-data.service';
import { ModalService } from '@app/shared/services/shared/modal.service';
import { TaskTypesDataService } from '@app/shared/services/task-types-data.service';
import { TasksDataService } from '@app/shared/services/tasks-data.service';
import { Location } from '@app/shared/types/models/location/location.model';
import { ProjectIndustry } from '@app/shared/types/models/project-industry/project-industry.model';
import { TaskType } from '@app/shared/types/models/task/task-type.model';
import { Task } from '@app/shared/types/models/task/task.model';
import { TasksPageData } from '@app/shared/types/models/tasks-page-data';

/**
 * TasksListActionsService - Task list operations and task creation workflow.
 *
 * Builds filtered/paginated task pages from {@link TasksDataService} and {@link TaskFiltersService}. Passes
 * {@link ActiveProjectService.activeProject} into the create-task modal for the current shell project.
 *
 * Scope: Component-level (`providers` on `ProjectTasksViewComponent`).
 *
 * Architecture:
 * - {@link TasksListActionsService}: List signals and create-task modal orchestration
 * - {@link ActiveProjectService}: Active project for list queries and modal data
 * - {@link TasksActionsService}: Task mutations after creation
 * - {@link TasksDataService}: Task store and paginated queries
 */
@Injectable()
export class TasksListActionsService {
  private readonly tasksDataService: TasksDataService = inject(TasksDataService);
  private readonly activeProjectService: ActiveProjectService = inject(ActiveProjectService);
  private readonly modalService: ModalService = inject(ModalService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly taskTypesDataService: TaskTypesDataService = inject(TaskTypesDataService);
  private readonly projectIndustriesService: ProjectIndustriesDataService = inject(ProjectIndustriesDataService);
  private readonly taskFiltersService: TaskFiltersService = inject(TaskFiltersService);
  private readonly activeCompanyTaskTypes: Signal<TaskType[]> = this.taskTypesDataService.getActiveCompanyTaskTypes();
  private readonly projectIndustries: Signal<ProjectIndustry[]> = computed(() =>
    this.projectIndustriesService.getProjectIndustries(this.activeProjectService.activeProjectId())()
  );
  private readonly locationsDataService: LocationsDataService = inject(LocationsDataService);
  private readonly projectLocations: Signal<Location[]> = computed(() =>
    this.locationsDataService.getProjectLocations(this.activeProjectService.activeProjectId())()
  );

  public filteredTasksPage: Signal<TasksPageData | undefined> = computed(() => {
    return this.tasksDataService.getProjectTasks(
      this.activeProjectService.activeProjectId(),
      this.taskFiltersService.page(),
      this.taskFiltersService.limit(),
      this.taskFiltersService.orderBy(),
      this.taskFiltersService.order(),
      this.taskFiltersService.taskFiltersId() || undefined,
      this.taskFiltersService.filters() || undefined
    )();
  });

  public getTaskById(taskId: string): Signal<Task> {
    return this.tasksDataService.getById(taskId);
  }

  public startTaskCreation(): void {
    const data: CreateTaskModalData = {
      project: this.activeProjectService.activeProject,
      taskTypes: this.activeCompanyTaskTypes,
      projectIndustries: this.projectIndustries,
      projectLocations: this.projectLocations
    };

    this.modalService
      .openCreateTaskModal(data)
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: CreateTaskModalResultData) => {
        if (result?.reopenModal) this.startTaskCreation();
      });
  }
}
