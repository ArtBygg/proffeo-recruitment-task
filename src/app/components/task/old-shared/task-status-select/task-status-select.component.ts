import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TASK_STATUS_DISPLAY } from '@app/shared/types/enums/task-status.constants';
import { TaskStatus } from '@app/shared/types/enums/task-status.enum';
import { DropdownItem } from '@app/shared/types/models/shared/dropdown-item';
import { disableScroll, enableScroll } from '@app/shared/utils/scroll-utils';
import { TranslateModule } from '@ngx-translate/core';

export type TaskStatusSelectMode = 'compact' | 'full';

@Component({
  selector: 'proffeo-tasks-status-select',
  templateUrl: './task-status-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, MatMenuModule, MatIconModule, CommonModule]
})
export class TaskStatusSelectComponent implements OnInit {
  protected readonly disableScroll: () => void = disableScroll;
  protected readonly enableScroll: () => void = enableScroll;
  protected readonly dropdownItems: DropdownItem<TaskStatus>[] = (Object.values(TaskStatus) as TaskStatus[]).map(
    value => ({
      value,
      label: TASK_STATUS_DISPLAY[value].translationKey,
      iconName: 'circle',
      iconColor: TASK_STATUS_DISPLAY[value].iconColorClass
    })
  );

  protected selectedActiveStatus: WritableSignal<TaskStatus> = signal(null);

  public readonly activeStatus: InputSignal<TaskStatus> = input.required<TaskStatus>();
  public readonly isReadonly: InputSignal<boolean> = input<boolean>(false);
  public readonly showLabel: InputSignal<boolean> = input<boolean>(false);
  public readonly minimalMode: InputSignal<boolean> = input<boolean>(false);
  public readonly statusSelected: OutputEmitterRef<TaskStatus> = output<TaskStatus>();

  public ngOnInit(): void {
    this.selectedActiveStatus.set(this.activeStatus());
  }

  protected selected(status: TaskStatus): void {
    this.statusSelected.emit(status);
    this.selectedActiveStatus.set(status);
  }

  protected getDropDownItem(status: string): DropdownItem<TaskStatus> {
    return this.dropdownItems.find((item: DropdownItem<TaskStatus>) => item.value === status);
  }
}
