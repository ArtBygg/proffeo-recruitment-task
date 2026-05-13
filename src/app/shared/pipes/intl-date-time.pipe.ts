import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'intlDateTime',
  standalone: true
})
export class IntlDateTimePipe implements PipeTransform {
  public transform(
    value: Date | string | number,
    options: Intl.DateTimeFormatOptions = {
      dateStyle: 'short',
      timeStyle: 'short'
    }
  ): string {
    if (!value) return '';

    const date = new Date(value);
    return new Intl.DateTimeFormat(navigator.language, options).format(date);
  }
}
