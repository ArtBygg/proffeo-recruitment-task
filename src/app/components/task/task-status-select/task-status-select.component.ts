import { NgClass } from '@angular/common';
import { Component, input, InputSignal, linkedSignal, output, OutputEmitterRef, WritableSignal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { TASK_STATUS_DISPLAY } from '@app/shared/types/enums/task-status.constants';
import { TaskStatus } from '@app/shared/types/enums/task-status.enum';
import { TaskStatusSelectEnum } from '@app/shared/types/models/task/task-status.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-task-status-select',
  imports: [MatMenu, NgClass, MatMenuModule, MatIconModule, TranslateModule],
  templateUrl: './task-status-select.component.html'
})
export class TaskStatusSelectComponent {
  protected readonly TASK_STATUS_DISPLAY = TASK_STATUS_DISPLAY;
  protected readonly TaskStatusSelectEnum = TaskStatusSelectEnum;
  protected readonly taskStatusOrder: TaskStatus[] = Object.values(TaskStatus);
  protected selectedStatus: WritableSignal<TaskStatus> = linkedSignal(() => this.taskStatus());

  public readonly statusSelected: OutputEmitterRef<TaskStatus> = output<TaskStatus>();

  public readonly taskStatus: InputSignal<TaskStatus> = input.required<TaskStatus>();
  public readonly readonly: InputSignal<boolean> = input<boolean>(true);
  public readonly small: InputSignal<boolean> = input<boolean>(false);
  public readonly mode: InputSignal<TaskStatusSelectEnum> = input<TaskStatusSelectEnum>(
    TaskStatusSelectEnum.RECTANGLES
  );

  protected selectStatus(status: TaskStatus): void {
    if (status === this.selectedStatus()) return;
    this.selectedStatus.set(status);
    this.statusSelected.emit(status);
  }
}
