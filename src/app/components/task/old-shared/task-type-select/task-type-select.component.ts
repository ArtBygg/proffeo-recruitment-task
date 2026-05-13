import { Component, input, InputSignal, linkedSignal, output, OutputEmitterRef, WritableSignal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TaskType } from '@app/shared/types/models/task/task-type.model';

@Component({
  selector: 'proffeo-task-type-select',
  imports: [MatIconModule, MatMenuModule],
  templateUrl: './task-type-select.component.html'
})
export class TaskTypeSelectComponent {
  protected selectedTaskType: WritableSignal<TaskType> = linkedSignal(() => this.activeTaskType());

  public taskTypeSelected: OutputEmitterRef<TaskType> = output();
  public taskTypes: InputSignal<TaskType[]> = input([]);
  public activeTaskType: InputSignal<TaskType> = input(this.taskTypes()[0]);
  public small: InputSignal<boolean> = input(false);
  public readonly: InputSignal<boolean> = input(true);
  public taskNumber: InputSignal<string> = input('');

  protected selectTaskType(taskType: TaskType): void {
    if (taskType === this.selectedTaskType()) return;
    this.taskTypeSelected.emit(taskType);
    this.selectedTaskType.set(taskType);
  }
}
