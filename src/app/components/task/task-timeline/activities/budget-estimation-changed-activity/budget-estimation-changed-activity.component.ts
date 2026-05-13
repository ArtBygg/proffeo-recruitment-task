import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TaskBudgetEstimationChangedActivity } from '@app/shared/types/models/task-activities/task-budget-estimation-changed-activity';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-budget-estimation-changed-activity',
  templateUrl: './budget-estimation-changed-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule]
})
export class BudgetEstimationChangedActivityComponent {
  public readonly activity = input.required<TaskBudgetEstimationChangedActivity>();
}
