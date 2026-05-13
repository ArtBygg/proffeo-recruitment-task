import { computed, DestroyRef, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveProjectService } from '@app/shared/services/active-project.service';
import { AuthService } from '@app/shared/services/auth.service';
import { LocationsDataService } from '@app/shared/services/locations-data.service';
import { ProjectIndustriesDataService } from '@app/shared/services/project-industries-data.service';
import { ProjectParticipantsDataService } from '@app/shared/services/project-participants-data.service';
import { TagsDataService } from '@app/shared/services/tags-data.service';
import { TaskTypesDataService } from '@app/shared/services/task-types-data.service';
import { GroupRole } from '@app/shared/types/enums/group-role.enum';
import { SortDirection } from '@app/shared/types/enums/sort-direction.enum';
import { TASK_PRIORITY_TRANSLATION_KEYS, TaskPriority } from '@app/shared/types/enums/task-priority.enum';
import { TaskSortField } from '@app/shared/types/enums/task-sort-field';
import { TASK_STATUS_TRANSLATION_KEYS, TaskStatus } from '@app/shared/types/enums/task-status.enum';
import { Group } from '@app/shared/types/models/group/group.model';
import { Location } from '@app/shared/types/models/location/location.model';
import { ProjectParticipant } from '@app/shared/types/models/project/project-participant';
import { Project } from '@app/shared/types/models/project/project.model';
import { Tag } from '@app/shared/types/models/tag/tag.model';
import { TaskFilters } from '@app/shared/types/models/task/task-filters.model';
import { User } from '@app/shared/types/models/user/user.model';
import { isEqual } from 'lodash';
import { FilterMultiSelectOption } from './filter-multi-select-menu/filter-multi-select-menu.component';

const DEFAULT_ORDER_BY = TaskSortField.LastActivityAt;
const DEFAULT_ORDER = SortDirection.DESC;
const DEFAULT_LIMIT = 25;
const DEFAULT_PAGE = 0;

/**
 * TaskFiltersService - Holds task list filter state, URL query sync, and available filter options.
 *
 * Centralizes pagination/sort params, saved filter id, in-memory filter criteria, and derived option lists
 * from project data services.
 *
 * Scope: Route-level instance via `providers` on the project tasks view (same injector as {@link TaskFiltersHelperService}).
 *
 * Usage: Toolbar and view components inject this service for all filter state reads and writes; {@link TasksListActionsService}
 * uses it for list queries. {@link TaskFiltersHelperService} reads it internally for labels/modals only.
 *
 * Architecture:
 * - {@link TaskFiltersService}: Mutable filter state, URL sync, option signals from data layer
 * - {@link TaskFiltersHelperService}: Presentation-only helpers (no state API surface)
 */
@Injectable()
export class TaskFiltersService {
  private readonly tagsDataService: TagsDataService = inject(TagsDataService);
  private readonly taskTypesDataService: TaskTypesDataService = inject(TaskTypesDataService);
  private readonly projectParticipantsDataService: ProjectParticipantsDataService =
    inject(ProjectParticipantsDataService);
  private readonly projectIndustriesDataService: ProjectIndustriesDataService = inject(ProjectIndustriesDataService);
  private readonly locationsDataService: LocationsDataService = inject(LocationsDataService);
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly authService: AuthService = inject(AuthService);
  private readonly activeProjectService: ActiveProjectService = inject(ActiveProjectService);
  private readonly activeProject: Signal<Project> = this.activeProjectService.activeProject;
  private readonly projectId = computed(() => this.activeProject()?.id);
  private readonly _orderBy: WritableSignal<TaskSortField> = signal(DEFAULT_ORDER_BY);
  private readonly _order: WritableSignal<SortDirection> = signal(DEFAULT_ORDER);
  private readonly _limit: WritableSignal<number> = signal(DEFAULT_LIMIT);
  private readonly _page: WritableSignal<number> = signal(DEFAULT_PAGE);
  private readonly _taskFiltersId: WritableSignal<string | null> = signal<string | null>(null);
  private readonly _filters: WritableSignal<TaskFilters | null> = signal<TaskFilters | null>(null, {
    equal: (previous, current) => isEqual(previous, current)
  });

  public readonly availableSortByOptions: Signal<TaskSortField[]> = signal<TaskSortField[]>([
    TaskSortField.CreatedAt,
    TaskSortField.LastActivityAt,
    TaskSortField.Id,
    TaskSortField.Name,
    TaskSortField.Type,
    TaskSortField.Status,
    TaskSortField.PercentageOfProgress,
    TaskSortField.Author
  ]);

  public readonly availableStatusOptions: Signal<FilterMultiSelectOption<TaskStatus>[]> = signal([
    {
      value: TaskStatus.TO_DO,
      label: TASK_STATUS_TRANSLATION_KEYS.get(TaskStatus.TO_DO)
    },
    {
      value: TaskStatus.IN_PROGRESS,
      label: TASK_STATUS_TRANSLATION_KEYS.get(TaskStatus.IN_PROGRESS)
    },
    {
      value: TaskStatus.DONE,
      label: TASK_STATUS_TRANSLATION_KEYS.get(TaskStatus.DONE)
    },
    {
      value: TaskStatus.IN_PLANNING,
      label: TASK_STATUS_TRANSLATION_KEYS.get(TaskStatus.IN_PLANNING)
    },
    {
      value: TaskStatus.IN_REVIEW,
      label: TASK_STATUS_TRANSLATION_KEYS.get(TaskStatus.IN_REVIEW)
    },
    {
      value: TaskStatus.ACCEPTED,
      label: TASK_STATUS_TRANSLATION_KEYS.get(TaskStatus.ACCEPTED)
    },
    {
      value: TaskStatus.REJECTED,
      label: TASK_STATUS_TRANSLATION_KEYS.get(TaskStatus.REJECTED)
    }
  ]);

  public readonly availablePriorityOptions: Signal<FilterMultiSelectOption<TaskPriority>[]> = signal([
    {
      value: TaskPriority.NORMAL,
      label: TASK_PRIORITY_TRANSLATION_KEYS.get(TaskPriority.NORMAL)
    },
    {
      value: TaskPriority.MEDIUM,
      label: TASK_PRIORITY_TRANSLATION_KEYS.get(TaskPriority.MEDIUM)
    },
    {
      value: TaskPriority.HIGH,
      label: TASK_PRIORITY_TRANSLATION_KEYS.get(TaskPriority.HIGH)
    }
  ]);

  public readonly availableTagsOptions: Signal<FilterMultiSelectOption<string, Tag>[]> = computed(() =>
    (this.tagsDataService.getProjectTags(this.projectId())() ?? []).map(tag => ({
      value: tag.id,
      label: tag.name,
      context: tag
    }))
  );
  public readonly availableTaskTypes: Signal<FilterMultiSelectOption<string>[]> = computed(() => {
    const taskTypes = this.taskTypesDataService.getActiveCompanyTaskTypes()() ?? [];
    return taskTypes.map(taskType => ({
      value: taskType.id,
      label: taskType.name
    }));
  });

  public readonly availableIndustriesOptions: Signal<FilterMultiSelectOption<string>[]> = computed(() => {
    const projectIndustries = this.projectIndustriesDataService.getProjectIndustries(this.projectId())() ?? [];
    return projectIndustries.map(projectIndustry => ({
      value: projectIndustry.industry().id,
      label: projectIndustry.industry().name
    }));
  });

  public readonly availableUsers: Signal<User[]> = computed(() => {
    const participants: ProjectParticipant[] =
      this.projectParticipantsDataService.getProjectParticipants(this.projectId())() ?? [];
    const participantsWithLoggedInUser: Map<string, User> = new Map(
      participants.map(participant => [participant.user().id, participant.user()])
    );
    if (this.authService.currentUser() !== null && this.authService.currentUser() !== undefined) {
      participantsWithLoggedInUser.set(this.authService.currentUser().id, this.authService.currentUser());
    }
    const uniqueUsers = participantsWithLoggedInUser.values();
    return Array.from(uniqueUsers);
  });

  public readonly availableUsersOptions: Signal<FilterMultiSelectOption<string>[]> = computed(() =>
    this.availableUsers().map(user => ({
      value: user.id,
      label: user.fullName
    }))
  );

  public readonly availableGroups: Signal<Group[]> = computed(
    () => this.projectParticipantsDataService.getProjectGroups(this.projectId())() ?? []
  );

  public readonly availableProjectParticipants: Signal<ProjectParticipant[]> = computed(
    () => this.projectParticipantsDataService.getProjectParticipants(this.projectId())() ?? []
  );

  public readonly availableGroupAdmins: Signal<User[]> = computed(() => {
    const participants = this.projectParticipantsDataService.getProjectParticipants(this.projectId())() ?? [];
    const adminUsers = participants
      .filter(participant => participant.role === GroupRole.ADMIN)
      .map(participant => participant.user());
    const uniqueUsers = new Map(adminUsers.map(user => [user.id, user])).values();
    return Array.from(uniqueUsers);
  });

  public readonly availableIndustryAdmins: Signal<User[]> = computed(() => {
    const projectIndustries = this.projectIndustriesDataService.getProjectIndustries(this.projectId())() ?? [];
    const admins = projectIndustries
      .map(projectIndustry => projectIndustry.administrator?.())
      .filter((administrator): administrator is User => administrator !== null && administrator !== undefined);
    const uniqueUsers = new Map(admins.map(user => [user.id, user])).values();
    return Array.from(uniqueUsers);
  });

  public readonly parentLocations: Signal<Location[]> = computed(
    () => this.locationsDataService.getProjectLocations(this.projectId())() ?? []
  );

  public readonly availableLocations: Signal<Location[]> = computed(() => {
    const parentLocations = this.parentLocations();
    const allSublocations = parentLocations.flatMap(location =>
      location?.id ? this.locationsDataService.getAllSubLocations(location.id) : []
    );
    return [...parentLocations, ...allSublocations];
  });

  public readonly orderBy: Signal<TaskSortField> = this._orderBy.asReadonly();
  public readonly order: Signal<SortDirection> = this._order.asReadonly();
  public readonly limit: Signal<number> = this._limit.asReadonly();
  public readonly page: Signal<number> = this._page.asReadonly();
  public readonly taskFiltersId: Signal<string | null> = this._taskFiltersId.asReadonly();
  public readonly searchPhrase: Signal<string | undefined> = computed(() => this._filters()?.text ?? undefined);
  public readonly filters: Signal<TaskFilters | null> = this._filters.asReadonly();

  public readonly activeFiltersCount: Signal<number> = computed(() => {
    const filters: TaskFilters | null = this._filters();
    let count = 0;
    if (filters?.text?.trim?.()) count += 1;
    if (!filters) return count;
    if (filters.taskStatus?.length) count += filters.taskStatus.length;
    if (filters.taskPriority?.length) count += filters.taskPriority.length;
    if (filters.group?.length) count += filters.group.length;
    if (filters.user?.length) count += filters.user.length;
    if (filters.location?.length) count += filters.location.length;
    if (filters.industry?.length) count += filters.industry.length;
    if (filters.userRole?.length) count += filters.userRole.length;
    if (filters.createdBy?.length) count += filters.createdBy.length;
    if (filters.projectTagIds?.length) count += filters.projectTagIds.length;
    if (filters.taskTypeIds?.length) count += filters.taskTypeIds.length;
    if (filters.startDateFrom != null || filters.startDateTo != null) count += 1;
    if (filters.endDateFrom != null || filters.endDateTo != null) count += 1;
    if (filters.createdDateFrom != null || filters.createdDateTo != null) count += 1;
    if (filters.editDateFrom != null || filters.editDateTo != null) count += 1;
    if (filters.noIndustry ?? false) count += 1;
    if (filters.noUsers ?? false) count += 1;
    if (filters.noLocation ?? false) count += 1;
    if (filters.noGroup ?? false) count += 1;
    return count;
  });

  public constructor() {
    this.subscribeToFiltersFromUrl();
    this.updateUrl();
  }

  private subscribeToFiltersFromUrl(): void {
    this.activatedRoute.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(queryParams => {
      const orderFromUrl = queryParams.get('order');
      const orderByFromUrl = queryParams.get('orderBy');
      const limitFromUrl = queryParams.get('limit');
      const pageFromUrl = queryParams.get('page');
      if (orderFromUrl) {
        const parsedOrder = Object.values(SortDirection).find(
          enumValue => enumValue.toLowerCase() === orderFromUrl.toLowerCase()
        );
        if (parsedOrder && this._order() !== parsedOrder) this._order.set(parsedOrder);
      }
      if (orderByFromUrl) {
        const parsedOrderBy = Object.values(TaskSortField).find(
          enumValue => enumValue.toLowerCase() === orderByFromUrl.toLowerCase()
        );
        if (parsedOrderBy && this._orderBy() !== parsedOrderBy) this._orderBy.set(parsedOrderBy);
      }
      if (limitFromUrl) {
        const limitNumber = +limitFromUrl;
        if (!isNaN(limitNumber) && this._limit() !== limitNumber) this._limit.set(limitNumber);
      }
      if (pageFromUrl) {
        const pageNumber = +pageFromUrl;
        if (!isNaN(pageNumber) && this._page() !== pageNumber) this._page.set(pageNumber);
      }
      const taskFiltersIdFromUrl = queryParams.get('taskFiltersId');
      if (this._taskFiltersId() !== (taskFiltersIdFromUrl ?? null)) {
        this._taskFiltersId.set(taskFiltersIdFromUrl ?? null);
      }
    });
  }

  public setOrderBy(value: TaskSortField | null): void {
    this._orderBy.set(value ?? DEFAULT_ORDER_BY);
    this.updateUrl();
  }

  public setOrder(value: SortDirection): void {
    this._order.set(value);
    this.updateUrl();
  }

  public setLimit(value: number): void {
    this._limit.set(value);
    this.updateUrl();
  }

  public setPage(value: number): void {
    this._page.set(value);
    this.updateUrl();
  }

  public setTaskFiltersId(value: string | null): void {
    this._taskFiltersId.set(value);
    this.updateUrl();
  }

  public setSearchPhrase(value: string | null): void {
    const trimmed = value?.trim() ?? undefined;
    this._filters.update(filters => ({ ...filters, text: trimmed }));
    this._page.set(0);
    this.updateUrl();
  }

  public setFiltersFromResponse(filtersId?: string | null, filters?: TaskFilters | null): void {
    if (filtersId !== undefined) this._taskFiltersId.set(filtersId ?? null);
    if (filters !== undefined) this._filters.set(filters ?? null);
    this.updateUrl();
  }

  public clearFilters(): void {
    this._orderBy.set(DEFAULT_ORDER_BY);
    this._order.set(DEFAULT_ORDER);
    this._limit.set(DEFAULT_LIMIT);
    this._page.set(DEFAULT_PAGE);
    this._taskFiltersId.set(null);
    this._filters.set({});
    this.updateUrl();
  }

  private updateUrl(): void {
    const queryParams = this.activatedRoute.snapshot.queryParamMap;
    const currentOrderInUrl = queryParams.get('order');
    const currentOrderByInUrl = queryParams.get('orderBy');
    const currentFiltersIdInUrl = queryParams.get('taskFiltersId');
    const currentPageInUrl = queryParams.get('page');
    const currentLimitInUrl = queryParams.get('limit');

    if (
      currentOrderInUrl === this._order() &&
      currentOrderByInUrl === this._orderBy() &&
      currentFiltersIdInUrl === (this._taskFiltersId() ?? null) &&
      Number(currentPageInUrl) === this._page() &&
      Number(currentLimitInUrl) === this._limit()
    ) {
      return;
    }
    void this.router.navigate([], {
      queryParams: {
        taskFiltersId: this._taskFiltersId() ?? undefined,
        orderBy: this._orderBy(),
        order: this._order(),
        limit: this._limit(),
        page: this._page()
      },
      queryParamsHandling: 'merge'
    });
  }

  public updateFiltersField(fieldName: keyof TaskFilters, value: unknown): void {
    const current = this.filters();
    let filters: TaskFilters | null = current ? structuredClone(current) : {};

    (filters as Record<string, unknown>)[fieldName] = value;
    if (this.areFiltersEmpty(filters)) filters = null;
    this.applyFilters(filters);
  }

  /** Clears both bounds of a date-range filter in one update (URL / store). */
  public clearDateRangeFilter(fromField: keyof TaskFilters, toField: keyof TaskFilters): void {
    const current = this.filters();
    let filters: TaskFilters | null = current ? structuredClone(current) : {};
    const record = filters as Record<string, unknown>;
    delete record[fromField as string];
    delete record[toField as string];
    if (this.areFiltersEmpty(filters)) filters = null;
    this.applyFilters(filters);
  }

  public applyFilters(filters: TaskFilters | null): void {
    this._filters.set(filters);
    if (filters === null || filters === undefined) {
      this._taskFiltersId.set(null);
    }
    this._page.set(0);
    this.updateUrl();
  }

  private areFiltersEmpty(filters: TaskFilters): boolean {
    let filled = false;
    if (!filters) return true;
    Object.values(filters).forEach(filterValue => {
      if (filterValue === null || filterValue === undefined) return;
      if (typeof filterValue === 'boolean' && filterValue === true) {
        filled = true;
      } else if (filterValue?.length > 0) {
        filled = true;
      } else if (typeof filterValue === 'string' && filterValue === '') {
        filled = true;
      } else if (typeof filterValue === 'object' && filterValue instanceof Date) {
        filled = true;
      }
    });
    return !filled;
  }
}
