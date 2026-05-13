import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IntlDurationPipe } from '@app/shared/pipes/intl-duration.pipe';
import { TaskTimeEstimationChangedActivity } from '@app/shared/types/models/task-activities/task-time-estimation-changed-activity';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-time-estimation-changed-activity',
  templateUrl: './time-estimation-changed-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, IntlDurationPipe]
})
export class TimeEstimationChangedActivityComponent {
  public readonly activity = input.required<TaskTimeEstimationChangedActivity>();
}
