import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { TimeReport } from '@app/shared/types/models/reports/time-report';
import { WorkTimeReport } from '@app/shared/types/models/reports/work-time-report';
import { TranslateModule } from '@ngx-translate/core';
import { parse, toSeconds } from 'iso8601-duration';

@Component({
  selector: 'proffeo-time-reports-summary',
  templateUrl: './time-reports-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatExpansionModule, TranslateModule, NgClass, MatDividerModule, MatIconModule, MatRippleModule]
})
export class TimeReportsSummaryComponent {
  private _filteredReportsTotalTime: number = 0;
  private _totalAuto: number = 0;
  private _totalOrdinaryHours: number = 0;
  private _totalBankHoursPlus: number = 0;
  private _totalBankHoursMinus: number = 0;
  private _totalOverTime50: number = 0;
  private _totalOverTime100: number = 0;

  protected isExpanded: boolean = false;
  protected allReportsTotalTime: number = 0;

  public readonly showExpanded = input<boolean>(false);
  public readonly filteredReports = input<TimeReport[]>([]);
  public readonly allReports = input<TimeReport[]>([]);

  public constructor() {
    effect(() => {
      const timeReports = this.filteredReports();

      this._filteredReportsTotalTime = 0;

      this._totalAuto = 0;
      this._totalOrdinaryHours = 0;
      this._totalBankHoursPlus = 0;
      this._totalBankHoursMinus = 0;
      this._totalOverTime50 = 0;
      this._totalOverTime100 = 0;

      if (timeReports) {
        timeReports.forEach((report: TimeReport): void => {
          if (report instanceof WorkTimeReport) {
            const reportedSeconds: number = toSeconds(parse(report.duration));
            this.assignReportedTime(report, reportedSeconds);
            this._filteredReportsTotalTime += reportedSeconds;
          }
        });
      }
    });

    effect(() => {
      const timeReports = this.allReports();

      this.allReportsTotalTime = 0;
      if (timeReports) {
        timeReports.forEach((report: TimeReport): void => {
          if (report instanceof WorkTimeReport) {
            const reportedSeconds: number = toSeconds(parse(report.duration));
            this.allReportsTotalTime += reportedSeconds;
          }
        });
      }
    });
  }

  protected get totalTimeTimeDuration(): string {
    return TimeReportsSummaryComponent.secondsToTime(this.allReportsTotalTime);
  }

  protected get filteredReportsTotalTimeTimeDuration(): string {
    return TimeReportsSummaryComponent.secondsToTime(this._filteredReportsTotalTime);
  }

  protected get totalAuto(): string {
    return TimeReportsSummaryComponent.secondsToTime(this._totalAuto);
  }

  protected get totalOrdinaryHours(): string {
    return TimeReportsSummaryComponent.secondsToTime(this._totalOrdinaryHours);
  }

  protected get totalBankHoursPlus(): string {
    return TimeReportsSummaryComponent.secondsToTime(this._totalBankHoursPlus);
  }

  protected get totalBankHoursMinus(): string {
    return TimeReportsSummaryComponent.secondsToTime(this._totalBankHoursMinus);
  }

  protected get totalOverTime50(): string {
    return TimeReportsSummaryComponent.secondsToTime(this._totalOverTime50);
  }

  protected get totalOverTime100(): string {
    return TimeReportsSummaryComponent.secondsToTime(this._totalOverTime100);
  }

  private static secondsToTime(seconds: number): string {
    const hours: number = Math.floor(seconds / 3600);
    const minutes: number = Math.floor((seconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
  }

  private assignReportedTime(report: WorkTimeReport, reportedSeconds: number): void {
    switch (report.hoursType) {
      case 'Auto':
        this._totalAuto = this._totalAuto + reportedSeconds;
        break;
      case 'OrdinaryHours':
        this._totalOrdinaryHours = this._totalOrdinaryHours + reportedSeconds;
        break;
      case 'BankPlus':
        this._totalBankHoursPlus = this._totalBankHoursPlus + reportedSeconds;
        break;
      case 'BankMinus':
        this._totalBankHoursMinus = this._totalBankHoursMinus + reportedSeconds;
        break;
      case 'Overtime50':
        this._totalOverTime50 = this._totalOverTime50 + reportedSeconds;
        break;
      case 'Overtime100':
        this._totalOverTime100 = this._totalOverTime100 + reportedSeconds;
        break;
      default:
        console.warn('Unknown hours type');
    }
  }
}
