import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { CheckboxComponent } from '@app/shared/components/checkbox/checkbox.component';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../input/input.component';

export interface FilterItem {
  id: string | number;
  label: string;
  selected: boolean;
  subOptions?: {
    id: string | number;
    label: string;
    selected: boolean;
  }[];
}

@Component({
  selector: 'proffeo-filter-section',
  templateUrl: './filter-section.component.html',
  imports: [CommonModule, MatExpansionModule, CheckboxComponent, TranslateModule, InputComponent]
})
export class FilterSectionComponent {
  protected readonly searchQuery = signal('');
  protected readonly filteredItems = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();
    if (!search) return this.items();

    return this.items()
      .map(item => {
        const labelMatch = item.label.toLowerCase().includes(search);

        return labelMatch ? item : null;
      })
      .filter((item): item is FilterItem => !!item);
  });
  protected readonly hasSubOptions = computed(() =>
    this.filteredItems().some(item => item.subOptions && item.subOptions.length > 0)
  );

  public readonly title = input.required<string>();
  public readonly items = input.required<FilterItem[]>();
  public readonly showSearch = input<boolean>(undefined);
  public itemToggled = output<FilterItem>();
  public subItemToggled = output<{
    parent: FilterItem;
    subItem: { id: string | number; label: string; selected: boolean };
  }>();

  public get selectedCount(): number {
    return this.items().reduce((count, item) => {
      if (item.subOptions) {
        return count + item.subOptions.filter(sub => sub.selected).length;
      }
      return count + (item.selected ? 1 : 0);
    }, 0);
  }

  public onToggle(item: FilterItem): void {
    this.itemToggled.emit(item);
  }

  public onSubToggle(parent: FilterItem, subItem: { id: string | number; label: string; selected: boolean }): void {
    this.subItemToggled.emit({ parent, subItem });
  }
}
