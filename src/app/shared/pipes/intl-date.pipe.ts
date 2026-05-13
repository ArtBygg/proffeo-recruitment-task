import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'intlDate',
  standalone: true
})
export class IntlDatePipe implements PipeTransform {
  public transform(value: Date | string | number, style: 'full' | 'long' | 'medium' | 'short' = 'short'): string {
    if (!value) return '';

    const date = new Date(value);
    return new Intl.DateTimeFormat(navigator.language, { dateStyle: style }).format(date);
  }
}
