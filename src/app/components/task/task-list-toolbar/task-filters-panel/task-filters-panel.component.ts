import { ChangeDetectionStrategy, Component, inject, output, OutputEmitterRef, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { TranslatePipe } from '@ngx-translate/core';
import { TaskFiltersService } from '../task-filters.service';
import { TaskFiltersComponent } from '../task-filters/task-filters';

@Component({
  selector: 'proffeo-task-filters-panel',
  imports: [MatIconModule, ButtonComponent, TranslatePipe, TaskFiltersComponent],
  templateUrl: './task-filters-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskFiltersPanelComponent {
  private readonly deviceService: DeviceService = inject(DeviceService);
  private readonly taskFiltersState: TaskFiltersService = inject(TaskFiltersService);
  protected readonly ButtonType: typeof ButtonType = ButtonType;
  protected readonly isMobile: Signal<boolean> = this.deviceService.isMobile;

  public readonly closeClicked: OutputEmitterRef<void> = output();

  protected onSearchClick(): void {
    if (this.isMobile()) {
      this.closeClicked.emit();
    }
  }

  protected clearFilters(): void {
    this.taskFiltersState.clearFilters();
    if (this.isMobile()) {
      this.closeClicked.emit();
    }
  }
}
