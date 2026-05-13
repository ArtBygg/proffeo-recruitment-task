import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { TimePickerType } from '@app/shared/types/models/time-picker-type.type';

export const isDurationValid = (timeDuration: TimePickerType): boolean => {
  if (!timeDuration) {
    return false;
  }

  return timeDuration.hour > 0 || timeDuration.minute > 0 || timeDuration.second > 0;
};

export const timeDurationRequiredValidator =
  (): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    if (control.value === '' || control.value === null) {
      return null;
    }

    const result = isDurationValid(control.value);
    return result
      ? null
      : {
          timeDurationRequired: true
        };
  };
