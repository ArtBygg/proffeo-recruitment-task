import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { SelectMultipleLocationsModalResult } from '@app/components/modals/select-multiple-locations-modal/select-multiple-locations-modal.component';
import { TagComponent } from '@app/shared/components/tag/tag.component';
import { FilterCountBadgeDirective } from '@app/shared/directives/filter-count-badge.directive';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { SortDirection } from '@app/shared/types/enums/sort-direction.enum';
import { TaskPriority } from '@app/shared/types/enums/task-priority.enum';
import { TaskSortField } from '@app/shared/types/enums/task-sort-field';
import { TaskStatus } from '@app/shared/types/enums/task-status.enum';
import { Group } from '@app/shared/types/models/group/group.model';
import { Tag } from '@app/shared/types/models/tag/tag.model';
import { TaskFilters, TaskUserRoleFilter } from '@app/shared/types/models/task/task-filters.model';
import { TranslatePipe } from '@ngx-translate/core';
import {
  FilterMultiSelectMenuComponent,
  FilterMultiSelectOption
} from '../filter-multi-select-menu/filter-multi-select-menu.component';
import { TaskFiltersHelperService } from '../task-filters-helper.service';
import { TaskFiltersService } from '../task-filters.service';

@Component({
  selector: 'proffeo-task-filters',
  imports: [
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    FilterMultiSelectMenuComponent,
    MatTooltip,
    TranslatePipe,
    MatDateRangeInput,
    MatFormFieldModule,
    MatDatepickerToggle,
    MatDateRangePicker,
    MatStartDate,
    MatEndDate,
    TagComponent,
    FilterCountBadgeDirective,
    MatCheckboxModule
  ],
  templateUrl: './task-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskFiltersComponent {
  private readonly deviceService: DeviceService = inject(DeviceService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  protected readonly taskFiltersService: TaskFiltersService = inject(TaskFiltersService);
  protected readonly taskFiltersHelperService: TaskFiltersHelperService = inject(TaskFiltersHelperService);

  protected readonly SortDirection: typeof SortDirection = SortDirection;
  protected readonly orderBy: Signal<TaskSortField> = this.taskFiltersService.orderBy;
  protected readonly order: Signal<SortDirection> = this.taskFiltersService.order;
  protected readonly filters: Signal<TaskFilters | null> = this.taskFiltersService.filters;
  protected readonly today: Signal<Date> = signal(new Date());
  protected readonly sortByOptions: Signal<TaskSortField[]> = this.taskFiltersService.availableSortByOptions;
  protected readonly statusOptions: Signal<FilterMultiSelectOption<TaskStatus>[]> =
    this.taskFiltersService.availableStatusOptions;
  protected readonly priorityOptions: Signal<FilterMultiSelectOption<TaskPriority>[]> =
    this.taskFiltersService.availablePriorityOptions;
  protected readonly industriesOptions: Signal<FilterMultiSelectOption<string>[]> =
    this.taskFiltersService.availableIndustriesOptions;
  protected readonly usersOptions: Signal<FilterMultiSelectOption<string>[]> =
    this.taskFiltersService.availableUsersOptions;
  protected readonly tagsOptions: Signal<FilterMultiSelectOption<string, Tag>[]> =
    this.taskFiltersService.availableTagsOptions;
  protected readonly taskTypesOptions: Signal<FilterMultiSelectOption<string>[]> =
    this.taskFiltersService.availableTaskTypes;
  protected readonly isMobile: Signal<boolean> = this.deviceService.isMobile;

  protected updateFiltersField(fieldName: keyof TaskFilters, value: unknown): void {
    this.taskFiltersService.updateFiltersField(fieldName, value);
  }

  protected clearDateRangeFilter(event: MouseEvent, fromField: keyof TaskFilters, toField: keyof TaskFilters): void {
    event.stopPropagation();
    this.taskFiltersService.clearDateRangeFilter(fromField, toField);
  }

  protected toggleSortDir(): void {
    this.taskFiltersService.setOrder(this.order() === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC);
  }

  protected setOrderBy(value: TaskSortField | null): void {
    this.taskFiltersService.setOrderBy(value);
  }

  protected onSelectLocationsClick(event: MouseEvent): void {
    event.preventDefault();
    this.taskFiltersHelperService
      .openSelectLocationsModal()
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: SelectMultipleLocationsModalResult | undefined) => {
        if (result === undefined) return;
        this.taskFiltersService.updateFiltersField(
          'location',
          result.selectedLocations.map(location => location.id)
        );
        this.taskFiltersService.updateFiltersField('noLocation', result.noLocation);
      });
  }

  protected onSelectGroupsClick(event: MouseEvent): void {
    event.preventDefault();
    this.taskFiltersHelperService
      .openSelectGroupsModal()
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: Group[] | undefined) => {
        if (result === null || result === undefined) return;
        this.taskFiltersService.updateFiltersField(
          'group',
          result.map(group => group.id)
        );
      });
  }

  protected onSelectUserRoleClick(event: MouseEvent): void {
    event.preventDefault();
    this.taskFiltersHelperService
      .openSelectUserRoleModal()
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: TaskUserRoleFilter[] | undefined) => {
        if (!result) return;
        const activeFilters = result.filter(
          userRoleFilter => userRoleFilter.applicationUserId != null && userRoleFilter.applicationUserId !== ''
        );
        this.taskFiltersService.updateFiltersField('userRole', activeFilters);
      });
  }
}
