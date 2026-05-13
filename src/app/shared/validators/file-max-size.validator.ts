import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface FilesMaxSizeError {
  maxSizeInMB: number;
  actualSizeInMB: number;
}
export function filesMaxSizeValidator(maxSizeInMB: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    const files: File[] = Array.isArray(value) ? value : [value];

    const totalSize = files.reduce((sum: number, file: File) => sum + file.size, 0);
    if (totalSize > maxSizeInBytes) {
      return {
        filesMaxSizeExceeded: {
          maxSizeInMB,
          actualSizeInMB: +(totalSize / (1024 * 1024)).toFixed(2)
        }
      };
    }

    return null;
  };
}
