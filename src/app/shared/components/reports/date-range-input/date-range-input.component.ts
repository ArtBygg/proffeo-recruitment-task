import { CommonModule } from '@angular/common';
import { Component, model, ViewChild } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SelectedTimeReportTypeEnum } from '@app/shared/types/enums/time-report.enums';
import { DateRange } from '../../../types/models/reports/new/date-range';

@Component({
  selector: 'date-range-input',
  imports: [CommonModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule],
  templateUrl: './date-range-input.component.html',
  styleUrl: './date-range-input.component.scss'
})
export class DateRangeInputComponent {
  @ViewChild('picker') public picker!: MatDateRangePicker<Date>;
  private startDate: Date | null = null;
  private endDate: Date | null = null;

  protected readonly SelectedTimeReportTypeEnum = SelectedTimeReportTypeEnum;

  public selectedTimeMode = model<SelectedTimeReportTypeEnum>();
  public dateRangeSelected = model<DateRange>();

  protected selectRangeStart(date: Date | null): void {
    this.startDate = date;
    this.emitDateRangeIfComplete();
  }

  protected selectRangeEnd(date: Date | null): void {
    this.endDate = date;
    this.emitDateRangeIfComplete();
  }

  private emitDateRangeIfComplete(): void {
    if (this.startDate && this.endDate) {
      this.selectedTimeMode.set(SelectedTimeReportTypeEnum.RANGE);
      // #todo - zmiana daj z palca
      // this.dateRangeSelected.set({
      //   start: this.startDate,
      //   end: this.endDate,
      // });
    }
  }
}
