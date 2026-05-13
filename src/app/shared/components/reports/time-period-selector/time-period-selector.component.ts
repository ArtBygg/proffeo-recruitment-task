import { CommonModule } from '@angular/common';
import { Component, model } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { SelectedTimeReportTypeEnum } from '@app/shared/types/enums/time-report.enums';

@Component({
  selector: 'time-period-selector',
  imports: [CommonModule, MatButtonToggleModule, MatDatepickerModule, MatIconModule, MatNativeDateModule],
  templateUrl: './time-period-selector.component.html',
  styleUrl: './time-period-selector.component.scss'
})
export class TimePeriodSelectorComponent {
  // Enum dostępny w template
  protected readonly selectedTimeReportType = SelectedTimeReportTypeEnum;
  protected readonly SelectedTimeReportTypeEnum = SelectedTimeReportTypeEnum;

  // Wybrany tryb (DAY, WEEK, MONTH, YEAR, RANGE)
  // protected selectedMode = signal<SelectedTimeReportTypeEnum>(SelectedTimeReportTypeEnum.DAY);

  // Flaga czy pokazywać wszystkie raporty (używana w template)
  protected allReports = false;

  // Event emitter dla zmiany trybu
  public selectedTimeMode = model<SelectedTimeReportTypeEnum>();

  protected selectMode(time: SelectedTimeReportTypeEnum): void {
    // this.selectedMode.set(mode);
    this.selectedTimeMode.set(time);
  }

  protected openPicker(): void {
    // Picker zostanie otwarty automatycznie przez mat-datepicker-toggle
  }
}
