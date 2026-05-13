import { Currency } from '@app/shared/types/enums/currency.enum';

export interface Money {
  amount: number;
  currency: Currency;
}
