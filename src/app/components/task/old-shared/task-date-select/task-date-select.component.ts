import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
  linkedSignal,
  output,
  OutputEmitterRef,
  Signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { MatDatepicker, MatDatepickerInput, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatFormField } from '@angular/material/select';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { disableScroll, enableScroll } from '@app/shared/utils/scroll-utils';

@Component({
  selector: 'proffeo-task-date-select',
  templateUrl: './task-date-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./task-date-select.styles.scss'],
  imports: [MatFormField, MatDatepicker, MatDatepickerInput, MatIconModule, MatInput, DatePipe]
})
export class TaskDateSelectComponent implements AfterViewInit {
  @ViewChild('datePicker') private readonly datePicker: MatDatepicker<Date>;
  private readonly deviceService: DeviceService = inject(DeviceService);

  protected readonly isMobile: Signal<boolean> = this.deviceService.isMobile;
  protected readonly selectedDateValue: WritableSignal<Date> = linkedSignal(() => this.currentDate());

  public readonly currentDate: InputSignal<Date> = input<Date>(undefined);
  public readonly minDate: InputSignal<Date> = input<Date>(undefined);
  public readonly maxDate: InputSignal<Date> = input<Date>(undefined);
  public readonly iconVisible: InputSignal<boolean> = input<boolean>(true);
  public readonly isSmall: InputSignal<boolean> = input<boolean>(false);
  public readonly fontIcon: InputSignal<string> = input<string>(undefined);
  public readonly isReadonly: InputSignal<boolean> = input<boolean>(false);
  public readonly shortYear: InputSignal<boolean> = input<boolean>(false);
  public readonly dateChange: OutputEmitterRef<Date> = output<Date>();

  public ngAfterViewInit(): void {
    this.datePicker.closedStream.subscribe(() => {
      enableScroll();
    });
  }

  protected openDatePicker(): void {
    if (!this.isReadonly()) {
      this.datePicker.open();
      disableScroll();
    }
  }

  protected onDateSelected(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      this.selectedDateValue.set(event.value);
      this.dateChange.emit(this.selectedDateValue());
    }
  }
}
