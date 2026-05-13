import { Component, DestroyRef, effect, inject, input, InputSignal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-date-picker',
  imports: [MatFormFieldModule, MatDatepickerModule, MatInputModule, MatNativeDateModule, ReactiveFormsModule, MatIcon],
  templateUrl: './date-picker.component.html'
})
export class DatePickerComponent {
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly deviceService: DeviceService = inject(DeviceService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  protected readonly isMobile = this.deviceService.isMobile;
  protected readonly errorMessage: WritableSignal<string> = signal(null);

  public control: InputSignal<FormControl<Date | null>> = input.required<FormControl<Date | null>>();
  public label: InputSignal<string> = input('');

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
