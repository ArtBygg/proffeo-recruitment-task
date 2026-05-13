import { ChangeDetectionStrategy, Component, inject, signal, Signal, WritableSignal } from '@angular/core';
import { ImportTasksFromTemplateComponent } from '@app/components/task/import-tasks-from-template/import-tasks-from-template.component';
import { ShortcutFiltersComponent } from '@app/components/task/task-list-toolbar/shortcut-filters/shortcut-filters.component';
import { TaskFiltersPanelComponent } from '@app/components/task/task-list-toolbar/task-filters-panel/task-filters-panel.component';
import { TaskFiltersService } from '@app/components/task/task-list-toolbar/task-filters.service';
import { TaskFiltersComponent } from '@app/components/task/task-list-toolbar/task-filters/task-filters';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { InputComponent } from '@app/shared/components/input/input.component';
import { FilterCountBadgeDirective } from '@app/shared/directives/filter-count-badge.directive';
import { ActiveProjectService } from '@app/shared/services/active-project.service';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { Project } from '@app/shared/types/models/project/project.model';
import { TasksListActionsService } from '@app/views/company/projects/tasks/tasks-list-actions.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-task-list-toolbar',
  templateUrl: './task-list-toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    ShortcutFiltersComponent,
    TaskFiltersComponent,
    TaskFiltersPanelComponent,
    ImportTasksFromTemplateComponent,
    FilterCountBadgeDirective,
    TranslateModule,
    InputComponent
  ]
})
export class TaskListToolbarComponent {
  private readonly taskFiltersState: TaskFiltersService = inject(TaskFiltersService);
  private readonly tasksListService: TasksListActionsService = inject(TasksListActionsService);
  private readonly deviceService: DeviceService = inject(DeviceService);
  private readonly activeProjectService: ActiveProjectService = inject(ActiveProjectService);

  protected readonly ButtonType = ButtonType;
  protected readonly showFilters: WritableSignal<boolean> = signal(false);
  protected readonly showImportSection: WritableSignal<boolean> = signal(false);

  protected readonly searchPhrase = this.taskFiltersState.searchPhrase;
  protected readonly activeFiltersCount = this.taskFiltersState.activeFiltersCount;
  protected readonly activeProject: Signal<Project> = this.activeProjectService.activeProject;
  protected readonly isMobile: Signal<boolean> = this.deviceService.isMobile;

  protected onSearch(searchValue: string | null): void {
    this.taskFiltersState.setSearchPhrase(searchValue ?? null);
  }

  protected filtersCleared(): void {
    this.taskFiltersState.clearFilters();
  }

  protected startTaskCreation(): void {
    this.tasksListService.startTaskCreation();
  }
}
