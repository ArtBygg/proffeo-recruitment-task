import { TimePickerValue } from '@app/shared/types/models/shared/time-picker-value';
import { parse, toSeconds } from 'iso8601-duration';
import * as moment from 'moment';

export class IsoTimeUtils {
  private static readonly HOURS_TO_SECOND_MULTIPLIER: number = 3600;
  private static readonly MINUTES_TO_SECOND_MULTIPLIER: number = 60;

  public static convertTimeDurationToSeconds(duration: string): number {
    return toSeconds(parse(duration));
  }

  public static convertTimePickerRangeToIsoTime(fromTime: TimePickerValue, toTime: TimePickerValue): string {
    const fromTimeInSeconds: number = this.timeToSeconds(fromTime.hours, fromTime.minutes);
    const toTimeInSeconds: number = this.timeToSeconds(toTime.hours, toTime.minutes);

    if (fromTime > toTime) {
      throw Error('Invalid time frame');
    }

    const result: number = toTimeInSeconds - fromTimeInSeconds;
    return moment.duration(result, 'seconds').toISOString();
  }

  public static convertHourToIsoTime(hour: number, minutes: number): string {
    const seconds: number = this.timeToSeconds(hour, minutes);
    return moment.duration(seconds, 'seconds').toISOString();
  }

  private static timeToSeconds(hour: number, minutes: number): number {
    let seconds: number = 0;

    if (hour) {
      seconds = seconds + hour * this.HOURS_TO_SECOND_MULTIPLIER;
    }

    if (minutes) {
      seconds = seconds + minutes * this.MINUTES_TO_SECOND_MULTIPLIER;
    }

    return seconds;
  }
}
