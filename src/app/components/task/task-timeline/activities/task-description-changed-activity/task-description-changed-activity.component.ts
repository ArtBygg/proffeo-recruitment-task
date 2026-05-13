import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { TaskDescriptionChangedActivity } from '@app/shared/types/models/task-activities/task-description-changed-activity';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-task-description-changed-activity',
  templateUrl: './task-description-changed-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, MatMenuModule]
})
export class TaskDescriptionChangedActivityComponent {
  protected readonly descriptionPlainText = computed(() => this.getDescriptionPlainText(this.activity()?.data?.to));

  public readonly activity = input.required<TaskDescriptionChangedActivity>();

  private getDescriptionPlainText(html: string | undefined): string {
    if (!html) {
      return '';
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent?.trim() ?? '';
  }
}
