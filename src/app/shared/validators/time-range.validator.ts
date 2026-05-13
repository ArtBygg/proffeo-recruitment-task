import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

import { TimePickerType } from '@app/shared/types/models/time-picker-type.type';
import { isDurationValid } from './time-duration-required.validator';

export const getDurationBetweenTimeRange = (timeFrom: TimePickerType, timeTo: TimePickerType): TimePickerType => {
  if (!timeFrom || !timeTo) {
    return {
      hour: 0,
      minute: 0,
      second: 0
    };
  }

  let minutesdiff = timeTo.minute - timeFrom.minute;
  let hoursdiff = timeTo.hour - timeFrom.hour;

  if (minutesdiff < 0) {
    hoursdiff--;
    minutesdiff = 60 + minutesdiff;
  }

  return {
    hour: hoursdiff >= 0 ? hoursdiff : 0,
    minute: hoursdiff >= 0 ? minutesdiff : 0,
    second: 0
  } as TimePickerType;
};

export const timeRangeValidator =
  (timeStartControlName: string, timeEndControlName: string): ValidatorFn =>
  (formGroup: AbstractControl): ValidationErrors | null => {
    const timeStartControl = (formGroup as FormGroup).controls[timeStartControlName];
    const timeEndControl = (formGroup as FormGroup).controls[timeEndControlName];

    if (!timeStartControl?.value || !timeEndControl?.value) {
      return null;
    }

    const startTimeValue = timeStartControl.value;
    const endTimeValue = timeEndControl.value;

    if (
      (timeStartControl.errors && !timeStartControl.errors[0]?.timeRange) ||
      (timeEndControl.errors && !timeEndControl.errors[0]?.timeRange)
    ) {
      return null; // return if another validator has already found an error on the timeStartControl
    }

    const durationBetweenTimes = getDurationBetweenTimeRange(startTimeValue, endTimeValue);
    if (!isDurationValid(durationBetweenTimes)) {
      timeStartControl.setErrors({
        timeRange: {
          startTime: startTimeValue,
          endTime: endTimeValue
        }
      });
      timeEndControl.setErrors({
        timeRange: {
          startTime: startTimeValue,
          endTime: endTimeValue
        }
      });
    } else {
      timeStartControl.setErrors(null);
      timeEndControl.setErrors(null);
    }

    return null;
  };
