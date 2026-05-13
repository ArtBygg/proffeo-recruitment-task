import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TaskCreatedActivity } from '@app/shared/types/models/task-activities/task-created-activity';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-task-created-activity',
  templateUrl: './task-created-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule]
})
export class TaskCreatedActivityComponent {
  public readonly activity = input.required<TaskCreatedActivity>();
}
