import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { DateRangeInputComponent } from '@app/shared/components/reports/date-range-input/date-range-input.component';
import { DateRangeSelectorComponent } from '@app/shared/components/reports/date-range-selector/date-range-selector.component';
import { TimePeriodSelectorComponent } from '@app/shared/components/reports/time-period-selector/time-period-selector.component';
import { TimelineScrollerComponent } from '@app/shared/components/reports/timeline-scroller/timeline-scroller.component';
import { IntlDurationPipe } from '@app/shared/pipes/intl-duration.pipe';
import { ModalService } from '@app/shared/services/shared/modal.service';
import { TimeReportsDataService } from '@app/shared/services/time-reports-data.service';
import { DateRange } from '@app/shared/types/models/reports/new/date-range';
import { TimeReport } from '@app/shared/types/models/reports/time-report';
import { DropdownItem } from '@app/shared/types/models/shared/dropdown-item';
import { Task } from '@app/shared/types/models/task/task.model';
import { DropdownWithSearchComponent } from '@app/shared/components/dropdown-with-search/dropdown-with-search.component';
import { SelectedTimeReportTypeEnum } from '@app/shared/types/enums/time-report.enums';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { TaskTimeReportCardComponent } from './task-time-report-card/task-time-report-card.component';

@Component({
  selector: 'proffeo-task-time-reports',
  imports: [
    DateRangeSelectorComponent,
    DateRangeInputComponent,
    TimePeriodSelectorComponent,
    TimelineScrollerComponent,
    IntlDurationPipe,
    DatePipe,
    TaskTimeReportCardComponent,
    ButtonComponent,
    TranslatePipe,
    DropdownWithSearchComponent,
    MatIconModule
  ],
  templateUrl: './task-time-reports.component.html'
})
export class TaskTimeReportsComponent {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly timeReportsService: TimeReportsDataService = inject(TimeReportsDataService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly modalService: ModalService = inject(ModalService);

  protected readonly SelectedTimeReportTypeEnum = SelectedTimeReportTypeEnum;
  protected readonly ButtonType = ButtonType;

  protected readonly dateRange: WritableSignal<DateRange> = signal<DateRange>({
    start: moment().subtract(1, 'month').toDate(),
    end: new Date()
  });

  protected readonly selectedTimeMode: WritableSignal<SelectedTimeReportTypeEnum> = signal<SelectedTimeReportTypeEnum>(
    SelectedTimeReportTypeEnum.DAY
  );
  protected readonly selectedYear: WritableSignal<number> = signal<number>(moment().year());
  protected readonly selectedMonth: WritableSignal<number> = signal<number>(moment().month());
  protected readonly selectedWeek: WritableSignal<number> = signal<number>(moment().isoWeek());
  protected readonly selectedDay: WritableSignal<number> = signal<number>(moment().date());
  protected readonly selectedUsers: WritableSignal<string[]> = signal<string[]>([]);
  protected readonly selectedTypes: WritableSignal<string[]> = signal<string[]>([]);
  protected readonly selectedDates: WritableSignal<string[]> = signal<string[]>([]);
  protected readonly currentDateRange: Signal<DateRange> = computed<DateRange>(() => {
    const mode = this.selectedTimeMode();
    const year = this.selectedYear();
    const month = this.selectedMonth();
    const week = this.selectedWeek();
    const day = this.selectedDay();

    switch (mode) {
      case SelectedTimeReportTypeEnum.DAY:
        return {
          start: moment().year(year).month(month).date(day).startOf('day').toDate(),
          end: moment().year(year).month(month).date(day).endOf('day').toDate()
        };
      case SelectedTimeReportTypeEnum.WEEK:
        return {
          start: moment().year(year).isoWeek(week).startOf('isoWeek').toDate(),
          end: moment().year(year).isoWeek(week).endOf('isoWeek').toDate()
        };
      case SelectedTimeReportTypeEnum.MONTH:
        return {
          start: moment().year(year).month(month).startOf('month').toDate(),
          end: moment().year(year).month(month).endOf('month').toDate()
        };
      case SelectedTimeReportTypeEnum.YEAR:
        return {
          start: moment().year(year).startOf('year').toDate(),
          end: moment().year(year).endOf('year').toDate()
        };
      case SelectedTimeReportTypeEnum.RANGE:
        return this.dateRange();
      default:
        return this.dateRange();
    }
  });
  protected readonly timeReports: Signal<TimeReport[]> = computed(() => {
    const task = this.task();
    const range = this.currentDateRange();

    if (!task?.id) return [];

    this.timeReportsService.loadTaskTimeReports(task.id, range.start, range.end);

    return this.timeReportsService.getTaskTimeReports(task.id, range.start, range.end)() || [];
  });
  protected readonly availableUsers: Signal<DropdownItem<string>[]> = computed<DropdownItem<string>[]>(() => {
    const reports = this.timeReports();
    const usersMap = new Map<string, string>();

    reports.forEach(report => {
      const user = report.user?.();
      if (user?.id) {
        usersMap.set(user.id, `${user.firstName || ''} ${user.lastName || ''}`.trim());
      }
    });

    return Array.from(usersMap.entries()).map(([id, name]) => ({
      value: id,
      label: name || id
    }));
  });
  protected readonly availableTypes: Signal<DropdownItem<string>[]> = computed<DropdownItem<string>[]>(() => {
    const reports = this.timeReports();
    const typesSet = new Set<string>();

    reports.forEach(report => {
      if (report.reportType) {
        typesSet.add(report.reportType);
      }
    });

    return Array.from(typesSet).map(type => ({
      value: type,
      label: type
    }));
  });
  protected readonly availableDates: Signal<DropdownItem<string>[]> = computed<DropdownItem<string>[]>(() => {
    const reports = this.timeReports();
    const datesSet = new Set<string>();

    reports.forEach(report => {
      if (report.date) {
        datesSet.add(moment(report.date).format('YYYY-MM-DD'));
      }
    });

    return Array.from(datesSet)
      .sort((a, b) => b.localeCompare(a))
      .map(date => ({
        value: date,
        label: moment(date).format('D MMM YYYY')
      }));
  });
  protected readonly filteredReports: Signal<TimeReport[]> = computed(() => {
    const reports = this.timeReports();
    const users = this.selectedUsers();
    const types = this.selectedTypes();
    const dates = this.selectedDates();

    return reports.filter(report => {
      if (users.length > 0) {
        const userId = report.user?.()?.id;
        if (!userId || !users.includes(userId)) return false;
      }

      if (types.length > 0) {
        if (!report.reportType || !types.includes(report.reportType)) return false;
      }

      if (dates.length > 0) {
        if (!report.date) return false;
        const dateStr = moment(report.date).format('YYYY-MM-DD');
        if (!dates.includes(dateStr)) return false;
      }

      return true;
    });
  });
  protected readonly groupedReports: Signal<TimeReport[][]> = computed(() => {
    const reports = this.filteredReports();
    const grouped: TimeReport[][] = [];
    const dateMap = new Map<string, TimeReport[]>();

    reports.forEach(report => {
      const dateKey = moment(report.date).format('YYYY-MM-DD');
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey)!.push(report);
    });

    const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));
    sortedDates.forEach(date => {
      grouped.push(dateMap.get(date)!);
    });

    return grouped;
  });
  protected readonly totalDuration: Signal<string> = computed(() => {
    const reports = this.filteredReports();
    const total = moment.duration();

    reports.forEach(report => {
      if (report.duration) {
        total.add(moment.duration(report.duration));
      }
    });

    return total.toISOString();
  });
  protected readonly hasActiveFilters: Signal<boolean> = computed(() => {
    return this.selectedUsers().length > 0 || this.selectedTypes().length > 0 || this.selectedDates().length > 0;
  });

  public readonly task: InputSignal<Task> = input.required<Task>();

  protected onDateRangeSelected(range: DateRange): void {
    this.dateRange.set(range);
    const task = this.task();
    if (task?.id) {
      this.timeReportsService.loadTaskTimeReports(task.id, range.start, range.end);
    }
  }

  protected calculateDurationInSession(reports: TimeReport[]): string {
    const total = moment.duration();
    reports.forEach(report => {
      if (report.duration) {
        total.add(moment.duration(report.duration));
      }
    });
    return total.toISOString();
  }

  protected addTimeReport(): void {
    const task = this.task();
    if (task) {
      this.modalService.openTimeReportModal(task);
    }
  }

  protected clearFilters(): void {
    this.selectedUsers.set([]);
    this.selectedTypes.set([]);
    this.selectedDates.set([]);
  }

  // TODO: MZ: Sprawdzić dokladnie co tutaj się dzieje
  protected onEditTimeReportCardClick(report: TimeReport): void {
    const timeReport: TimeReport = {
      ...report,
      user: report.user(),
      createdBy: report.createdBy()
    } as unknown as TimeReport;
    this.modalService.openTimeReportModal(this.task(), timeReport);
  }

  protected onDeleteTimeReportCardClick(report: TimeReport): void {
    this.modalService
      .openConfirmationModal({
        title: this.translateService.instant('time-reports.confirmation.delete-header'),
        desc: this.translateService.instant('time-reports.confirmation.delete-description')
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          if (result) {
            this.timeReportsService
              .deleteTimeReport(report.id, report.dateFrom, report.dateTo, this.task().id)
              .subscribe();
          }
        }
      });
  }
}
