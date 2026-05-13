import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, ViewChild } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { InputComponent } from '@app/shared/components/input/input.component';
import { AbstractSharedComponentBase } from '@app/shared/types/models/shared/abstract-shared-component-base';
import { DropdownItem } from '@app/shared/types/models/shared/dropdown-item';
import { provideValueAccessorForSharedHelper } from '@app/shared/utils/provide-value-accessor-for-shared.helper';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-dropdown-with-search',
  templateUrl: './dropdown-with-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatSelectModule, TranslateModule, MatIconModule, NgClass, MatMenuModule, MatCheckboxModule, InputComponent],
  providers: [provideValueAccessorForSharedHelper(DropdownWithSearchComponent)]
})
export class DropdownWithSearchComponent extends AbstractSharedComponentBase<string | string[]> {
  @ViewChild(MatMenuTrigger) public menuTrigger: MatMenuTrigger;

  private searchQuery = signal('');

  public readonly selected = input<string | string[]>(undefined, { alias: 'value' });
  public readonly valueChange = output<string | string[]>();
  public filteredDropdownItems = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query.trim()) {
      return this.dropdownItems();
    }
    return this.dropdownItems().filter(item => item.label.toLowerCase().includes(query));
  });

  public dropdownItems = input.required<DropdownItem<string>[]>();
  public toggleMatIconName = input<string>();
  public widthTwClass = input('w-28');
  public hideArrow = input(false);
  public multiple = input(false);
  public placeholder = input('placeholders.search-input');
  public translateLabels = input(true);

  public constructor() {
    super();
    effect(() => {
      const sel = this.selected();
      if (sel !== undefined) {
        const currentValue = this.internalValue;
        const isDifferent =
          Array.isArray(sel) && Array.isArray(currentValue)
            ? JSON.stringify(sel) !== JSON.stringify(currentValue)
            : sel !== currentValue;
        if (isDifferent) {
          this._value = sel;
          this.cdr.markForCheck();
        }
      }
    });
  }

  protected override emitValue(val: string | string[]): void {
    this.valueChange.emit(val);
  }

  protected isSelected(itemValue: string): boolean {
    return this.getValueArray().includes(itemValue);
  }

  protected isAllSelected(): boolean {
    return this.getValueArray().length === this.dropdownItems().length && this.dropdownItems().length > 0;
  }

  protected isSomeSelected(): boolean {
    return this.getValueArray().length > 0 && this.getValueArray().length < this.dropdownItems().length;
  }

  protected getSelectedItems(): DropdownItem<string>[] {
    const value = this.getValueArray();
    if (!value || value.length === 0) {
      return [];
    }
    return this.dropdownItems()?.filter(item => value.includes(item.value)) ?? [];
  }

  private getValueArray(): string[] {
    const val = this.internalValue;
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return [val];
  }

  protected selectAll(checked: boolean): void {
    this.internalValue = checked ? this.dropdownItems().map(item => item.value) : [];
  }

  protected searchInputChange(value: string): void {
    this.searchQuery.set(value);
  }

  protected selectItem(itemValue: string, checked: boolean): void {
    const currentValues = this.getValueArray();

    if (this.multiple()) {
      if (checked) {
        if (!currentValues.includes(itemValue)) {
          this.internalValue = [...currentValues, itemValue];
        }
      } else {
        this.internalValue = currentValues.filter((value: string) => value !== itemValue);
      }
    } else {
      this.internalValue = checked ? itemValue : null;
      if (checked) {
        this.menuTrigger?.closeMenu();
      }
    }
    this.cdr.markForCheck();
  }

  protected selectSingleItem(itemValue: string): void {
    this.internalValue = this.multiple() ? [itemValue] : itemValue;
    this.menuTrigger?.closeMenu();
    this.cdr.markForCheck();
  }
}
