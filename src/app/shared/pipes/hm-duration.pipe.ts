import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'hmDuration',
  standalone: true
})
export class HmDurationPipe implements PipeTransform {
  public transform(isoDuration: string): string {
    if (!isoDuration) return '';
    const duration = moment.duration(isoDuration);
    if (!duration.isValid()) return '';
    const hours = Math.floor(duration.asHours());
    const minutes = Math.round(duration.minutes() % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
