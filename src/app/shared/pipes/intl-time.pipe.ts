import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'intlTime',
  standalone: true
})
export class IntlTimePipe implements PipeTransform {
  public transform(value: Date | string | number, style: 'full' | 'long' | 'medium' | 'short' = 'short'): string {
    if (!value) return '';

    const date = new Date(value);
    return new Intl.DateTimeFormat(navigator.language, { timeStyle: style }).format(date);
  }
}
