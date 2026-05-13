import { Currency } from '../../enums/currency.enum';

export interface TaskStatistics {
  time: string;
  sSubtasksTime: string;
  summaryTime: string;
  financialAmount?: number;
  currency?: Currency;
}
