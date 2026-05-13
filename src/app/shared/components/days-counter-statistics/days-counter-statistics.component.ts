import { DatePipe, NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AbstractUsageStatistics } from '@app/shared/directives/abstract-usage-statistics.directive';
import { DateDaysCounterPipe } from '@app/shared/pipes/date-days-counter/date-days-counter.pipe';
import { differenceInDays, isAfter, isBefore, startOfToday } from 'date-fns';

export type DaysCounterStatisticsMode = 'endDate' | 'startDate';

@Component({
  selector: 'proffeo-days-counter-statistics',
  imports: [MatTooltipModule, NgClass, DateDaysCounterPipe, MatIconModule],
  templateUrl: './days-counter-statistics.component.html'
})
export class DaysCounterStatisticsComponent extends AbstractUsageStatistics {
  private readonly _datePipe = inject(DatePipe);

  public readonly startDate = input<Date>(undefined);
  public readonly endDate = input<Date>(undefined);
  public readonly hoverAction = input<boolean>(false);
  public readonly mode = input<DaysCounterStatisticsMode>('endDate');
  public readonly showTooltip = input<boolean>(true);

  public get displayedDate(): Date {
    return this.mode() === 'endDate' ? this.endDate() : this.startDate();
  }

  protected get tooltipDate(): string {
    if (!this.displayedDate) {
      return '';
    }
    return this._datePipe.transform(this.displayedDate, 'medium');
  }

  protected get daysLeftColorClass(): string {
    if (this.mode() === 'startDate') {
      return 'text-secondary-700';
    }

    const endDate = this.endDate();
    if (!endDate) {
      return 'text-secondary-700';
    }

    const today: Date = startOfToday();
    if (isBefore(endDate, today)) {
      return 'text-red-800';
    }

    const startDate = this.startDate();
    if (isAfter(startDate, today)) {
      return 'text-green-400';
    }

    const daysDeclared: number = differenceInDays(endDate, startDate || today);
    const daysUsed: number = differenceInDays(today, startDate || today);

    const percentage: number = Math.round((daysUsed / daysDeclared) * 100);
    return this.getTextColorByPercentage(percentage);
  }
}
