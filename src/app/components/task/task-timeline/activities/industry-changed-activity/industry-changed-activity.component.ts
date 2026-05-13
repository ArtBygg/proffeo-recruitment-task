import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TaskIndustryChangedActivity } from '@app/shared/types/models/task-activities/task-industry-changed-activity';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-industry-changed-activity',
  templateUrl: './industry-changed-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule]
})
export class IndustryChangedActivityComponent {
  public readonly activity = input.required<TaskIndustryChangedActivity>();
}
