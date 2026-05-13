import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AbstractUsageStatistics } from '@app/shared/directives/abstract-usage-statistics.directive';
import { ShortNumberPipe } from '@app/shared/pipes/short-number/short-number.pipe';

@Component({
  selector: 'proffeo-hours-statistics',
  imports: [MatIconModule, NgClass, ShortNumberPipe],
  templateUrl: './hours-statistics.component.html'
})
export class HoursStatisticsComponent extends AbstractUsageStatistics {
  public readonly estimationHours = input<number>(0);
  public readonly usedHours = input<number>(0);
  public readonly hoverAction = input<boolean>(false);
  public readonly showEstimationHours = input<boolean>(true);

  protected get hoursStatisticsColorClass(): string {
    const percentage: number = Math.round((this.usedHours() / this.estimationHours()) * 100);
    return this.getTextColorByPercentage(percentage);
  }
}
