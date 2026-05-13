import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

const clearDateRangeError = (control: AbstractControl): void => {
  if (control.hasError('dateRange')) {
    const errors = { ...control.errors };
    delete errors['dateRange'];
    control.setErrors(Object.keys(errors).length ? errors : null);
  }
};

export const dateRangeValidator =
  (startKey: string, endKey: string): ValidatorFn =>
  (group: AbstractControl): ValidationErrors | null => {
    if (!(group instanceof FormGroup)) return null;

    const startControl = group.controls[startKey];
    const endControl = group.controls[endKey];

    if (!startControl || !endControl) return null;

    const start = startControl.value ? new Date(startControl.value) : null;
    const end = endControl.value ? new Date(endControl.value) : null;

    if (!start || !end) {
      clearDateRangeError(startControl);
      clearDateRangeError(endControl);
      return null;
    }

    if (start <= end) {
      clearDateRangeError(startControl);
      clearDateRangeError(endControl);
      return null;
    }
    startControl.setErrors({
      ...startControl.errors,
      dateRange: { startDate: start, endDate: end }
    });
    endControl.setErrors({
      ...endControl.errors,
      dateRange: { startDate: start, endDate: end }
    });

    return { dateRange: true };
  };
