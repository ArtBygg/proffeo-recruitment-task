import { Directive } from '@angular/core';

export enum StatisticPercentage {
  LOW_LEVEL = 'lowLevel',
  MEDIUM_LEVEL = 'mediumLevel',
  HIGH_LEVEL = 'highLevel'
}

@Directive()
export abstract class AbstractUsageStatistics {
  protected getPercentageLevel(percentage: number): StatisticPercentage {
    if (percentage >= 0 && percentage < 60) {
      return StatisticPercentage.LOW_LEVEL;
    }
    if (percentage >= 60 && percentage < 80) {
      return StatisticPercentage.MEDIUM_LEVEL;
    }

    return StatisticPercentage.HIGH_LEVEL;
  }

  protected getTextColorByPercentage(percentage: number): string {
    const level: StatisticPercentage = this.getPercentageLevel(percentage);
    switch (level) {
      case StatisticPercentage.LOW_LEVEL:
        return 'text-green-400';
      case StatisticPercentage.MEDIUM_LEVEL:
        return 'text-orange-400';
      default:
        return 'text-red-600';
    }
  }

  protected getBackgroundColorByPercentage(percentage: number): string {
    const level: StatisticPercentage = this.getPercentageLevel(percentage);
    switch (level) {
      case StatisticPercentage.LOW_LEVEL:
        return 'bg-green-400';
      case StatisticPercentage.MEDIUM_LEVEL:
        return 'bg-orange-400';
      default:
        return 'bg-red-600';
    }
  }
}
