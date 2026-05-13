import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  output,
  signal,
  TemplateRef
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { FilterCountBadgeDirective } from '@app/shared/directives/filter-count-badge.directive';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

export interface FilterMultiSelectOption<T = unknown, R = unknown | undefined> {
  value: T;
  label: string;
  context?: R;
}

export interface FilterMultiSelectOptionTemplateContext<T> {
  $implicit: FilterMultiSelectOption<T>;
  option: FilterMultiSelectOption<T>;
}

@Component({
  selector: 'proffeo-filter-multi-select-menu',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatTooltip,
    TranslatePipe,
    FilterCountBadgeDirective
  ],
  templateUrl: './filter-multi-select-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterMultiSelectMenuComponent<T> {
  private readonly translateService: TranslateService = inject(TranslateService);

  protected readonly fieldLabel: InputSignal<string> = input.required<string>();
  protected readonly options = input.required<FilterMultiSelectOption<T>[]>();
  protected readonly selected: InputSignal<T[]> = input.required<T[]>();
  protected readonly enableEmptyValueCheckbox = input<boolean>(false);
  protected readonly emptyValueSelected: InputSignal<boolean> = input<boolean>(false);
  protected readonly optionTemplate = input<TemplateRef<FilterMultiSelectOptionTemplateContext<T>> | null>(null);
  protected readonly menuOpen = signal(false);
  protected readonly displayValue = computed(() => {
    const selectedValues = this.selected();
    const availableOptions = this.options();
    if (!selectedValues.length) {
      if (this.enableEmptyValueCheckbox() && this.emptyValueSelected()) {
        return this.translateService.instant('task-filters.emptyValue');
      }
      return '';
    }
    return selectedValues
      .map(selectedValue =>
        this.translateService.instant(availableOptions.find(option => option.value === selectedValue)?.label ?? '')
      )
      .join(', ');
  });

  public readonly selectionChange = output<T[]>();
  public readonly emptyValueChange = output<boolean>();

  protected allSelected(): boolean {
    const availableOptions = this.options();
    const selectedValues = this.selected();
    return availableOptions.length > 0 && selectedValues.length === availableOptions.length;
  }

  protected someSelected(): boolean {
    const selectedValues = this.selected();
    const availableOptions = this.options();
    return selectedValues.length > 0 && selectedValues.length < availableOptions.length;
  }

  protected isSelected(value: T): boolean {
    return this.selected().includes(value);
  }

  protected toggleEmptyValueFilter(): void {
    const newEmptyValueFilter = !this.emptyValueSelected();
    this.emptyValueChange.emit(newEmptyValueFilter);
    if (newEmptyValueFilter) {
      this.selectionChange.emit([]);
    }
  }

  protected onMenuOpened(): void {
    this.menuOpen.set(true);
  }

  protected onMenuClosed(): void {
    this.menuOpen.set(false);
  }

  protected toggleOption(value: T): void {
    const newSelection = this.isSelected(value)
      ? this.selected().filter(selectedItem => selectedItem !== value)
      : [...this.selected(), value];
    if (this.enableEmptyValueCheckbox()) {
      this.emptyValueChange.emit(false);
    }
    this.selectionChange.emit(newSelection);
  }

  protected toggleSelectAll(): void {
    const newSelectedAll = !this.allSelected();
    const newSelection = newSelectedAll ? this.options().map(option => option.value) : [];
    if (this.enableEmptyValueCheckbox()) {
      this.emptyValueChange.emit(false);
    }
    this.selectionChange.emit(newSelection);
  }

  protected countFilterSelectedValues(): number {
    return this.selected().length + (this.emptyValueSelected() ? 1 : 0);
  }
}
