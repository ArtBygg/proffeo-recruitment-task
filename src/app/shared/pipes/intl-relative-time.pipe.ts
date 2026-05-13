import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isValid, parseISO } from 'date-fns';

@Pipe({
  name: 'intlRelativeTime',
  standalone: true
})
export class IntlRelativeTimePipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  public transform(value: string | Date): string {
    if (!value) return '';

    const date = this.parseDate(value);
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

    const intervals: { [unit: string]: number } = {
      year: 60 * 60 * 24 * 365,
      month: 60 * 60 * 24 * 30,
      week: 60 * 60 * 24 * 7,
      day: 60 * 60 * 24,
      hour: 60 * 60,
      minute: 60,
      second: 1
    };

    let unit: Intl.RelativeTimeFormatUnit = 'second';
    let diff = diffInSeconds;

    for (const key in intervals) {
      const seconds = intervals[key];
      if (Math.abs(diffInSeconds) >= seconds) {
        unit = key as Intl.RelativeTimeFormatUnit;
        diff = Math.round(diffInSeconds / seconds);
        break;
      }
    }

    if (Math.abs(diff) < 1) {
      return this.translate.instant('relative-time.just-now');
    }

    const rtf = new Intl.RelativeTimeFormat(this.translate.currentLang || navigator.language, { numeric: 'always' });

    return rtf.format(diff, unit);
  }

  private parseDate(value: string | Date): Date {
    if (value instanceof Date) return value;

    const parsedDate = parseISO(value);
    if (isValid(parsedDate)) return parsedDate;

    const date = new Date(value);
    if (isValid(date)) return date;

    throw new Error('Invalid date value provided');
  }
}
