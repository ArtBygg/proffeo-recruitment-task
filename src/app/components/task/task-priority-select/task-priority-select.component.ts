import { NgClass } from '@angular/common';
import { Component, input, InputSignal, linkedSignal, output, OutputEmitterRef, WritableSignal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TaskPriority } from '@app/shared/types/enums/task-priority.enum';

@Component({
  selector: 'proffeo-task-priority-select',
  imports: [MatMenuModule, MatIconModule, NgClass],
  templateUrl: './task-priority-select.component.html'
})
export class TaskPrioritySelectComponent {
  protected readonly taskPriorities = new Map<TaskPriority, string>([
    [TaskPriority.NORMAL, 'text-slate-500!'],
    [TaskPriority.MEDIUM, 'text-yellow-400!'],
    [TaskPriority.HIGH, 'text-red-500!']
  ]);
  protected readonly selectedPriority: WritableSignal<TaskPriority> = linkedSignal(() => this.taskPriority());

  public readonly prioritySelected: OutputEmitterRef<TaskPriority> = output<TaskPriority>();
  public readonly taskPriority: InputSignal<TaskPriority> = input.required<TaskPriority>();
  public readonly readonly: InputSignal<boolean> = input<boolean>(true);
  public readonly small: InputSignal<boolean> = input<boolean>(true);

  protected selectPriority(priority: TaskPriority): void {
    if (priority === this.selectedPriority()) return;
    this.selectedPriority.set(priority);
    this.prioritySelected.emit(priority);
  }
}
