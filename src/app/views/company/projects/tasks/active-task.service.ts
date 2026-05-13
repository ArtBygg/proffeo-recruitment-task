import { computed, DestroyRef, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveProjectService } from '@app/shared/services/active-project.service';
import { TaskActivitiesDataService } from '@app/shared/services/task-activities-data.service';
import { TasksDataService } from '@app/shared/services/tasks-data.service';
import { UrlSegment } from '@app/shared/types/enums/url-segment.enum';
import { TaskActivity } from '@app/shared/types/models/task-activities/task-activity';
import { Task } from '@app/shared/types/models/task/task.model';

/**
 * ActiveTaskService - Manages the currently active task state.
 *
 * This service handles task selection, URL synchronization, and provides access to the active task's related data.
 *
 * Scope: Route-level (`providers` on the project tasks parent route in `project-tasks.routing.ts`).
 *
 * Usage: Used by task-related components to get/set the currently active task and navigate between tasks and subtasks.
 *
 * Architecture:
 * - {@link ActiveTaskService}: Active task state management, URL synchronization, task navigation
 * - {@link ActiveProjectService}: Project id for subtask queries
 * - {@link TasksActionsService}: User actions, mutations, side effects (toasts, modals)
 * - {@link TasksDataService}: Data access, queries, getters, store management
 */
@Injectable()
export class ActiveTaskService {
  private readonly taskActivitiesDataService: TaskActivitiesDataService = inject(TaskActivitiesDataService);
  private readonly tasksDataService: TasksDataService = inject(TasksDataService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly activeProjectService: ActiveProjectService = inject(ActiveProjectService);
  private readonly _activeTaskId: WritableSignal<string | undefined> = signal(undefined);

  public readonly activeTask: Signal<Task> = computed(() =>
    this._activeTaskId() ? this.tasksDataService.getById(this._activeTaskId())() : undefined
  );
  public readonly activeTaskId: Signal<string> = this._activeTaskId.asReadonly();
  public readonly activeTaskActivities: Signal<TaskActivity[]> = computed(() =>
    this._activeTaskId() ? this.taskActivitiesDataService.getTaskActivities(this._activeTaskId())() : []
  );
  public readonly activeTaskSubtasks: Signal<Task[]> = computed(() =>
    this._activeTaskId()
      ? this.tasksDataService.getTasksByParent(this.activeProjectService.activeProjectId(), this._activeTaskId())()
      : []
  );

  public constructor() {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const taskId = this.getTaskIdFromRoute(this.activatedRoute);
      if (taskId && this._activeTaskId() !== taskId) {
        this._activeTaskId.set(taskId);
      } else if (!taskId && this._activeTaskId()) {
        this._activeTaskId.set(undefined);
      }
    });
    const taskId = this.getTaskIdFromRoute(this.activatedRoute);
    if (taskId) {
      this._activeTaskId.set(taskId);
    }
  }

  private getTaskIdFromRoute(route: ActivatedRoute): string | null {
    for (let currentRoute = route; currentRoute; currentRoute = currentRoute.firstChild) {
      const taskId = currentRoute.snapshot.paramMap.get('task-id');
      if (taskId) {
        return taskId;
      }
    }
    return null;
  }

  public setActiveTask(task: Task): void {
    this._activeTaskId.set(task?.id);
    this.navigateToActiveTask(task?.id);
  }

  public unsetActiveTask(): void {
    const currentTask = this.activeTask();
    const parent: Task = currentTask?.parentTask();
    if (parent) {
      this.setActiveTask(parent);
    } else {
      this._activeTaskId.set(undefined);
      this.navigateToActiveTask(null);
    }
  }

  private navigateToActiveTask(taskId: string | null): void {
    const currentUrl = this.router.url;
    const urlTree = this.router.parseUrl(currentUrl);
    const segments = urlTree.root.children['primary']?.segments || [];

    const tasksIndex = segments.findIndex(s => s.path === UrlSegment.TASKS || s.path === UrlSegment.MY_TASKS);

    if (tasksIndex !== -1) {
      const baseSegments = segments.slice(0, tasksIndex + 1);
      const basePath = '/' + baseSegments.map(s => s.path).join('/');
      if (taskId) {
        void this.router.navigate([basePath, taskId], {
          queryParamsHandling: 'merge'
        });
      } else {
        void this.router.navigate([basePath], {
          queryParamsHandling: 'merge'
        });
      }
    }
  }
}
