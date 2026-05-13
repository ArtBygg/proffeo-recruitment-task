import { AsyncPipe } from '@angular/common';
import { Component, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AbstractValidationComponent } from '@app/shared/directives/abstract-validation-component';
import { ValueAccessorDirective } from '@app/shared/directives/value-accessor.directive';
import { TimePickerValue } from '@app/shared/types/models/shared/time-picker-value';

@Component({
  selector: 'proffeo-time-picker',
  templateUrl: './time-picker.component.html',
  hostDirectives: [ValueAccessorDirective],
  imports: [AsyncPipe, MatIconModule]
})
export class TimePickerComponent extends AbstractValidationComponent {
  @ViewChild('hoursInput', { static: true })
  public hoursInput!: ElementRef<HTMLInputElement>;
  @ViewChild('minutesInput', { static: true })
  public minutesInput!: ElementRef<HTMLInputElement>;

  protected override control = inject(NgControl, { optional: true, self: true });
  protected hasChanged = signal(false);

  public readonly minuteStep = input<number>(1);
  public readonly timeUpdated = output<void>();
  public readonly valueAccessor = inject(ValueAccessorDirective<TimePickerValue>);

  public constructor() {
    super();
    if (this.control) {
      this.control.valueAccessor = this.valueAccessor;
    }
    document.addEventListener(
      'dblclick',
      function (event) {
        event.preventDefault();
      },
      { passive: false }
    );
  }

  protected addHour(): void {
    this.valueAccessor.markAsTouched();
    const currentValue: TimePickerValue = this.valueAccessor.currentValue;
    const newHour: number = (currentValue.hours + 1) % 24;
    this.updateValue('hours', newHour);
  }

  protected subtractHour(): void {
    this.valueAccessor.markAsTouched();
    const currentValue: TimePickerValue = this.valueAccessor.currentValue;
    const newHour: number = (currentValue.hours - 1 + 24) % 24;
    this.updateValue('hours', newHour);
  }

  protected addMinute(): void {
    this.valueAccessor.markAsTouched();
    const currentValue: TimePickerValue = this.valueAccessor.currentValue;
    const newMinute: number = (currentValue.minutes + this.minuteStep()) % 60;
    this.updateValue('minutes', newMinute);
  }

  protected subtractMinute(): void {
    this.valueAccessor.markAsTouched();
    const currentValue: TimePickerValue = this.valueAccessor.currentValue;
    const newMinute: number = (currentValue.minutes - this.minuteStep() + 60) % 60;
    this.updateValue('minutes', newMinute);
  }

  protected onHoursChange(value: string): void {
    void value;
    // this.validateAndSetHours(value);
  }

  protected onMinutesChange(value: string): void {
    this.validateAndSetMinutes(value);
  }

  protected onBlur(input: HTMLInputElement): void {
    if (input.classList.contains('hoursInput')) {
      this.validateAndSetHours(input.value);
    } else if (input.classList.contains('minutesInput')) {
      this.validateAndSetMinutes(input.value);
    }
  }

  protected onHourInput(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    let value: string = input.value.replace(/[^0-9]/g, '');
    this.hasChanged.set(true);

    if (value.length === 1) {
      input.value = value;
    } else if (value.length === 2) {
      input.value = value;
      this.minutesInput.nativeElement.focus();
      this.onHoursChange(value);
    } else if (value.length > 2) {
      value = value.slice(0, 2);
      input.value = value;
      this.minutesInput.nativeElement.focus();
      this.onHoursChange(value);
    }
  }

  protected onMinuteInput(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    let value: string = input.value.replace(/[^0-9]/g, '');
    this.hasChanged.set(true);

    if (value.length === 1) {
      input.value = value;
    } else if (value.length === 2) {
      input.value = value;
      this.onMinutesChange(value);
      this.timeUpdated.emit();
    } else if (value.length > 2) {
      value = value.slice(0, 2);
      input.value = value;
      this.onMinutesChange(value);
      this.timeUpdated.emit();
    }
  }

  protected formatValue(value?: number): string {
    return value !== undefined && value !== null ? value.toString().padStart(2, '0') : '00';
  }

  protected onFocus(input: HTMLInputElement): void {
    setTimeout(() => input.select(), 0);
  }

  private validateAndSetHours(value: string): void {
    let hours: number = Number(value);

    if (isNaN(hours) || hours < 0) {
      hours = 0;
    } else if (hours > 23) {
      hours = 23;
    }

    this.hoursInput.nativeElement.value = this.formatValue(hours);
    this.updateValue('hours', hours);
  }

  private validateAndSetMinutes(value: string): void {
    let minutes: number = Number(value);

    if (isNaN(minutes) || minutes < 0) {
      minutes = 0;
    } else if (minutes > 59) {
      minutes = 59;
    }

    this.minutesInput.nativeElement.value = this.formatValue(minutes);
    this.updateValue('minutes', minutes);
  }

  private updateValue(type: 'hours' | 'minutes', value: number): void {
    const currentValue: TimePickerValue = this.valueAccessor.currentValue;
    this.hasChanged.set(true);
    this.valueAccessor.valueChange({
      ...currentValue,
      [type]: value
    });
  }
}
