import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
  OnInit,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatError } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TimeReportFileAttachmentsComponent } from '@app/components/time-reports/time-report-modal/time-report-form/time-report-file-attachments/time-report-file-attachments.component';
import { DatePickerComponent } from '@app/shared/components/date-picker/date-picker.component';
import { DropdownComponent } from '@app/shared/components/dropdown/dropdown.component';
import { TextAreaComponent } from '@app/shared/components/text-area/text-area.component';
import { HoursTypeDictionaryService } from '@app/shared/services/hours-type-dictionary-service';
import { ProjectsDataService } from '@app/shared/services/projects-data.service';
import { HoursType } from '@app/shared/types/enums/hours-type';
import { TimeReport } from '@app/shared/types/models/reports/time-report';
import { WorkTimeReport } from '@app/shared/types/models/reports/work-time-report';
import { DropdownItem } from '@app/shared/types/models/shared/dropdown-item';
import { TimePickerValue } from '@app/shared/types/models/shared/time-picker-value';
import { TimeReportingType } from '@app/shared/types/models/shared/time-reporting-type';
import { Task } from '@app/shared/types/models/task/task.model';
import { TranslateModule } from '@ngx-translate/core';
import { TimeRangeForm, TimeReportForm, TimeReportFormName } from '../time-report-modal.component';
import {
  ProjectTaskPreselection,
  ProjectTaskSelection,
  ProjectTaskSelectorComponent
} from './project-task-selector/project-task-selector.component';
import { TimeInputSectionComponent } from './time-input-section/time-input-section.component';

@Component({
  selector: 'proffeo-time-report-form',
  templateUrl: './time-report-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatError,
    MatIconModule,
    TranslateModule,
    DatePickerComponent,
    DropdownComponent,
    TextAreaComponent,
    ProjectTaskSelectorComponent,
    TimeInputSectionComponent,
    TimeReportFileAttachmentsComponent
  ]
})
export class TimeReportFormComponent implements OnInit {
  @ViewChild(ProjectTaskSelectorComponent) public projectTaskSelector!: ProjectTaskSelectorComponent;

  private readonly hoursTypeDictionary = inject(HoursTypeDictionaryService);
  private readonly projectsService = inject(ProjectsDataService);

  protected defaultOrdinaryHours = 'OrdinaryHours';
  protected projectTaskPreselection: WritableSignal<ProjectTaskPreselection> = signal({});
  protected isReadonlyMode: WritableSignal<boolean> = signal(false);
  protected currentSelection: WritableSignal<ProjectTaskSelection> = signal({
    companyId: null,
    projectId: null,
    taskId: null,
    locationId: null
  });
  protected hourTypes: DropdownItem<string>[] = [];

  public readonly form: InputSignal<FormGroup<TimeReportForm>> = input<FormGroup<TimeReportForm>>();
  public readonly selectedValue: InputSignal<TimeReportingType> = input<TimeReportingType>();
  public readonly timeReport: InputSignal<TimeReport> = input<TimeReport>();
  public readonly task: InputSignal<Task> = input<Task>();
  public readonly currentMinuteStep: InputSignal<number> = input<number>(1);

  protected get manualTimeControl(): FormControl<TimePickerValue> | null {
    return this.form()?.get(TimeReportFormName.MANUAL_TIME) as FormControl<TimePickerValue>;
  }

  protected get timeRangeForm(): FormGroup<TimeRangeForm> | null {
    return this.form()?.get(TimeReportFormName.TIME_RANGE) as FormGroup<TimeRangeForm>;
  }

  protected get dateControl(): FormControl<Date | null> | null {
    return this.form()?.get(TimeReportFormName.DATE) as FormControl<Date | null>;
  }

  protected get hourTypeControl(): FormControl<HoursType> | null {
    return this.form()?.get(TimeReportFormName.HOUR_TYPE) as FormControl<HoursType>;
  }

  protected get userNameControl(): FormControl<string> {
    return this.form()?.get(TimeReportFormName.USER_NAME) as FormControl<string>;
  }

  protected get commentControl(): FormControl<string> | null {
    return this.form()?.get(TimeReportFormName.COMMENT) as FormControl<string>;
  }

  public ngOnInit(): void {
    this.hourTypes = this.hoursTypeDictionary.getHoursTypeDictionary();
    this.initializeMode();
  }

  private initializeMode(): void {
    const task = this.task();
    const report = this.timeReport();

    if (task) {
      this.isReadonlyMode.set(true);
      this.projectTaskPreselection.set(this.buildPreselectionFromTask(task));
    } else if (report) {
      this.isReadonlyMode.set(true);
      this.projectTaskPreselection.set(this.buildPreselectionFromReport(report));
    } else {
      this.isReadonlyMode.set(false);
    }
  }

  private buildPreselectionFromTask(task: Task): ProjectTaskPreselection {
    const project = task.project();
    const company = project?.company();

    return {
      companyId: company?.id,
      companyName: company?.name,
      projectId: project?.id,
      projectName: project?.name,
      taskId: task.id,
      taskName: task.name
    };
  }

  private buildPreselectionFromReport(report: TimeReport): ProjectTaskPreselection {
    if (!(report instanceof WorkTimeReport)) {
      return {};
    }

    // WorkTimeReport has no company - have to get it from the project
    let companyId: string | undefined;
    let companyName: string | undefined;

    if (report.projectId) {
      const project = this.projectsService.getById(report.projectId)();
      if (project) {
        const company = project.company();
        companyId = company?.id;
        companyName = company?.name;
      }
    }

    return {
      companyId,
      companyName,
      projectId: report.projectId,
      projectName: report.project?.name,
      taskId: report.taskId,
      taskName: report.task?.name,
      locationId: report.locationId
    };
  }

  protected onProjectTaskSelectionChange(selection: ProjectTaskSelection): void {
    this.currentSelection.set(selection);

    const form = this.form();
    if (form) {
      form.patchValue({
        [TimeReportFormName.PROJECT]: selection.projectId,
        [TimeReportFormName.TASK]: selection.taskId
      });
    }
  }

  protected onQuickTimeSelected(value: TimePickerValue): void {
    this.form()
      ?.get(TimeReportFormName.MANUAL_TIME)
      ?.setValue({ ...value });
  }

  public getProjectTaskSelection(): ProjectTaskSelection {
    return this.projectTaskSelector?.getSelection() ?? this.currentSelection();
  }

  public isProjectTaskValid(): boolean {
    return this.projectTaskSelector?.isValid() ?? false;
  }

  public markAllAsTouched(): void {
    this.form()?.markAllAsTouched();
    this.projectTaskSelector?.markAllAsTouched();
  }
}
