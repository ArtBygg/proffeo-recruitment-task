import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { DropdownComponent } from '@app/shared/components/dropdown/dropdown.component';
import { InputComponent } from '@app/shared/components/input/input.component';
import { Currency } from '@app/shared/types/enums/currency.enum';
import { DropdownItem } from '@app/shared/types/models/shared/dropdown-item';
import { TaskEstimation } from '@app/shared/types/models/task/task-estimation';
import { TranslateModule } from '@ngx-translate/core';
import moment, { Duration } from 'moment';

type TimeUnit = 'minutes' | 'hours' | 'days';

interface TimeEstimateForm {
  amount: FormControl<number | null>;
  unit: FormControl<TimeUnit>;
}

interface CostEstimateForm {
  amount: FormControl<number | null>;
  currency: FormControl<Currency>;
}

interface EstimateForm {
  timeEstimate: FormGroup<TimeEstimateForm>;
  costEstimate: FormGroup<CostEstimateForm>;
}

interface SingleUnitDuration {
  amount: number;
  unit: TimeUnit;
}

function parseDurationToSingleUnit(duration: Duration): SingleUnitDuration {
  const totalDays = duration.asDays();
  const totalHours = duration.asHours();
  const totalMinutes = duration.asMinutes();

  // Helper to check if a number converts nicely to the next unit up
  // For example, 1.5, 2.5, or whole numbers
  const hasNiceConversion = (num: number): boolean => {
    const fraction = num % 1;
    return fraction === 0 || Math.abs(fraction - 0.5) < 0.01;
  };

  // Check days first - only use days if it's a nice fraction
  if (totalDays >= 1 && hasNiceConversion(totalDays)) {
    return {
      amount: Math.round(totalDays * 100) / 100,
      unit: 'days'
    };
  }

  // Check hours - use hours if it's >= 1 hour and either:
  // a) less than 24 hours or
  // b) not a nice conversion to days
  if (totalHours >= 1 && hasNiceConversion(totalHours)) {
    return {
      amount: Math.round(totalHours * 100) / 100,
      unit: 'hours'
    };
  }

  // Default to minutes for everything else
  return {
    amount: Math.max(Math.round(totalMinutes * 100) / 100, 0.01),
    unit: 'minutes'
  };
}

export interface EstimationModalData {
  width?: string;
  estimation?: TaskEstimation;
  showCost?: boolean;
  showTime?: boolean;
  autoFocus: boolean;
}

@Component({
  selector: 'app-estimation-modal',
  templateUrl: './estimation-modal.component.html',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    MatDialogModule,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogActions,
    MatDialogClose,
    MatIconModule,
    NgClass,
    InputComponent,
    DropdownComponent,
    ButtonComponent
  ]
})
// TODO: add active company currencies?
export class EstimationModalComponent implements OnInit {
  private readonly dialogRef: MatDialogRef<EstimationModalComponent> = inject(MatDialogRef<EstimationModalComponent>);
  private readonly data: EstimationModalData = inject(MAT_DIALOG_DATA);

  protected estimateForm = new FormGroup<EstimateForm>({
    timeEstimate: new FormGroup<TimeEstimateForm>({
      amount: new FormControl<number | null>(null, [Validators.min(0)]),
      unit: new FormControl<TimeUnit>('hours', { nonNullable: true })
    }),
    costEstimate: new FormGroup<CostEstimateForm>({
      amount: new FormControl<number | null>(null, [Validators.min(0)]),
      currency: new FormControl<Currency>(Currency.EUR, { nonNullable: true })
    })
  });

  protected showTimeEstimation = false;
  protected showCostEstimation = false;
  protected ButtonType = ButtonType;

  protected get timeUnitsItems(): DropdownItem<string>[] {
    return [
      {
        label: 'minutes',
        value: 'minutes'
      },
      {
        label: 'hours',
        value: 'hours'
      },
      {
        label: 'days',
        value: 'days'
      }
    ];
  }

  protected get currencyUnitsItems(): DropdownItem<string>[] {
    return [
      {
        label: 'PLN',
        value: Currency.PLN
      },
      {
        label: 'EUR',
        value: Currency.EUR
      },
      {
        label: 'USD',
        value: Currency.USD
      }
    ];
  }

  private get timeEstimateGroup(): FormGroup<TimeEstimateForm> {
    return this.estimateForm.controls.timeEstimate;
  }

  private get costEstimateGroup(): FormGroup<CostEstimateForm> {
    return this.estimateForm.controls.costEstimate;
  }

  private initializeTimeEstimate(): void {
    if (this.data.estimation && this.data.estimation.time) {
      this.showTimeEstimation = true;
      // In the future look into https://github.com/js-temporal/temporal-polyfill and https://tc39.es/proposal-temporal/docs/duration.html
      const { amount, unit } = parseDurationToSingleUnit(moment.duration(this.data.estimation.time));

      if (amount) {
        this.timeEstimateGroup.patchValue({ amount, unit });
      }
    }
  }

  public ngOnInit(): void {
    this.showTimeEstimation = this.data.showTime;
    this.showCostEstimation = this.data.showCost;

    this.initializeTimeEstimate();
    this.initializeCostEstimate();
  }

  protected toggleEstimationType(value: string[]): void {
    this.toggleTimeEstimate(value.includes('time'));
    this.toggleCostEstimate(value.includes('money'));
  }

  protected toggleTimeEstimate(checked: boolean): void {
    this.showTimeEstimation = checked;
    if (!checked) {
      this.timeEstimateGroup.reset();
    } else {
      this.initializeTimeEstimate();
    }
  }

  protected toggleCostEstimate(checked: boolean): void {
    this.showCostEstimation = checked;
    if (!checked) {
      this.costEstimateGroup.reset();
    } else {
      this.initializeCostEstimate();
    }
  }

  protected isFormValid(): boolean {
    if (!this.showTimeEstimation && !this.showCostEstimation) return true;

    let valid = true;
    if (this.showTimeEstimation) {
      valid = valid && (this.timeEstimateGroup.controls.amount.value ?? 0) > 0;
    }
    if (this.showCostEstimation) {
      valid = valid && (this.costEstimateGroup.controls.amount.value ?? 0) > 0;
    }
    return valid;
  }

  protected onSave(): void {
    if (!this.isFormValid()) return;

    const result: TaskEstimation = {
      time: undefined,
      financial: undefined
    };

    if (this.showTimeEstimation) {
      const { amount, unit } = this.timeEstimateGroup.getRawValue();
      if (amount !== null) {
        let duration: Duration;
        if (unit === 'minutes') {
          duration = moment.duration(amount, 'minutes');
        } else if (unit === 'hours') {
          duration = moment.duration(amount, 'hours');
        } else if (unit === 'days') {
          duration = moment.duration(amount, 'days');
        }

        result.time = duration.toISOString();
      }
    }

    if (this.showCostEstimation) {
      const { amount, currency } = this.costEstimateGroup.getRawValue();
      if (amount !== null) {
        result.financial = { amount, currency };
      }
    }

    this.dialogRef.close(result);
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  private initializeCostEstimate(): void {
    if (this.data.estimation && this.data.estimation.financial && this.data.estimation.financial.currency) {
      this.showCostEstimation = true;
      this.costEstimateGroup.patchValue({
        amount: this.data.estimation.financial.amount,
        currency: this.data.estimation.financial.currency
      });
    }
  }
}
