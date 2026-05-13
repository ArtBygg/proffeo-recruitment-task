import { CommonModule } from '@angular/common';
import { Component, effect, input, model, signal, untracked } from '@angular/core';
import moment from 'moment';
import { SelectedTimeReportTypeEnum } from '@app/shared/types/enums/time-report.enums';

@Component({
  selector: 'timeline-scroller',
  imports: [CommonModule],
  templateUrl: './timeline-scroller.component.html',
  styleUrl: './timeline-scroller.component.scss'
})
export class TimelineScrollerComponent {
  private readonly VISIBLE_ITEMS_COUNT = 10;
  private availableYears: number[] = [];
  private availableWeeks: number[] = [];
  private availableMonths: string[] = [];
  private availableDays: number[] = [];
  private availableMonthsWithYears: { month: string; year: number; monthIndex: number }[] = [];
  private visibleStartIndex = 0;

  protected selectedModeData = signal<(number | string)[]>([]);
  protected visibleModeData = signal<(number | string)[]>([]);
  protected selectedValue = signal<number | string | undefined>(undefined);
  protected selectedIndex = signal<number | undefined>(undefined);
  protected selectedModeHeaderText = signal<string>('Year');
  protected selectedModeValuePrefix = signal<string>('');

  public selectedTimeMode = input.required<SelectedTimeReportTypeEnum>();
  public selectedYear = model<number>(moment().year());
  public selectedMonth = model<number>(moment().month());
  public selectedWeek = model<number>(moment().week());
  public selectedDay = model<number>(moment().date());

  public constructor() {
    this.propagateAvailableYears();
    this.propagateAvailableMonths();
    this.propagateAvailableMonthsWithYears();

    effect(() => {
      const mode = this.selectedTimeMode();
      untracked(() => {
        if (this.availableWeeks.length === 0) {
          this.propagateAvailableWeeks();
        }
        if (this.availableDays.length === 0) {
          this.propagateAvailableDays();
        }
        this.selectMode(mode);
      });
    });
  }

  private updateModeData(mode: SelectedTimeReportTypeEnum): void {
    switch (mode) {
      case SelectedTimeReportTypeEnum.YEAR:
        this.selectedModeData.set(this.availableYears);
        this.selectedModeHeaderText.set('Year');
        this.selectedModeValuePrefix.set('');
        break;

      case SelectedTimeReportTypeEnum.MONTH: {
        const monthsData = this.availableMonthsWithYears.map(m => `${m.month} ${m.year}`);
        this.selectedModeData.set(monthsData);
        this.selectedModeHeaderText.set('');
        this.selectedModeValuePrefix.set('');
        break;
      }

      case SelectedTimeReportTypeEnum.WEEK:
        this.selectedModeData.set(this.availableWeeks);
        this.selectedModeHeaderText.set(this.selectedYear().toString());
        this.selectedModeValuePrefix.set('Week ');
        break;

      case SelectedTimeReportTypeEnum.DAY:
        this.selectedModeData.set(this.availableDays);
        this.selectedModeHeaderText.set(this.selectedYear().toString());
        this.selectedModeValuePrefix.set(moment.monthsShort()[this.selectedMonth()] + ' ');
        break;
    }
    this.updateVisibleData();
  }

  private updateVisibleData(): void {
    const allData = this.selectedModeData();
    const endIndex = Math.min(this.visibleStartIndex + this.VISIBLE_ITEMS_COUNT, allData.length);
    this.visibleModeData.set(allData.slice(this.visibleStartIndex, endIndex));
  }

  private centerVisibleDataOnItem(value: number | string): void {
    const allData = this.selectedModeData();
    const itemIndex = allData.findIndex(data => data === value);

    if (itemIndex === -1) return;

    const halfVisible = Math.floor(this.VISIBLE_ITEMS_COUNT / 2);
    let newStartIndex = itemIndex - halfVisible;

    newStartIndex = Math.max(0, newStartIndex);
    newStartIndex = Math.min(newStartIndex, allData.length - this.VISIBLE_ITEMS_COUNT);
    newStartIndex = Math.max(0, newStartIndex);

    this.visibleStartIndex = newStartIndex;
    this.updateVisibleData();
  }

  protected selectMode(selectedMode: SelectedTimeReportTypeEnum): void {
    this.updateModeData(selectedMode);

    switch (selectedMode) {
      case SelectedTimeReportTypeEnum.YEAR:
        this.selectItem(this.selectedYear(), 100);
        break;

      case SelectedTimeReportTypeEnum.MONTH:
        this.selectItem(this.getCurrentMonthKey(), 100);
        break;

      case SelectedTimeReportTypeEnum.WEEK:
        this.selectItem(this.selectedWeek(), 100);
        break;

      case SelectedTimeReportTypeEnum.DAY:
        this.selectItem(this.selectedDay(), 100);
        break;
    }
  }

  protected selectItem(value: number | string, timeout: number = 0): void {
    const mode = this.selectedTimeMode();
    const scrollValue = value;

    this.selectedIndex.set(this.getSelectedIndex(scrollValue));
    this.selectedValue.set(scrollValue);
    this.centerVisibleDataOnItem(scrollValue);
    setTimeout(() => {
      const element = document.getElementById('time-report-item-' + scrollValue);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }
    }, timeout);

    switch (mode) {
      case SelectedTimeReportTypeEnum.YEAR:
        this.selectedYear.set(+value);
        this.propagateAvailableWeeks();
        this.updateModeData(mode);
        break;

      case SelectedTimeReportTypeEnum.MONTH: {
        const monthData = this.availableMonthsWithYears.find(m => `${m.month} ${m.year}` === value);
        if (monthData) {
          this.selectedYear.set(monthData.year);
          this.selectedMonth.set(monthData.monthIndex);
          this.propagateAvailableDays();
        }
        break;
      }

      case SelectedTimeReportTypeEnum.WEEK:
        this.selectedWeek.set(+value);
        break;

      case SelectedTimeReportTypeEnum.DAY:
        this.selectedDay.set(+value);
        break;
    }
  }

  protected onItemClick(value: number | string): void {
    this.selectItem(value);
  }

  private updateAndSelectItem(mode: SelectedTimeReportTypeEnum, getValue: () => number | string): void {
    this.updateModeData(mode);
    setTimeout(() => this.selectItem(getValue(), 0), 200);
  }

  private navigateContext(direction: 'previous' | 'next'): void {
    const context = direction === 'previous' ? this.getPreviousContext() : this.getNextContext();
    if (context.year === undefined) return;

    this.selectedYear.set(context.year);
    this.selectedMonth.set(context.month);
    this.selectedWeek.set(context.week);
    this.selectedDay.set(context.day);

    const mode = this.selectedTimeMode();

    switch (mode) {
      case SelectedTimeReportTypeEnum.MONTH:
        this.updateAndSelectItem(mode, () => this.getCurrentMonthKey());
        break;

      case SelectedTimeReportTypeEnum.WEEK:
        this.updateAndSelectItem(mode, () => this.selectedWeek());
        break;

      case SelectedTimeReportTypeEnum.DAY:
        this.propagateAvailableDays();
        this.updateAndSelectItem(mode, () => this.selectedDay());
        break;

      default: // YEAR
        if (direction === 'previous') {
          if (this.visibleStartIndex > 0) {
            this.visibleStartIndex = Math.max(0, this.visibleStartIndex - 1);
            this.updateVisibleData();
          }
        } else {
          const allData = this.selectedModeData();
          if (this.visibleStartIndex + this.VISIBLE_ITEMS_COUNT < allData.length) {
            this.visibleStartIndex = Math.min(allData.length - this.VISIBLE_ITEMS_COUNT, this.visibleStartIndex + 1);
            this.updateVisibleData();
          }
        }
        this.selectMode(mode);
        break;
    }
  }

  protected onPrevious(): void {
    this.navigateContext('previous');
  }

  protected onNext(): void {
    this.navigateContext('next');
  }

  private getContext(direction: 'previous' | 'next'): {
    year: number | undefined;
    month: number;
    week: number;
    day: number;
    labelHeader: string | undefined;
    label: string | number | undefined;
  } {
    const selectedContext = {
      year: this.selectedYear(),
      month: this.selectedMonth(),
      week: this.selectedWeek(),
      day: this.selectedDay(),
      labelHeader: undefined as string | undefined,
      label: undefined as string | number | undefined
    };

    const mode = this.selectedTimeMode();
    const isPrevious = direction === 'previous';

    switch (mode) {
      case SelectedTimeReportTypeEnum.YEAR:
        selectedContext.year = undefined;
        break;

      case SelectedTimeReportTypeEnum.MONTH: {
        const monthIndex = isPrevious
          ? this.selectedMonth() === 0
            ? 11
            : this.selectedMonth() - 1
          : this.selectedMonth() === 11
            ? 0
            : this.selectedMonth() + 1;
        const year = isPrevious
          ? this.selectedMonth() === 0
            ? this.selectedYear() - 1
            : this.selectedYear()
          : this.selectedMonth() === 11
            ? this.selectedYear() + 1
            : this.selectedYear();

        selectedContext.day = moment({ year, month: monthIndex }).daysInMonth();
        selectedContext.month = monthIndex;
        selectedContext.year = year;
        selectedContext.label = moment.months()[monthIndex];
        selectedContext.labelHeader = year.toString();
        if (!this.availableYears.includes(year)) selectedContext.year = undefined;
        break;
      }

      case SelectedTimeReportTypeEnum.WEEK: {
        const weekYear = isPrevious ? this.selectedYear() - 1 : this.selectedYear() + 1;
        const weekNumber = isPrevious ? moment().year(weekYear).weeksInYear() : 1;
        selectedContext.week = weekNumber;
        selectedContext.year = weekYear;
        selectedContext.label = weekYear;
        selectedContext.labelHeader = 'Week ' + weekNumber;
        if (!this.availableYears.includes(weekYear)) selectedContext.year = undefined;
        break;
      }

      case SelectedTimeReportTypeEnum.DAY: {
        const isMonthEdge = isPrevious ? this.selectedMonth() === 0 : this.selectedMonth() === 11;
        const dayYear = isMonthEdge
          ? isPrevious
            ? this.selectedYear() - 1
            : this.selectedYear() + 1
          : this.selectedYear();
        const dayMonth = isPrevious
          ? this.selectedMonth() === 0
            ? 11
            : this.selectedMonth() - 1
          : this.selectedMonth() === 11
            ? 0
            : this.selectedMonth() + 1;

        selectedContext.month = dayMonth;
        selectedContext.year = dayYear;

        if (isPrevious) {
          selectedContext.day = moment({ year: dayYear, month: dayMonth }).daysInMonth();
          selectedContext.label = isMonthEdge ? dayYear : moment.monthsShort()[dayMonth] + ' ' + selectedContext.day;
          selectedContext.labelHeader = isMonthEdge
            ? moment.months()[dayMonth] + ' ' + selectedContext.day
            : dayYear.toString();
        } else {
          selectedContext.day = 1;
          selectedContext.label = isMonthEdge ? dayYear : moment.monthsShort()[dayMonth] + ' 1';
          selectedContext.labelHeader = isMonthEdge ? moment.months()[dayMonth] + ' 1' : dayYear.toString();
        }

        if (!this.availableYears.includes(dayYear)) selectedContext.year = undefined;
        break;
      }
    }

    return selectedContext;
  }

  protected getPreviousContext(): {
    year: number | undefined;
    month: number;
    week: number;
    day: number;
    labelHeader: string | undefined;
    label: string | number | undefined;
  } {
    return this.getContext('previous');
  }

  protected getNextContext(): {
    year: number | undefined;
    month: number;
    week: number;
    day: number;
    labelHeader: string | undefined;
    label: string | number | undefined;
  } {
    return this.getContext('next');
  }

  protected getWeekRange(week: number): string {
    const weekStart = moment().year(this.selectedYear()).week(week).startOf('week').date();
    const weekEnd = moment().year(this.selectedYear()).week(week).endOf('week').date();
    const month = moment().year(this.selectedYear()).week(week).month();

    return weekStart + '-' + weekEnd + ' ' + moment.monthsShort()[month];
  }

  protected getDayOfWeek(day: number): string {
    const date = moment({
      year: this.selectedYear(),
      month: this.selectedMonth(),
      day: day
    });
    return date.format('ddd');
  }

  protected getDayLabel(day: number): string {
    const date = moment({
      year: this.selectedYear(),
      month: this.selectedMonth(),
      date: day
    });
    return date.format('ddd D MMM');
  }

  protected getMonthFromItem(item: string): string {
    return item.split(' ')[0];
  }

  protected getYearFromItem(item: string): string {
    return item.split(' ')[1];
  }

  protected getSelectedIndex(value: number | string): number {
    return this.selectedModeData().findIndex((data: number | string) => data === value);
  }

  protected getVisibleIndex(value: number | string): number {
    return this.visibleModeData().findIndex((data: number | string) => data === value);
  }

  private propagateAvailableYears(): void {
    const currentYear = moment().year();
    this.availableYears = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);
  }

  private propagateAvailableMonths(): void {
    this.availableMonths = moment.months();
  }

  private propagateAvailableMonthsWithYears(): void {
    const currentYear = moment().year();
    this.availableMonthsWithYears = [];

    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        this.availableMonthsWithYears.push({
          month: moment.months()[monthIndex],
          year: year,
          monthIndex: monthIndex
        });
      }
    }
  }

  private getCurrentMonthKey(): string {
    return `${moment.months()[this.selectedMonth()]} ${this.selectedYear()}`;
  }

  private propagateAvailableWeeks(): void {
    const weeksCount = moment(new Date().setFullYear(this.selectedYear())).weeksInYear();
    this.availableWeeks = Array.from({ length: weeksCount }, (_, i) => i + 1);
  }

  private propagateAvailableDays(): void {
    const daysCount = moment({
      year: this.selectedYear(),
      month: this.selectedMonth()
    }).daysInMonth();
    this.availableDays = Array.from({ length: daysCount }, (_, i) => i + 1);
  }
}
