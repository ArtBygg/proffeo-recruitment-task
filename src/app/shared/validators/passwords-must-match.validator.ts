import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const isEmptyInputValue = (value: unknown): boolean =>
  value == null || ((typeof value === 'string' || Array.isArray(value)) && value.length === 0);

export const passwordsMustMatchValidator =
  (controlPath: string, matchingControlPath: string): ValidatorFn =>
  (formGroup: AbstractControl): ValidationErrors | null => {
    // Get the control and matching control
    const control = formGroup.get(controlPath);
    const matchingControl = formGroup.get(matchingControlPath);

    // Return if control or matching control doesn't exist
    if (!control || !matchingControl) {
      return null;
    }

    // Delete the mustMatch error to reset the error on the matching control
    if (matchingControl.hasError('passwordsMustMatch')) {
      delete matchingControl.errors[0]?.passwordsMustMatch;
      matchingControl.updateValueAndValidity();
    }

    // Don't validate empty values on the matching control
    // Don't validate if values are matching
    if (isEmptyInputValue(matchingControl.value) || control.value === matchingControl.value) {
      return null;
    }

    // Prepare the validation errors
    const errors = { passwordsMustMatch: true };

    // Set the validation error on the matching control
    matchingControl.setErrors(errors);

    // Return the errors
    return errors;
  };
