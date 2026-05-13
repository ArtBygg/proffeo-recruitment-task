import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'intlCurrency',
  standalone: true
})
export class IntlCurrencyPipe implements PipeTransform {
  public transform(
    value: number,
    currencyCode: string = 'USD',
    display: 'code' | 'symbol' | 'name' = 'symbol',
    minimumFractionDigits: number = 2,
    maximumFractionDigits: number = 2
  ): string {
    if (!value || isNaN(value)) {
      return '';
    }

    try {
      const formatter = new Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: display,
        minimumFractionDigits: minimumFractionDigits,
        maximumFractionDigits: maximumFractionDigits
      });

      return formatter.format(value);
    } catch {
      // Fallback to basic formatting if there's an error
      return `${currencyCode} ${value.toFixed(maximumFractionDigits)}`;
    }
  }
}
