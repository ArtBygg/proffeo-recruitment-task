import { LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'intlDuration',
  standalone: true
})
export class IntlDurationPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  public transform(isoDuration: string, parseToHours?: boolean): string | number {
    if (!isoDuration) {
      return '';
    }

    const duration = moment.duration(isoDuration);

    if (!duration.isValid()) {
      console.error('Invalid duration format:', isoDuration);
      return 'Invalid duration';
    }

    const days = Math.floor(duration.asDays());
    let hours = Math.floor(duration.asHours() % 24);
    const minutes = Math.round(duration.minutes() % 60);

    let durationString = '';

    if (days > 0) {
      hours += days * 24;
    }
    if (hours > 0) {
      durationString += `${hours}h `;
    }
    if (minutes > 0 || durationString === '') {
      durationString += `${minutes}m`;
    }

    if (parseToHours) {
      return Math.round(duration.asHours() * 100) / 100;
    }

    return durationString.trim();
  }
}
