import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import {
  AbstractUsageStatistics,
  StatisticPercentage
} from '@app/shared/directives/abstract-usage-statistics.directive';

@Component({
  selector: 'proffeo-percentage-statistics',
  imports: [NgClass],
  templateUrl: './percentage-statistics.component.html'
})
export class PercentageStatisticsComponent extends AbstractUsageStatistics {
  protected statisticPercentageOptions: typeof StatisticPercentage = StatisticPercentage;

  public readonly value = input<number>(0);
  public readonly hoverAction = input<boolean>(false);

  protected get percentageLevel(): string {
    return this.getPercentageLevel(this.value());
  }

  protected get heightClass(): string {
    const heightValue: number = this.value() >= 20 ? Math.round(this.value() / 20) : 1;

    if (heightValue === 5) {
      return 'h-full';
    }
    return `h-${heightValue}/5`;
  }
}
