import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  OnInit,
  signal,
  Signal,
  untracked
} from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { TaskFiltersService } from '@app/components/task/task-list-toolbar/task-filters.service';
import { TaskSplitviewListComponent } from '@app/components/task/task-splitview-list/task-splitview-list.component';
import { PageWrapperComponent } from '@app/shared/components/page-wrapper/page-wrapper.component';
import { IntlCurrencyPipe } from '@app/shared/pipes/intl-currency.pipe';
import { IntlDurationPipe } from '@app/shared/pipes/intl-duration.pipe';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { TASK_STATUS_DISPLAY } from '@app/shared/types/enums/task-status.constants';
import { TableColumn } from '@app/shared/types/models/shared/table-column';
import { Task } from '@app/shared/types/models/task/task.model';
import { TasksPageData } from '@app/shared/types/models/tasks-page-data';
import { formatTime } from '@app/shared/utils/time-format-utils';
import { ActiveTaskService } from '@app/views/company/projects/tasks/active-task.service';
import { TasksListActionsService } from '@app/views/company/projects/tasks/tasks-list-actions.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-project-tasks-view',
  templateUrl: './project-tasks-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageWrapperComponent, TranslateModule, CommonModule, TaskSplitviewListComponent, MatPaginatorModule],
  providers: []
})
export class ProjectTasksViewComponent implements OnInit {
  private readonly deviceService: DeviceService = inject(DeviceService);
  private readonly router: Router = inject(Router);
  private readonly datePipe: DatePipe = inject(DatePipe);
  private readonly intlDurationPipe: IntlDurationPipe = inject(IntlDurationPipe);
  private readonly intlCurrencyPipe: IntlCurrencyPipe = inject(IntlCurrencyPipe);
  private readonly tasksListService: TasksListActionsService = inject(TasksListActionsService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly activeTaskService: ActiveTaskService = inject(ActiveTaskService);
  protected readonly taskFiltersState: TaskFiltersService = inject(TaskFiltersService);

  protected total = signal(0);
  protected isMyTasksMode: boolean = false;
  protected selectedTabIndex: number = 0;
  protected tasks: Signal<TasksPageData | undefined> = this.tasksListService.filteredTasksPage;
  protected activeTask: Signal<Task> = this.activeTaskService.activeTask;

  protected isLoading = computed(() => {
    const currentTasks = this.tasks();
    return !currentTasks || currentTasks.content === undefined;
  });
  protected columns: Signal<TableColumn[]> = signal<TableColumn[]>([
    {
      key: 'name',
      label: this.translateService.instant('project-tasks.list.column-headers.name'),
      sortable: true,
      isIdentifier: true,
      maxWidth: '150px',
      minWidth: '150px'
    },
    {
      key: 'taskType',
      label: this.translateService.instant('project-tasks.list.column-headers.type'),
      sortable: true,
      renderFn: (task: Task) => task.taskType()?.name,
      minWidth: '120px'
    },
    {
      key: 'taskNumber',
      label: this.translateService.instant('project-tasks.list.column-headers.number'),
      sortable: true,
      minWidth: '100px'
    },
    {
      key: 'status',
      label: this.translateService.instant('project-tasks.list.column-headers.status'),
      sortable: true,
      renderFn: (task: Task) => this.translateService.instant(TASK_STATUS_DISPLAY[task.status].translationKey),
      minWidth: '100px'
    },
    {
      key: 'description',
      label: this.translateService.instant('project-tasks.list.column-headers.description'),
      sortable: false,
      renderFn: (task: Task) => this.removeHtmlTags(task.description || ''),
      maxWidth: '200px'
    },
    {
      key: 'priority',
      label: this.translateService.instant('project-tasks.list.column-headers.priority'),
      sortable: true,
      minWidth: '100px'
    },
    {
      key: 'projectIndustry',
      label: this.translateService.instant('project-tasks.list.column-headers.industry'),
      sortable: false,
      renderFn: (task: Task): string => {
        const projectIndustry = task.projectIndustry?.();
        const industry = projectIndustry?.industry?.();
        return industry?.name || '';
      }
    },
    {
      key: 'projectGroupAdministrator',
      label: this.translateService.instant('project-tasks.list.column-headers.group'),
      sortable: false,
      renderFn: (task: Task): string => {
        const admin = task.projectGroupAdministrator?.();
        const group = admin?.group?.();
        return group?.name || '';
      }
    },
    {
      key: 'createdBy',
      label: this.translateService.instant('project-tasks.list.column-headers.user'),
      sortable: true,
      renderFn: (task: Task) => task.createdBy()?.fullName,
      minWidth: '200px'
    },
    {
      key: 'createdAt',
      label: this.translateService.instant('project-tasks.list.column-headers.created-at'),
      sortable: true,
      renderFn: (task: Task) => this.datePipe.transform(task.createdAt ?? undefined, 'yyyy-MM-dd') || '',
      minWidth: '120px'
    },
    {
      key: 'endDate',
      label: this.translateService.instant('project-tasks.list.column-headers.end-date'),
      sortable: true,
      renderFn: (task: Task) => this.datePipe.transform(task.endDate ?? undefined, 'yyyy-MM-dd') || '',
      minWidth: '120px'
    },
    {
      key: 'estimation.time',
      label: this.translateService.instant('project-tasks.list.column-headers.estimation-time'),
      sortable: false,
      renderFn: (task: Task) => this.intlDurationPipe.transform(task.estimation?.time).toString()
    },
    {
      key: 'estimation.financial',
      label: this.translateService.instant('project-tasks.list.column-headers.estimation-currency'),
      sortable: false,
      renderFn: (task: Task) =>
        this.intlCurrencyPipe
          .transform(task.estimation?.financial?.amount, task.estimation?.financial?.currency)
          .toString()
    },
    {
      key: 'taskTotalTrackedSeconds',
      label: this.translateService.instant('project-tasks.list.column-headers.total-hours'),
      sortable: false,
      renderFn: (task: Task) => formatTime(task.taskTotalTrackedSeconds)
    }
  ]);

  public constructor() {
    effect(() => {
      const tasks = this.tasks();
      if (!tasks) return;

      untracked(() => {
        this.taskFiltersState.setFiltersFromResponse(tasks.filtersId, tasks.filters);
      });
    });

    effect(() => {
      const task = this.activeTask();
      if (!task) return;

      if (task.name) return;

      const allTasks = this.tasks()?.content || [];
      const taskSignal = allTasks.find(t => t().id === task.id);
      const found = taskSignal?.();

      if (found) {
        this.activeTaskService.setActiveTask(found);
        return;
      }

      const taskById: Task = this.tasksListService.getTaskById(task.id)();
      if (taskById) {
        this.activeTaskService.setActiveTask(taskById);
      }
    });
  }

  protected get isMobile(): Signal<boolean> {
    return this.deviceService.isMobile;
  }

  @HostListener('window:keydown.escape')
  protected onDetailsClosed(): void {
    if (!this.isMobile() && this.activeTask()) {
      this.activeTaskService.unsetActiveTask();
    }
  }

  protected onPageEvent(event: PageEvent): void {
    this.taskFiltersState.setPage(event.pageIndex);
    this.taskFiltersState.setLimit(event.pageSize);
  }

  public ngOnInit(): void {
    this.isMyTasksMode = this.router.url.includes('/my-tasks');
    this.selectedTabIndex = this.isMyTasksMode ? 1 : 0;
  }

  private removeHtmlTags(text: string): string {
    let trimmedDesc = text.replace(/<\/?[^>]+(>|$)/g, '').trim();
    trimmedDesc = trimmedDesc.replace(/\s+/g, ' ');
    return trimmedDesc.length > 100 ? trimmedDesc.substring(0, 100) + '...' : trimmedDesc;
  }
}
