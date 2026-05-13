import { NgClass } from '@angular/common';
import { Component, output, signal, WritableSignal } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { TimePickerValue } from '@app/shared/types/models/shared/time-picker-value';

export interface TimeButtonItem {
  value: TimePickerValue;
  label: string;
}

@Component({
  selector: 'proffeo-time-buttons',
  templateUrl: './time-buttons.component.html',
  imports: [MatGridTile, MatGridList, MatRippleModule, NgClass]
})
export class TimeButtonsComponent {
  protected readonly selectedValue: WritableSignal<TimePickerValue | null> = signal(null);
  protected readonly items: TimeButtonItem[] = [
    {
      value: { hours: 0, minutes: 15 },
      label: '15m'
    },
    {
      value: { hours: 0, minutes: 30 },
      label: '30m'
    },
    {
      value: { hours: 0, minutes: 45 },
      label: '45m'
    },
    {
      value: { hours: 1, minutes: 0 },
      label: '1h'
    },
    {
      value: { hours: 2, minutes: 0 },
      label: '2h'
    },
    {
      value: { hours: 3, minutes: 0 },
      label: '3h'
    },
    {
      value: { hours: 4, minutes: 0 },
      label: '4h'
    },
    {
      value: { hours: 5, minutes: 0 },
      label: '5h'
    },
    {
      value: { hours: 7, minutes: 30 },
      label: '7h 30m'
    },
    {
      value: { hours: 10, minutes: 0 },
      label: '10h'
    }
  ];

  public readonly timeSelected = output<TimePickerValue>();

  protected onSelect(item: TimeButtonItem): void {
    this.selectedValue.set(item.value);
    this.timeSelected.emit(item.value);
  }

  protected isSelected(item: TimeButtonItem): boolean {
    const selected = this.selectedValue();
    if (!selected) return false;
    return selected.hours === item.value.hours && selected.minutes === item.value.minutes;
  }
}
