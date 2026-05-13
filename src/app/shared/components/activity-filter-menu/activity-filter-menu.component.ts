import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import {
  ACTIVITY_FILTER_CONFIGS,
  ActivityFiltersMap,
  getDefaultActivityFiltersMap
} from '@app/shared/utils/activity-utils';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-activity-filter-menu',
  templateUrl: './activity-filter-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCheckboxModule, TranslateModule]
})
export class ActivityFilterMenuComponent {
  private readonly filters: WritableSignal<ActivityFiltersMap> = signal(getDefaultActivityFiltersMap());

  protected readonly filterConfigs = ACTIVITY_FILTER_CONFIGS;
  protected readonly selectedCount = computed(() => {
    const map = this.filters();
    return Object.values(map).filter(Boolean).length;
  });
  protected readonly allSelected = computed(() => this.selectedCount() === this.filterConfigs.length);
  protected readonly indeterminate = computed(() => {
    const count = this.selectedCount();
    return count > 0 && count < this.filterConfigs.length;
  });

  public readonly filtersChange: OutputEmitterRef<ActivityFiltersMap> = output<ActivityFiltersMap>();

  public constructor() {
    effect(() => {
      this.filtersChange.emit(this.filters());
    });
  }

  protected setFilter(filteredType: TaskActivityType, value: boolean): void {
    this.filters.update(prev => ({ ...prev, [filteredType]: value }));
  }

  protected toggleAll(): void {
    const allCurrentlySelected = this.allSelected();
    const updated = {} as ActivityFiltersMap;
    for (const key of Object.values(TaskActivityType)) {
      updated[key] = !allCurrentlySelected;
    }
    this.filters.set(updated);
  }
}
