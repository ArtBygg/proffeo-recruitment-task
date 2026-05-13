import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AbstractUsageStatistics } from '@app/shared/directives/abstract-usage-statistics.directive';
import { ShortNumberPipe } from '@app/shared/pipes/short-number/short-number.pipe';
import { Currency } from '@app/shared/types/enums/currency.enum';

@Component({
  selector: 'proffeo-financials-statistics',
  imports: [MatIconModule, NgClass, ShortNumberPipe],
  templateUrl: './financials-statistics.component.html'
})
export class FinancialsStatisticsComponent extends AbstractUsageStatistics {
  public readonly estimationFinancialAmount = input<number>(0);
  public readonly currency = input<Currency>(undefined);
  public readonly usedFinancialAmount = input<number>(0);
  public readonly hoverAction = input<boolean>(false);

  protected get financialStatisticsColorClass(): string {
    const percentage: number = Math.round(
      ((this.usedFinancialAmount() ?? 0) / (this.estimationFinancialAmount() ?? 0)) * 100
    );
    return this.getTextColorByPercentage(percentage);
  }
}
