import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

export interface FormBuilderInterface {
  createForm(): FormBuilderInterface;
  getForm(): FormGroup;
}

@Injectable()
export abstract class AbstractBaseFormBuilder implements FormBuilderInterface {
  protected readonly _formBuilder: FormBuilder = inject(FormBuilder);
  protected _form: FormGroup;

  public getForm(): FormGroup {
    return this._form;
  }

  public abstract createForm(): AbstractBaseFormBuilder;
}
