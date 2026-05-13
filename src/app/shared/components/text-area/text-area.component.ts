import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, DestroyRef, effect, inject, input, InputSignal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { ValueAccessorDirective } from '@app/shared/directives/value-accessor.directive';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-text-area',
  templateUrl: './text-area.component.html',
  hostDirectives: [ValueAccessorDirective],
  imports: [
    FormsModule,
    MatIconModule,
    MatFormField,
    MatInput,
    CdkTextareaAutosize,
    ReactiveFormsModule,
    MatLabel,
    MatError
  ]
})
export class TextAreaComponent {
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  protected readonly errorMessage: WritableSignal<string> = signal(null);

  public readonly control: InputSignal<FormControl<string>> = input.required<FormControl<string>>();
  public readonly label: InputSignal<string> = input<string>('');
  public readonly rows: InputSignal<number> = input<number>(2);

  public constructor() {
    effect(() => {
      this.control()
        .events.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          const ctrl = this.control();
          if (ctrl.errors && ctrl.touched) {
            const errorKey = Object.keys(ctrl.errors)[0];
            this.errorMessage.set(this.translateService.instant(`errors.${errorKey}`));
          } else {
            this.errorMessage.set(null);
          }
        });
    });
  }
}
