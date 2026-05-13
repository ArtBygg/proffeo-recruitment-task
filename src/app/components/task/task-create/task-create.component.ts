import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  InputSignal,
  linkedSignal,
  model,
  ModelSignal,
  OnDestroy,
  signal,
  Signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatError, MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { EditorComponent } from '@app/components/editor/editor.component';
import { TaskCreateForm } from '@app/components/modals/create-task-modal/create-task-modal.component';
import { FileDropComponent } from '@app/shared/components/files/file-drop/file-drop.component';
import { ProjectTaskDTO } from '@app/shared/services/dtos/project-tasks/project-task.dto';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { ModalService } from '@app/shared/services/shared/modal.service';
import { Location, SelectSingleLocationModalData } from '@app/shared/types/models/location/location.model';
import { ProjectIndustry } from '@app/shared/types/models/project-industry/project-industry.model';
import { ProjectParticipant } from '@app/shared/types/models/project/project-participant';
import { Project } from '@app/shared/types/models/project/project.model';
import { TaskType } from '@app/shared/types/models/task/task-type.model';
import { Task } from '@app/shared/types/models/task/task.model';
import { filesMaxSizeValidator } from '@app/shared/validators/file-max-size.validator';
import { TranslateModule } from '@ngx-translate/core';

export interface TaskCreateData {
  task: Partial<ProjectTaskDTO>;
  files: File[] | undefined;
}

@Component({
  selector: 'proffeo-task-create',
  templateUrl: './task-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    FileDropComponent,
    MatIconModule,
    CdkTextareaAutosize,
    MatError,
    MatSelectModule,
    MatFormFieldModule,
    MatLabel,
    MatHint,
    MatInputModule
  ]
})
export class TaskCreateComponent implements OnDestroy {
  @ViewChild(EditorComponent) protected editorComponent: EditorComponent;

  private readonly deviceService: DeviceService = inject(DeviceService);
  private readonly modalService: ModalService = inject(ModalService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  protected readonly MAX_TITLE_LENGTH: number = 100;
  protected readonly isMobile: Signal<boolean> = this.deviceService.isMobile;
  protected readonly filesMaxSizeValidator = filesMaxSizeValidator;
  protected readonly taskParticipants: WritableSignal<ProjectParticipant[]> = signal([]);
  protected readonly files: WritableSignal<File[]> = signal<File[]>([]);
  protected readonly isTitleFocused: WritableSignal<boolean> = signal(false);
  protected readonly selectedLocation: WritableSignal<Location> = linkedSignal(() =>
    this.projectLocations().find(
      projectLocation => projectLocation.id === this.createTaskForm().controls.locationId.value
    )
  );

  protected blobUrls: string[] = [];

  public readonly isCompact: InputSignal<boolean> = input<boolean>(false);
  public readonly parentTask: InputSignal<Task | undefined> = input<Task | undefined>(undefined);
  public readonly taskTypes: InputSignal<TaskType[]> = input<TaskType[]>([]);
  public readonly project: InputSignal<Project> = input.required<Project>();
  public readonly projectIndustries: InputSignal<ProjectIndustry[]> = input<ProjectIndustry[]>([]);
  public readonly projectParticipants: InputSignal<ProjectParticipant[]> = input<ProjectParticipant[]>([]);
  public readonly projectLocations: InputSignal<Location[]> = input<Location[]>([]);
  public readonly createTaskForm: InputSignal<FormGroup<TaskCreateForm>> = input.required<FormGroup<TaskCreateForm>>();
  public readonly firstStep: ModelSignal<boolean> = model(true);

  public constructor() {
    effect(() => {
      this.createTaskForm().patchValue({
        files: this.files()
      });
    });
  }

  public getTaskCreateData(): TaskCreateData {
    return {
      files: this.files(),
      task: this.createTaskForm().value
    };
  }

  public ngOnDestroy(): void {
    this.blobUrls.forEach(blobUrl => URL.revokeObjectURL(blobUrl));
  }

  protected selectTaskType(taskTypeId: string): void {
    this.createTaskForm().patchValue({
      taskTypeId: taskTypeId
    });
    this.firstStep.set(false);
  }

  protected onRemoveFile(file: File): void {
    const files: File[] = this.files().filter((value: File) => value !== file);
    this.files.set(files);
  }

  protected onFilesAdded(files: File[]): void {
    const allFiles: File[] = [...this.files(), ...files];
    this.files.set(allFiles);
  }

  protected getBlobUrl(file: File): string {
    const url = URL.createObjectURL(file);
    this.blobUrls.push(url);
    return url;
  }

  public isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  protected onLocationClicked(): void {
    const data: SelectSingleLocationModalData = {
      locations: this.projectLocations(),
      selectedLocation: this.selectedLocation(),
      projectId: this.project().id,
      showEditButton: false,
      isEmptyOptionEnabled: true,
      title: 'project-locations.modals.select-single-location-modal-title'
    };

    this.modalService
      .openSelectSingleLocationModal(data)
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: Location | undefined) => {
        if (!result) return;
        this.selectedLocation.set(result);
        this.createTaskForm().patchValue({
          locationId: result.id
        });
      });
  }
}
