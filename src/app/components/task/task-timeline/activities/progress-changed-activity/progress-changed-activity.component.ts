import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TaskProgressChangedActivity } from '@app/shared/types/models/task-activities/task-progress-changed-activity';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-progress-changed-activity',
  templateUrl: './progress-changed-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule]
})
export class ProgressChangedActivityComponent {
  public readonly activity = input.required<TaskProgressChangedActivity>();
}
