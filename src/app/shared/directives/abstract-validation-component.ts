import { Directive, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive()
export abstract class AbstractValidationComponent {
  protected readonly control = inject(NgControl, { optional: true, self: true });

  protected get invalid(): boolean {
    return this.control ? Boolean(this.control.invalid) : false;
  }

  protected get showError(): boolean {
    const touched: boolean = this.control !== undefined ? Boolean(this.control?.touched) : false;
    return touched && Boolean(this.control.invalid);
  }
}
