import { Currency } from '@app/shared/types/enums/currency.enum';

export interface MoneyDTO {
  amount: number;
  currency: Currency;
}
