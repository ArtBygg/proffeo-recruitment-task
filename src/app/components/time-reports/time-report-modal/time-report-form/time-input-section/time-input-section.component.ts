import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatError } from '@angular/material/form-field';
import { TimeButtonsComponent } from '@app/components/time-reports/time-report-modal/time-buttons/time-buttons.component';
import { TimePickerComponent } from '@app/shared/components/time-picker/time-picker.component';
import { TimePickerValue } from '@app/shared/types/models/shared/time-picker-value';
import { TimeReportingType } from '@app/shared/types/models/shared/time-reporting-type';
import { TranslateModule } from '@ngx-translate/core';

export interface TimeRangeFormControls {
  'from-time': TimePickerValue;
  'to-time': TimePickerValue;
}

export enum TimeRangeFormName {
  FROM_TIME = 'from-time',
  TO_TIME = 'to-time'
}

@Component({
  selector: 'proffeo-time-input-section',
  templateUrl: './time-input-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatError, TranslateModule, TimePickerComponent, TimeButtonsComponent]
})
export class TimeInputSectionComponent implements OnInit {
  @ViewChild('secondTimePicker') public secondTimePicker!: TimePickerComponent;

  private readonly destroyRef = inject(DestroyRef);

  protected readonly TimeRangeFormName: typeof TimeRangeFormName = TimeRangeFormName;
  protected readonly TimeReportingType: typeof TimeReportingType = TimeReportingType;
  protected hoursDisplay = '00';
  protected minutesDisplay = '00';

  public readonly mode: InputSignal<TimeReportingType> = input.required<TimeReportingType>();
  public readonly manualTimeControl: InputSignal<FormControl<TimePickerValue>> = input<FormControl<TimePickerValue>>();
  public readonly timeRangeForm: InputSignal<FormGroup> = input<FormGroup>();
  public readonly minuteStep: InputSignal<number> = input<number>(1);
  public readonly quickTimeSelected: OutputEmitterRef<TimePickerValue> = output<TimePickerValue>();

  public ngOnInit(): void {
    this.setupTimeRangeSubscription();
  }

  private setupTimeRangeSubscription(): void {
    const rangeForm = this.timeRangeForm();
    if (!rangeForm) return;

    this.updateTimeDifference(rangeForm.value);

    rangeForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(values => this.updateTimeDifference(values));
  }

  private updateTimeDifference(values: Record<TimeRangeFormName, TimePickerValue>): void {
    const fromTime: TimePickerValue = values[TimeRangeFormName.FROM_TIME];
    const toTime: TimePickerValue = values[TimeRangeFormName.TO_TIME];

    if (!fromTime || !toTime) return;

    const diff = this.calculateTimeDifference(fromTime, toTime);
    this.hoursDisplay = this.formatValue(diff.hours);
    this.minutesDisplay = this.formatValue(diff.minutes);
  }

  private calculateTimeDifference(from: TimePickerValue, to: TimePickerValue): TimePickerValue {
    const fromMinutes = from.hours * 60 + from.minutes;
    const toMinutes = to.hours * 60 + to.minutes;
    let diffMinutes = toMinutes - fromMinutes;

    if (diffMinutes < 0) {
      diffMinutes += 1440; // 24h in minutes
    }

    return {
      hours: Math.floor(diffMinutes / 60),
      minutes: diffMinutes % 60
    };
  }

  private formatValue(value?: number): string {
    if (!value) return '00';
    return value < 10 ? `0${value}` : value.toString();
  }

  protected onQuickTimeSelected(value: TimePickerValue): void {
    this.quickTimeSelected.emit(value);
  }

  protected onFirstTimePickerUpdated(): void {
    // Przenieś focus na drugi time picker po wypełnieniu pierwszego
    if (this.secondTimePicker) {
      this.secondTimePicker.hoursInput.nativeElement.focus();
    }
  }
}
