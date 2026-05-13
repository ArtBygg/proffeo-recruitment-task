import { ChangeDetectionStrategy, Component, computed, input, Signal } from '@angular/core';
import { TASK_PRIORITY_TRANSLATION_KEYS } from '@app/shared/types/enums/task-priority.enum';
import { TaskPriorityChangedActivity } from '@app/shared/types/models/task-activities/task-priority-changed-activity';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  imports: [TranslateModule],
  selector: 'proffeo-priority-changed-activity',
  templateUrl: './priority-changed-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriorityChangedActivityComponent {
  protected readonly priorityTranslationKey: Signal<string> = computed(() =>
    TASK_PRIORITY_TRANSLATION_KEYS.get(this.activity().data?.to)
  );
  public readonly activity = input.required<TaskPriorityChangedActivity>();
}
