import { Component, computed, input, output, signal } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { AbstractSharedComponentBase } from '@app/shared/types/models/shared/abstract-shared-component-base';
import { provideValueAccessorForSharedHelper } from '@app/shared/utils/provide-value-accessor-for-shared.helper';

@Component({
  selector: 'proffeo-checkbox',
  templateUrl: './checkbox.component.html',
  imports: [MatCheckboxModule],
  providers: [provideValueAccessorForSharedHelper(CheckboxComponent)]
})
export class CheckboxComponent extends AbstractSharedComponentBase<boolean> {
  private controlValue = signal<boolean | undefined>(undefined);

  protected localValue = computed(() => {
    const external = this.checked();

    if (external !== undefined) {
      return external;
    }

    return this.controlValue() ?? false;
  });

  public readonly label = input<string>('');
  public readonly labelTailwindClasses = input<string>('');
  public readonly isControlled = input<boolean>(false);
  public readonly checked = input<boolean | undefined>(undefined);
  public readonly disabled = input<boolean>(false);

  public readonly valueChange = output<boolean>();

  public constructor() {
    super();
  }

  protected override emitValue(val: boolean): void {
    this.valueChange.emit(val);
  }

  public override writeValue(value: boolean): void {
    this.controlValue.set(!!value);
  }

  public onCheckboxChange(event: MatCheckboxChange): void {
    const newVal = event.checked;
    this.controlValue.set(newVal);
    this.internalValue = newVal;
  }
}
