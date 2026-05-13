import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Checks if value fits all conditions  of valid password:
 * has number,
 * has upper case letter
 * has a lower-case letter,
 * has a special character
 */

export const isValidWithPattern = (value: string, regex: RegExp): boolean => regex.test(value);

export const isPasswordValid = (password: string): boolean => {
  // Has number
  const hasNumberRegExp = /\d/;
  if (!isValidWithPattern(password, hasNumberRegExp)) {
    return false;
  }

  // Has letter
  const hasletterRegExp = /[a-zA-Z]/;
  if (!isValidWithPattern(password, hasletterRegExp)) {
    return false;
  }

  // Has a special character
  const hasSpecialCharacterRegExp = /[!@#$%^&*()_+\-=[\]{}\\|;':",./<> ?`]/;
  if (!isValidWithPattern(password, hasSpecialCharacterRegExp)) {
    return false;
  }

  return true;
};

export const passwordValidator =
  (): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    if (control.value === '' || control.value === null) {
      return null;
    }

    const result = isPasswordValid(control.value);
    return result
      ? null
      : {
          password: true
        };
  };
