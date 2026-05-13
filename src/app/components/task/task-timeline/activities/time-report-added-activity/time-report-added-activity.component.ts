import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IntlDurationPipe } from '@app/shared/pipes/intl-duration.pipe';
import { TaskTimeReportAddedActivity } from '@app/shared/types/models/task-activities/task-time-report-added-activity';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-time-report-added-activity',
  templateUrl: './time-report-added-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, IntlDurationPipe]
})
export class TimeReportAddedActivityComponent {
  public readonly activity = input.required<TaskTimeReportAddedActivity>();
}
