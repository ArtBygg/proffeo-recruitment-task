import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';

import { MatInputModule } from '@angular/material/input';
import { IntlDatePipe } from '@app/shared/pipes/intl-date.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-date-range-select',
  templateUrl: './date-range-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslateModule, MatDatepickerModule, MatInputModule, MatIconModule, IntlDatePipe]
})
export class DateRangeSelectComponent {
  public readonly form = input<FormGroup>(undefined);

  protected onPickerClosed(): void {
    const endDateNotSelected: boolean = this.form().get('dateFrom').value && !this.form().get('dateTo').value;
    if (endDateNotSelected) {
      this.form().patchValue({ dateTo: this.form().get('dateFrom').value });
    }
  }

  protected isToday(): boolean {
    const todayStr: string = new Date().toDateString();
    const startStr: string = new Date(this.form().get('dateFrom').value).toDateString();
    const endStr: string = new Date(this.form().get('dateTo').value).toDateString();
    return todayStr === startStr && todayStr === endStr;
  }
}
