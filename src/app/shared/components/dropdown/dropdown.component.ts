import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, InputSignal, output, TemplateRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { AbstractSharedComponentBase } from '@app/shared/types/models/shared/abstract-shared-component-base';
import { DropdownItem } from '@app/shared/types/models/shared/dropdown-item';
import { provideValueAccessorForSharedHelper } from '@app/shared/utils/provide-value-accessor-for-shared.helper';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatSelectModule, TranslateModule, MatIconModule, NgClass],
  providers: [provideValueAccessorForSharedHelper(DropdownComponent)]
})
export class DropdownComponent<T> extends AbstractSharedComponentBase<T> {
  public readonly dropdownItems = input.required<DropdownItem<T>[]>();
  public readonly itemPrefixTemplate = input<TemplateRef<unknown>>(undefined);
  public readonly widthTwClass = input<string>('w-28');
  public readonly hideArrow = input<boolean>(false);
  public readonly disableStyling = input<boolean>(false);
  public readonly multiple = input<boolean>(false);

  public readonly placeholder = input<string>('');
  public readonly translateLabels = input<boolean>(true);
  public readonly selected: InputSignal<T> = input();

  public readonly valueChange = output<T>();

  public constructor() {
    super();
    effect(() => {
      const sel = this.selected();
      if (sel !== this._value) {
        this._value = sel;
        this.cdr.markForCheck();
      }
    });
  }

  protected override emitValue(val: T): void {
    this.valueChange.emit(val);
  }

  protected getSelectedItems(): DropdownItem<T>[] {
    let selectedItem: T[] = [];

    if (!Array.isArray(this.internalValue)) {
      selectedItem.push(this.internalValue);
    } else {
      selectedItem = this.internalValue ?? [];
    }

    if (selectedItem?.length === 0) {
      return [];
    }

    return (
      this.dropdownItems()?.filter(item => {
        const found = selectedItem?.find(selected => selected === item.value);
        return found !== null && found !== undefined;
      }) ?? []
    );
  }
}
