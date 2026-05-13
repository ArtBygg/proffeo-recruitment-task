import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  Signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatError, MatFormField, MatInput } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskTimerComponent, TaskTimerMode } from '@app/components/task/old-shared/task-timer/task-timer.component';
import { TimeReportModalService } from '@app/components/time-reports/time-report-modal/time-report-modal.service';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { TasksDataService } from '@app/shared/services/tasks-data.service';
import { TimeReportsDataService } from '@app/shared/services/time-reports-data.service';
import { HoursType } from '@app/shared/types/enums/hours-type';
import { Project } from '@app/shared/types/models/project/project.model';
import { WorkTimeReport } from '@app/shared/types/models/reports/work-time-report';
import { TimePickerValue } from '@app/shared/types/models/shared/time-picker-value';
import { TimeReportingType } from '@app/shared/types/models/shared/time-reporting-type';
import { TaskTimer } from '@app/shared/types/models/task/task-timer';
import { Task } from '@app/shared/types/models/task/task.model';
import { IsoTimeUtils } from '@app/shared/utils/iso-time-utils';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { parse } from 'iso8601-duration';
import { map } from 'rxjs';
import { TimeReportFormComponent } from './time-report-form/time-report-form.component';
import { TimeReportingTypeSelectionComponent } from './time-reporting-type-selection/time-reporting-type-selection.component';

export interface TimeReportModalData {
  timeReport?: WorkTimeReport;
  project?: Project;
  task?: Task;
  dateFrom?: Date;
  dateTo?: Date;
  onlyTimerMode?: boolean;
}

export enum TimeRangeFormName {
  FROM_TIME = 'from-time',
  TO_TIME = 'to-time'
}

export interface TimeRangeForm {
  [TimeRangeFormName.FROM_TIME]: FormControl<TimePickerValue>;
  [TimeRangeFormName.TO_TIME]: FormControl<TimePickerValue>;
}

export enum TimeReportFormName {
  USER_NAME = 'user-name',
  DATE = 'date',
  MANUAL_TIME = 'manual-time',
  TIME_RANGE = 'time-range',
  PROJECT = 'project',
  TASK = 'task',
  HOUR_TYPE = 'hour-type',
  COMMENT = 'comment'
}

export interface TimeReportForm {
  [TimeReportFormName.USER_NAME]: FormControl<string>;
  [TimeReportFormName.DATE]: FormControl<Date | null>;
  [TimeReportFormName.MANUAL_TIME]: FormControl<TimePickerValue>;
  [TimeReportFormName.TIME_RANGE]: FormGroup<TimeRangeForm>;
  [TimeReportFormName.PROJECT]: FormControl<string>;
  [TimeReportFormName.TASK]: FormControl<string>;
  [TimeReportFormName.HOUR_TYPE]: FormControl<HoursType>;
  [TimeReportFormName.COMMENT]: FormControl<string>;
}

export const MINUTE_STEPS: number[] = [1, 5, 10, 15];

@Component({
  selector: 'proffeo-time-report-modal',
  templateUrl: './time-report-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MatSnackBar, TimeReportModalService],
  imports: [
    ReactiveFormsModule,
    MatMenuModule,
    MatIconModule,
    MatDialogClose,
    TranslateModule,
    TimeReportingTypeSelectionComponent,
    TimeReportFormComponent,
    TaskTimerComponent,
    ButtonComponent,
    MatFormField,
    MatInput,
    CdkTextareaAutosize,
    MatError
  ]
})
export class TimeReportModalComponent implements OnInit {
  @ViewChild(TimeReportFormComponent) public formComponent!: TimeReportFormComponent;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TimeReportModalComponent>);
  private readonly modalData: TimeReportModalData = inject(MAT_DIALOG_DATA);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translateService = inject(TranslateService);
  private readonly tasksService = inject(TasksDataService);
  private readonly timeReportsService = inject(TimeReportsDataService);
  private readonly timeReportModalService = inject(TimeReportModalService);

  protected readonly ButtonType = ButtonType;
  protected readonly TimeReportingType = TimeReportingType;
  protected readonly taskTimerMode = TaskTimerMode;
  protected readonly FormName = TimeReportFormName;
  protected form: WritableSignal<FormGroup<TimeReportForm>> = signal(undefined);
  protected files: WritableSignal<File[]> = signal([]);
  protected task: WritableSignal<Task> = signal(undefined);
  protected timeReport: WorkTimeReport | undefined;
  protected currentMinuteStep = 1;
  protected minuteSteps = signal<number[]>(MINUTE_STEPS);
  protected selectedTimeReportingType: WritableSignal<TimeReportingType> = signal(TimeReportingType.RANGE);
  protected activeTimer: Signal<TaskTimer> = computed(() => {
    return null;
  });
  protected isTimerVisible: Signal<boolean> = signal(false);
  protected isAddingNewReport: WritableSignal<boolean> = this.timeReportModalService.isAddingNewReport;
  protected canShowTimerOption = computed(() => !!this.task() && !this.timeReport);
  protected onlyTimerMode: WritableSignal<boolean> = signal(false);

  protected get modalTitle(): string {
    if (this.timeReport) {
      return 'time-reports-form-modal-edit-time-report';
    }
    return 'task-details-modal-add-time-report';
  }

  public ngOnInit(): void {
    this.timeReportModalService.initializeFiles(this.modalData.timeReport);
    this.task.set(this.modalData.task);
    this.onlyTimerMode.set(this.modalData.onlyTimerMode);
    this.timeReport = this.modalData.timeReport;
    this.isAddingNewReport.set(!this.timeReport);

    this.initializeTimeReportingType();
    this.buildForm();
  }

  private initializeTimeReportingType(): void {
    if (this.onlyTimerMode()) {
      this.selectedTimeReportingType.set(TimeReportingType.TIMER);
    } else if (this.isAddingNewReport()) {
      this.selectedTimeReportingType.set(TimeReportingType.MANUAL);
    } else {
      this.selectedTimeReportingType.set(TimeReportingType.RANGE);
    }
  }

  private buildForm(): void {
    const report = this.timeReport;

    this.form.set(
      this.fb.group({
        [TimeReportFormName.USER_NAME]: this.fb.control<string>({
          value: report?.createdBy?.()?.fullName ?? report?.user?.()?.fullName ?? '',
          disabled: true
        }),
        [TimeReportFormName.DATE]: this.fb.control<Date | null>(
          report?.date ? new Date(report.date) : new Date(),
          Validators.required
        ),
        [TimeReportFormName.MANUAL_TIME]: this.fb.control<TimePickerValue>(this.getInitialManualTime(report), [
          Validators.required,
          this.manualTimeValidator()
        ]),
        [TimeReportFormName.TIME_RANGE]: this.buildTimeRangeGroup(report),
        [TimeReportFormName.PROJECT]: this.fb.control(report?.projectId, Validators.required),
        [TimeReportFormName.TASK]: this.fb.control(report?.taskId, Validators.required),
        [TimeReportFormName.HOUR_TYPE]: this.fb.control<HoursType>(
          report?.hoursType ?? 'OrdinaryHours',
          Validators.required
        ),
        [TimeReportFormName.COMMENT]: this.fb.control(report?.description ?? '', Validators.required)
      })
    );

    this.updateFormControlsState();
  }

  private buildTimeRangeGroup(report?: WorkTimeReport): FormGroup<TimeRangeForm> {
    const now = new Date();

    return this.fb.group(
      {
        [TimeRangeFormName.FROM_TIME]: this.fb.control<TimePickerValue>(
          {
            hours: report?.dateFrom?.getHours() ?? now.getHours(),
            minutes: report?.dateFrom?.getMinutes() ?? now.getMinutes()
          },
          Validators.required
        ),
        [TimeRangeFormName.TO_TIME]: this.fb.control<TimePickerValue>(
          {
            hours: report?.dateTo?.getHours() ?? now.getHours(),
            minutes: report?.dateTo?.getMinutes() ?? now.getMinutes()
          },
          Validators.required
        )
      },
      { validators: [this.timeRangeValidator()] }
    );
  }

  private getInitialManualTime(report?: WorkTimeReport): TimePickerValue {
    if (report?.duration) {
      const duration = parse(report.duration);
      return { hours: duration.hours ?? 0, minutes: duration.minutes ?? 0 };
    }
    return { hours: 0, minutes: 0 };
  }

  // === VALIDATORS ===

  private timeRangeValidator(): ValidatorFn {
    return (group: AbstractControl) => {
      const fromControl = group.get(TimeRangeFormName.FROM_TIME);
      const toControl = group.get(TimeRangeFormName.TO_TIME);

      if (!fromControl?.touched || !toControl?.touched) {
        return null;
      }

      const fromSeconds = this.timeToSeconds(fromControl.value);
      const toSeconds = this.timeToSeconds(toControl.value);

      return fromSeconds >= toSeconds ? { invalidTimeRange: true } : null;
    };
  }

  private manualTimeValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const value: TimePickerValue = control.value;
      return this.timeToSeconds(value) === 0 ? { invalidManualTime: true } : null;
    };
  }

  private timeToSeconds(value: TimePickerValue): number {
    return value.hours * 3600 + value.minutes * 60;
  }

  // === EVENT HANDLERS ===

  protected onTimeReportingTypeChange(type: TimeReportingType): void {
    this.selectedTimeReportingType.set(type);
    this.updateFormControlsState();
  }

  private updateFormControlsState(): void {
    const type = this.selectedTimeReportingType();
    const manualControl = this.form().get(TimeReportFormName.MANUAL_TIME);
    const rangeControl = this.form().get(TimeReportFormName.TIME_RANGE);

    switch (type) {
      case TimeReportingType.TIMER:
        manualControl?.disable();
        rangeControl?.disable();
        break;
      case TimeReportingType.MANUAL:
        manualControl?.enable();
        rangeControl?.disable();
        break;
      case TimeReportingType.RANGE:
        manualControl?.disable();
        rangeControl?.enable();
        break;
    }
  }

  protected onMinuteStepChange(step: number): void {
    this.currentMinuteStep = step;
  }

  protected startTimer(): void {
    if (!this.task()) {
      this.snackBar.open(this.translateService.instant('NO TASK FOUND'), undefined, {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }
  }

  protected stopTimer(): void {
    if (this.form().controls.comment.invalid) {
      this.form().markAllAsTouched();
      this.formComponent?.markAllAsTouched();
      return;
    }
    if (!this.task()?.id) return;

    this.dialogRef.close(true);
  }

  protected saveTimeReport(shouldClose: boolean): void {
    if (this.form().invalid) {
      this.formComponent?.markAllAsTouched();
      this.form().markAllAsTouched();
      this.form().get(TimeReportFormName.TIME_RANGE)?.updateValueAndValidity();
      return;
    }

    const isNewFromScratch = !this.task() && !this.timeReport;
    if (isNewFromScratch && !this.formComponent?.isProjectTaskValid()) {
      return;
    }

    if (!this.form().valid) return;

    const report = this.buildReport();
    const selection = this.formComponent?.getProjectTaskSelection();
    const taskId = this.task()?.id ?? selection?.taskId;

    if (selection?.locationId) {
      report.locationId = selection.locationId;
    }

    const request$ = this.timeReport
      ? this.timeReportsService.updateWorkTimeReport(report).pipe(map(report => [report]))
      : this.timeReportsService.addWorkTimeReport(
          taskId!,
          report,
          this.timeReportModalService.previewFiles(),
          undefined, // descriptions
          undefined // tags
        );

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        if (shouldClose) {
          this.dialogRef.close(true);
        } else {
          this.timeReportsService.loadTimeReports(this.modalData.dateFrom, this.modalData.dateTo);
          this.resetForm();
        }
      },
      error: (err: unknown) => console.error('Failed to save time report:', err)
    });
  }

  private buildReport(): WorkTimeReport {
    const report = this.timeReport ?? new WorkTimeReport({});
    const formValue = this.form().getRawValue();

    report.date = formValue[TimeReportFormName.DATE]!;
    report.description = formValue[TimeReportFormName.COMMENT];
    report.hoursType = formValue[TimeReportFormName.HOUR_TYPE];
    report.duration = this.calculateDuration();
    report.reportType = 'WorkTime';

    this.setReportDates(report, formValue);

    return report;
  }

  private calculateDuration(): string {
    const type = this.selectedTimeReportingType();
    const formValue = this.form().getRawValue();

    switch (type) {
      case TimeReportingType.MANUAL: {
        const manual = formValue[TimeReportFormName.MANUAL_TIME];
        return IsoTimeUtils.convertHourToIsoTime(manual.hours, manual.minutes);
      }
      case TimeReportingType.RANGE: {
        const range = formValue[TimeReportFormName.TIME_RANGE];
        return IsoTimeUtils.convertTimePickerRangeToIsoTime(
          range[TimeRangeFormName.FROM_TIME],
          range[TimeRangeFormName.TO_TIME]
        );
      }
      case TimeReportingType.TIMER:
        return this.timeReport?.duration ?? 'PT0S';
      default:
        throw new Error('Unsupported time reporting type');
    }
  }

  private setReportDates(report: WorkTimeReport, formValue: Record<TimeReportFormName, unknown>): void {
    const baseDate = new Date(formValue[TimeReportFormName.DATE] as Date | null);
    const dateFrom = new Date(baseDate);
    const dateTo = new Date(baseDate);

    if (this.selectedTimeReportingType() === TimeReportingType.RANGE) {
      const range = formValue[TimeReportFormName.TIME_RANGE];
      const from = range[TimeRangeFormName.FROM_TIME];
      const to = range[TimeRangeFormName.TO_TIME];

      dateFrom.setHours(from.hours, from.minutes, 0, 0);
      dateTo.setHours(to.hours, to.minutes, 0, 0);
    } else {
      const durationSeconds = IsoTimeUtils.convertTimeDurationToSeconds(report.duration!);
      dateFrom.setSeconds(dateFrom.getSeconds() - durationSeconds);
    }

    report.dateFrom = dateFrom;
    report.dateTo = dateTo;
  }

  private resetForm(): void {
    this.timeReport = undefined;
    this.isAddingNewReport.set(true);
    this.buildForm();
  }
}
