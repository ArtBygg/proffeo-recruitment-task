/*
import { Component, forwardRef, inject, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

export interface DateRangeValue {
  start: Date | null;
  end: Date | null;
}


@Component({
  selector: 'proffeo-date-range-picker',
  standalone: true,
  imports: [MatFormFieldModule, MatDatepickerModule, MatInputModule, MatNativeDateModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerComponent),
      multi: true,
    },
  ],
  templateUrl: './date-range-picker.component.html',
})
export class DateRangePickerComponent implements ControlValueAccessor {
  private ngControl = inject(NgControl, { optional: true });

  value = signal<DateRangeValue>({
    start: null,
    end: null,
  });

  disabled = signal(false);

  onChange: (value: DateRangeValue) => void = () => {};
  onTouched: () => void = () => {};

  public constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(value: DateRangeValue | null): void {
    this.value.set(value ?? { start: null, end: null });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  updateStart(date: Date | null) {
    const next = { ...this.value(), start: date };
    this.value.set(next);
    this.onChange(next);
  }

  updateEnd(date: Date | null) {
    const next = { ...this.value(), end: date };
    this.value.set(next);
    this.onChange(next);
  }
}
*/
