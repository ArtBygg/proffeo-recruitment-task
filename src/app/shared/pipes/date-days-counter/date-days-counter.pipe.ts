import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'appDateDaysCounter'
})
export class DateDaysCounterPipe implements PipeTransform {
  public transform(value: Date | string | number): string | null {
    const days = moment.duration(moment(value).diff(moment())).asDays();
    return `${Math.round(days)} d`;
  }
}
