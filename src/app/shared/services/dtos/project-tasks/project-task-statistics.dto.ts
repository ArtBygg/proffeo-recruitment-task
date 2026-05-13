import { Currency } from '@app/shared/types/enums/currency.enum';

export interface TaskStatisticsDTO {
  time: string;
  sSubtasksTime: string;
  summaryTime: string;
  financialAmount?: number;
  currency?: Currency;
}
