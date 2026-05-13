import { AbstractControl, FormControl, FormGroupDirective, NgForm } from '@angular/forms';

export const isErrorState = (
  control: FormControl | AbstractControl | null,
  form: FormGroupDirective | NgForm | null = null
): boolean => {
  const isSubmitted: boolean = form && form.submitted;
  return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
};
