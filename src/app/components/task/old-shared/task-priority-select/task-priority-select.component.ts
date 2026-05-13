import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TaskPriority } from '@app/shared/types/enums/task-priority.enum';
import { DropdownItem } from '@app/shared/types/models/shared/dropdown-item';
import { disableScroll, enableScroll } from '@app/shared/utils/scroll-utils';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-task-priority-select',
  templateUrl: './task-priority-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, MatMenuModule, MatIconModule, NgClass]
})
export class TaskPrioritySelectComponent {
  private readonly translateService: TranslateService = inject(TranslateService);

  protected readonly disableScroll: () => void = disableScroll;
  protected readonly enableScroll: () => void = enableScroll;
  protected readonly taskPriority: typeof TaskPriority = TaskPriority;
  protected readonly priorityIconName: string = 'flag';

  public readonly value = input.required<TaskPriority>();
  public readonly disabled = input<boolean>(false);
  public readonly minimalMode = input<boolean>(false);
  public readonly prioritySelected = output<TaskPriority>();

  protected get dropdownValues(): DropdownItem<TaskPriority>[] {
    return [
      {
        value: TaskPriority.NORMAL,
        label: this.translateService.instant('task-priority-normal'),
        iconName: this.priorityIconName,
        iconColor: 'text-slate-500'
      },
      {
        value: TaskPriority.MEDIUM,
        label: this.translateService.instant('task-priority-medium'),
        iconName: this.priorityIconName,
        iconColor: 'text-orange-400'
      },
      {
        value: TaskPriority.HIGH,
        label: this.translateService.instant('task-priority-high'),
        iconName: this.priorityIconName,
        iconColor: 'text-rose-600'
      }
    ];
  }

  protected onSelectPriority(priority: TaskPriority): void {
    this.prioritySelected.emit(priority);
  }
}
