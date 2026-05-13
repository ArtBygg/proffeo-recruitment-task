import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TASK_STATUS_DISPLAY } from '@app/shared/types/enums/task-status.constants';
import { TaskStatus } from '@app/shared/types/enums/task-status.enum';
import { TaskStatusChangedActivity } from '@app/shared/types/models/task-activities/task-status-changed-activity';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-status-changed-activity',
  templateUrl: './status-changed-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule]
})
export class StatusChangedActivityComponent {
  private readonly translateService: TranslateService = inject(TranslateService);

  protected label = computed(() => {
    const taskActivity = this.activity();
    return this.mapLabel(taskActivity?.data?.to);
  });

  public readonly activity = input<TaskStatusChangedActivity>();

  private mapLabel(status: TaskStatus | undefined): string {
    if (status === null || status === undefined || !(status in TASK_STATUS_DISPLAY)) return '';
    return this.translateService.instant(TASK_STATUS_DISPLAY[status].translationKey);
  }
}
