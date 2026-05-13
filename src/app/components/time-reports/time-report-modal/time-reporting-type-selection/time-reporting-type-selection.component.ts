import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef
} from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { TimeReportingType } from '@app/shared/types/models/shared/time-reporting-type';
import { Task } from '@app/shared/types/models/task/task.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-time-reporting-type-selection',
  templateUrl: './time-reporting-type-selection.component.html',
  styleUrls: ['./time-reporting-type-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonToggleModule, TranslateModule, MatTooltip]
})
export class TimeReportingTypeSelectionComponent {
  protected readonly selectMode: typeof TimeReportingType = TimeReportingType;

  public readonly task: InputSignal<Task> = input.required<Task>();
  public readonly initialValue: InputSignal<TimeReportingType> = input<TimeReportingType>(undefined);
  public readonly isTimerVisible: InputSignal<boolean> = input<boolean>(undefined);
  public readonly selectionChange: OutputEmitterRef<TimeReportingType> = output<TimeReportingType>();

  protected setSelectionMode(mode: TimeReportingType): void {
    this.selectionChange.emit(mode);
  }

  protected isActiveTimerFromDifferentTask(): boolean {
    return true;
  }
}
