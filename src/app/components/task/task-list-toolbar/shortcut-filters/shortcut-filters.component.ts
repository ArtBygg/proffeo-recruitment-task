import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, output, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { SelectMultipleLocationsModalResult } from '@app/components/modals/select-multiple-locations-modal/select-multiple-locations-modal.component';
import { FilterCountBadgeDirective } from '@app/shared/directives/filter-count-badge.directive';
import { AuthService } from '@app/shared/services/auth.service';
import { SortDirection } from '@app/shared/types/enums/sort-direction.enum';
import { TaskSortField } from '@app/shared/types/enums/task-sort-field';
import { TaskFilters } from '@app/shared/types/models/task/task-filters.model';
import { TranslatePipe } from '@ngx-translate/core';
import { FilterMultiSelectMenuComponent } from '../filter-multi-select-menu/filter-multi-select-menu.component';
import { TaskFiltersHelperService } from '../task-filters-helper.service';
import { TaskFiltersService } from '../task-filters.service';

@Component({
  selector: 'proffeo-shortcut-filters',
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltip,
    TranslatePipe,
    FilterCountBadgeDirective,
    FilterMultiSelectMenuComponent
  ],
  templateUrl: './shortcut-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShortcutFiltersComponent {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly taskFiltersService = inject(TaskFiltersService);
  protected readonly taskFiltersHelperService = inject(TaskFiltersHelperService);
  protected readonly SortDirection = SortDirection;
  protected readonly orderBy: Signal<TaskSortField> = this.taskFiltersService.orderBy;
  protected readonly order: Signal<SortDirection> = this.taskFiltersService.order;
  protected readonly filters: Signal<TaskFilters> = this.taskFiltersService.filters;
  protected readonly sortByOptions: Signal<TaskSortField[]> = this.taskFiltersService.availableSortByOptions;
  protected readonly industriesOptions = this.taskFiltersService.availableIndustriesOptions;
  protected readonly activeFiltersCount = this.taskFiltersService.activeFiltersCount;

  protected readonly myTasksFilterBadgeCount = computed((): number => {
    const userIds = this.filters()?.user;
    const me = this.authService.currentUser()?.id;
    if (me == null || userIds == null || userIds.length !== 1) {
      return 0;
    }
    return userIds[0] === me ? 1 : 0;
  });

  protected readonly locationsFilterBadgeCount = computed((): number => {
    const count = this.filters()?.location?.length ?? 0;
    const extra = this.filters()?.noLocation === true ? 1 : 0;
    return count + extra;
  });

  public readonly openFiltersPanel = output<void>();

  protected toggleSortDir(): void {
    this.taskFiltersService.setOrder(this.order() === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC);
  }

  protected setOrderBy(value: TaskSortField | null): void {
    this.taskFiltersService.setOrderBy(value);
  }

  protected updateFiltersField(fieldName: keyof TaskFilters, value: unknown): void {
    this.taskFiltersService.updateFiltersField(fieldName, value);
  }

  protected clearFilters(): void {
    this.taskFiltersService.clearFilters();
  }

  protected emitOpenFiltersPanel(): void {
    this.openFiltersPanel.emit();
  }

  protected onSelectLocationsClick(): void {
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
}
