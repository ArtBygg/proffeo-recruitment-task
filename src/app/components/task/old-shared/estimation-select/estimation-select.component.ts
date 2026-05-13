import { Component, computed, inject, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IntlCurrencyPipe } from '@app/shared/pipes/intl-currency.pipe';
import { IntlDurationPipe } from '@app/shared/pipes/intl-duration.pipe';
import { ModalService } from '@app/shared/services/shared/modal.service';
import { TaskEstimation } from '@app/shared/types/models/task/task-estimation';
import { EstimationModalData } from '../../../modals/estimation-modal/estimation-modal.component';

@Component({
  selector: 'proffeo-estimation-select',
  templateUrl: './estimation-select.component.html',
  imports: [IntlCurrencyPipe, IntlDurationPipe, MatIconModule]
})
export class EstimationSelectComponent {
  private modalService: ModalService = inject(ModalService);

  protected hasTimeEstimation = computed(() => this.estimation()?.time !== undefined);
  protected hasCostEstimation = computed(
    () => this.estimation()?.financial !== undefined && this.estimation()?.financial.currency !== undefined
  );

  public readonly estimation: InputSignal<TaskEstimation | undefined> = input<TaskEstimation | undefined>();
  public readonly showTimeEstimation: InputSignal<boolean> = input<boolean>(true);
  public readonly showCostEstimation: InputSignal<boolean> = input<boolean>(true);
  public readonly estimationSelected: OutputEmitterRef<TaskEstimation> = output<TaskEstimation>();

  protected openEstimationModal(): void {
    const data: EstimationModalData = {
      width: '500px',
      estimation: this.estimation(),
      showTime: this.showTimeEstimation(),
      showCost: this.showCostEstimation(),
      autoFocus: false
    };

    this.modalService
      .openEstimationModal(data)
      .afterClosed()
      .subscribe((result: TaskEstimation | undefined) => {
        if (result) {
          this.estimationSelected.emit(result);
        }
      });
  }
}
