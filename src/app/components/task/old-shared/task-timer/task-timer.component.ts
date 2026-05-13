import { AsyncPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Input,
  input,
  InputSignal,
  output,
  OutputEmitterRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatIconModule } from '@angular/material/icon';
import { IntlDurationPipe } from '@app/shared/pipes/intl-duration.pipe';
import { TaskTimer } from '@app/shared/types/models/task/task-timer';
import { TimeSpan } from '@app/shared/types/models/time-span';
import { TranslatePipe } from '@ngx-translate/core';
import { differenceInSeconds } from 'date-fns';
import moment from 'moment';
import { Observable, of, tap, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// TODO: verify why we use both date-fns and moment when they are used for the same thing

export enum TaskTimerMode {
  row = 'row',
  column = 'column',
  topBar = 'topBar',
  readonly = 'readonly'
}

@Component({
  selector: 'proffeo-task-timer',
  templateUrl: './task-timer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [IntlDurationPipe],
  imports: [AsyncPipe, NgTemplateOutlet, MatIconModule, TranslatePipe, IntlDurationPipe]
})
export class TaskTimerComponent {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly intlDurationPipe: IntlDurationPipe = inject(IntlDurationPipe);
  private readonly datePipe: DatePipe = inject(DatePipe);

  private _taskTimer: TaskTimer = undefined;
  private _taskTotalTrackedSeconds?: number = undefined;

  protected readonly taskTimerMode: typeof TaskTimerMode = TaskTimerMode;

  protected passingTime$: Observable<string> = undefined;
  protected timeSpanValue: string = undefined;
  protected timeSpanIso: string = undefined;
  protected alreadyUsedTimeSpanValue: string = undefined;

  public readonly showIcon: InputSignal<boolean> = input<boolean>(true);
  public readonly mode: InputSignal<TaskTimerMode> = input<TaskTimerMode>(TaskTimerMode.column);
  public readonly iconSize: InputSignal<'small' | 'large'> = input<'small' | 'large'>('large');
  public readonly estimation: InputSignal<string | undefined> = input<string | undefined>();
  public readonly isReadonly: InputSignal<boolean> = input<boolean>(false);
  public readonly timerStarted: OutputEmitterRef<void> = output<void>();
  public readonly timerStopped: OutputEmitterRef<void> = output<void>();

  public get taskTimer(): TaskTimer {
    return this._taskTimer;
  }

  public get taskTotalTrackedSeconds(): number {
    return this._taskTotalTrackedSeconds;
  }

  @Input()
  public set taskTotalTrackedSeconds(value: number) {
    this._taskTotalTrackedSeconds = value;
    if (!this._taskTotalTrackedSeconds) {
      this.alreadyUsedTimeSpanValue = this.intlDurationPipe.transform('PT0H').toString();
    } else {
      const duration = moment.duration(this._taskTotalTrackedSeconds, 'seconds');
      this.alreadyUsedTimeSpanValue = this.intlDurationPipe.transform(duration.toISOString()).toString();
    }
  }

  @Input()
  public set taskTimer(value: TaskTimer) {
    this._taskTimer = value;

    if (this._taskTimer) {
      if (this._taskTimer.timerStartedOn) {
        let secondsPassed: number = 0;
        let secondsOffset: number = this._taskTimer.timerStartedOn
          ? differenceInSeconds(new Date(), this._taskTimer.timerStartedOn!)
          : 0;
        if (secondsOffset < 0) {
          secondsOffset = 0;
        }

        this.passingTime$ = timer(0, 1000).pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            secondsPassed++;
          }),
          switchMap(() => {
            const totalSecondsPassed: number = secondsPassed + secondsOffset;
            const date: Date = new Date(1970, 0, 0);
            date.setSeconds(totalSecondsPassed);
            return of(this.datePipe.transform(date, this.getTimeFormat(totalSecondsPassed)));
          })
        );
      } else {
        this.passingTime$ = undefined;
      }
    }
  }

  // TODO: verify what is it for.
  @Input()
  public set timeSpan(value: TimeSpan) {
    if (value) {
      const duration = moment.duration(value.totalSeconds, 'seconds');
      this.timeSpanIso = duration.toISOString();
      this.timeSpanValue = this.intlDurationPipe.transform(this.timeSpanIso).toString();
    } else {
      this.timeSpanIso = undefined;
      this.timeSpanValue = '00:00';
    }
  }

  protected startTimer(): void {
    if (!this.taskTimer) {
      return;
    }
    this.timerStarted.emit();
  }

  protected stopTimer(): void {
    if (!this.taskTimer) {
      return;
    }
    this.timerStopped.emit();
  }

  protected toggleTimer(): void {
    if (!this.isReadonly()) {
      if (this._taskTimer) {
        if (this._taskTimer.isStarted) {
          this.stopTimer();
        } else {
          this.startTimer();
        }
      }
    }
  }

  private getTimeFormat(seconds: number): string {
    if (seconds >= 3600) {
      return 'HH:mm';
    } else {
      return 'mm:ss';
    }
  }
}
