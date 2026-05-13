import { CommonModule } from '@angular/common';
import { Component, effect, input, linkedSignal, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

export interface ToggleOption<T = unknown> {
  value: T;
  label: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'proffeo-toggle-button-group',
  imports: [CommonModule, MatIconModule, TranslateModule],
  templateUrl: './toggle-button-group.component.html'
})
export class ToggleButtonGroupComponent<T = unknown> {
  public readonly options = input.required<ToggleOption<T>[]>();
  public readonly value = input<T>(undefined);
  public readonly label = input<string>(undefined);
  public readonly showLabel = input(true);
  public readonly translateLabel = input(true);
  public readonly translateOptions = input(true);
  public readonly disabled = input(false);
  public readonly showOptionLabels = input(true);

  public readonly valueChange = output<T>();

  public readonly selectedValue = linkedSignal({
    source: this.value,
    computation: newValue => newValue
  });

  public constructor() {
    effect(() => {
      const newValue = this.selectedValue();
      this.valueChange.emit(newValue);
    });
  }

  public selectOption(option: ToggleOption<T>): void {
    if (this.disabled() || option.disabled) return;
    this.selectedValue.set(option.value);
  }

  public isSelected(option: ToggleOption<T>): boolean {
    return this.selectedValue() === option.value;
  }
}
