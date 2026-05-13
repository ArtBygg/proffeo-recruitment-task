import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
  ModelSignal,
  OnInit,
  signal,
  Signal,
  viewChild,
  WritableSignal
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TaskCreateComponent, TaskCreateData } from '@app/components/task/task-create/task-create.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { ModalComponent } from '@app/shared/components/modal/modal.component';
import { TasksActionsService } from '@app/shared/services/actions/tasks-actions.service';
import { Location } from '@app/shared/types/models/location/location.model';
import { ProjectIndustry } from '@app/shared/types/models/project-industry/project-industry.model';
import { Project } from '@app/shared/types/models/project/project.model';
import { TaskType } from '@app/shared/types/models/task/task-type.model';
import { Task } from '@app/shared/types/models/task/task.model';
import { filesMaxSizeValidator } from '@app/shared/validators/file-max-size.validator';
import { TranslateModule } from '@ngx-translate/core';
export interface CreateTaskModalData {
  project: Signal<Project>;
  taskTypes: Signal<TaskType[]>;
  projectIndustries: Signal<ProjectIndustry[]>;
  projectLocations: Signal<Location[]>;
  parentTask?: Task;
  taskPrototype?: Partial<Task>;
}

export interface TaskCreateForm {
  taskTypeId: FormControl<string | undefined>;
  locationId: FormControl<string | undefined>;
  industryId: FormControl<string | undefined>;
  name: FormControl<string | undefined>;
  description: FormControl<string | undefined>;
  files: FormControl<File[] | undefined>;
}
export interface CreateTaskModalResultData {
  reopenModal: boolean;
}

@Component({
  selector: 'proffeo-create-task-modal',
  templateUrl: './create-task-modal.component.html',
  providers: [TasksActionsService],
  imports: [MatDialogModule, TranslateModule, ModalComponent, TaskCreateComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateTaskModalComponent implements OnInit {
  private readonly taskActionsService: TasksActionsService = inject(TasksActionsService);
  private readonly MAX_FILES_SIZE_TASK_CREATE_MB: number = 30;
  private readonly dialogRef: MatDialogRef<CreateTaskModalComponent> = inject(MatDialogRef<CreateTaskModalComponent>);

  protected readonly ButtonType = ButtonType;
  protected readonly saving: WritableSignal<boolean> = signal(false);
  protected readonly dialogData: CreateTaskModalData = inject(MAT_DIALOG_DATA);

  protected createTaskForm: Signal<FormGroup<TaskCreateForm>> = signal(
    new FormGroup<TaskCreateForm>({
      taskTypeId: new FormControl<string | undefined>(undefined, [Validators.required]),
      locationId: new FormControl<string | undefined>(undefined),
      industryId: new FormControl<string | undefined>(undefined),
      name: new FormControl<string | undefined>(undefined, [Validators.required]),
      description: new FormControl<string | undefined>(undefined),
      files: new FormControl<File[] | undefined>(undefined, [filesMaxSizeValidator(this.MAX_FILES_SIZE_TASK_CREATE_MB)])
    })
  );

  public firstStep: ModelSignal<boolean> = model(true);
  public taskCreateComponent: Signal<TaskCreateComponent> = viewChild(TaskCreateComponent);

  protected get invalid(): boolean {
    return this.createTaskForm().invalid;
  }

  public ngOnInit(): void {
    const taskPrototype: Partial<Task> = this.dialogData.taskPrototype;
    if (!taskPrototype) return;
    this.createTaskForm().patchValue({
      taskTypeId: taskPrototype.taskType()?.id ?? undefined,
      locationId: taskPrototype.location()?.id ?? undefined,
      industryId: taskPrototype.projectIndustry()?.industry().id ?? undefined
    });
  }

  public save(reopenModal: boolean = false): void {
    const taskCreateData: TaskCreateData = this.taskCreateComponent().getTaskCreateData();
    if (this.dialogData.parentTask) {
      taskCreateData.task.parentTaskId = this.dialogData.parentTask.id;
    }
    this.saving.set(true);
    this.taskActionsService.createNewTask(taskCreateData).subscribe({
      next: () => this.dialogRef.close({ reopenModal }),
      error: () => {},
      complete: () => this.saving.set(false)
    });
  }
}
