import { Component, effect, inject, input, InputSignal, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'proffeo-input-with-buttons',
  templateUrl: './input-with-buttons.component.html',
  styleUrls: ['./input-with-buttons.component.scss'],
  imports: [MatInputModule, ReactiveFormsModule, MatTooltip, MatIconModule, MatButtonModule]
})
export class InputWithButtonsComponent {
  private readonly fb: FormBuilder = inject(FormBuilder);

  protected form: FormGroup = this.fb.group({
    text: ['']
  });

  public readonly placeholder = input<string>('');
  public readonly maxLength = input<number | undefined>(undefined);
  public readonly valueChanged = output<string>();
  public readonly canceled = output<void>();
  public text: InputSignal<string> = input('');

  public constructor() {
    effect(() => {
      this.form.patchValue({ text: this.text() });
    });

    effect(() => {
      const maxLen = this.maxLength();
      const textControl = this.form.controls['text'];

      if (maxLen !== undefined) {
        textControl.setValidators([Validators.maxLength(maxLen)]);
      } else {
        textControl.clearValidators();
      }
      textControl.updateValueAndValidity();
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.controls['text'].value;

    if (this.maxLength() !== undefined && value.length > this.maxLength()!) {
      return;
    }

    this.valueChanged.emit(value);
  }

  protected cancel(): void {
    this.form.patchValue({ text: this.text() });
    this.canceled.emit();
  }
}
