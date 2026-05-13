import { Money } from '../money';

export interface ProjectStatistic {
  hours: number;
  tasksDonePercentage: number;
  financial: Money;
}
