import { CommonModule } from '@angular/common';
import { Component, model, ModelSignal, output, OutputEmitterRef, Signal, viewChild } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { SelectedTimeReportTypeEnum } from '@app/shared/types/enums/time-report.enums';
import { DateRange } from '../../../types/models/reports/new/date-range';

@Component({
  selector: 'date-range-selector',
  imports: [CommonModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatNativeDateModule],
  templateUrl: './date-range-selector.component.html',
  styleUrl: './date-range-selector.component.scss'
})
export class DateRangeSelectorComponent {
  private startDate: Date | null = null;
  private endDate: Date | null = null;

  protected readonly SelectedTimeReportTypeEnum = SelectedTimeReportTypeEnum;

  public readonly dateRangeSelected: OutputEmitterRef<DateRange> = output<DateRange>();
  public readonly selectedTimeMode: ModelSignal<SelectedTimeReportTypeEnum> = model<SelectedTimeReportTypeEnum>();
  public readonly selectedDateRange: ModelSignal<DateRange> = model<DateRange>();
  public readonly datePicker: Signal<MatDateRangePicker<Date>> = viewChild<MatDateRangePicker<Date>>('picker');

  protected openPicker(): void {
    this.datePicker().open();
  }

  protected onDateRangeChange(start: Date | null, end: Date | null): void {
    this.startDate = start ?? this.startDate;
    this.endDate = end ?? this.endDate;

    if (this.startDate && this.endDate) {
      this.selectedTimeMode.set(SelectedTimeReportTypeEnum.RANGE);
      this.dateRangeSelected.emit({
        start: this.startDate,
        end: this.endDate
      });
    }
  }
}
