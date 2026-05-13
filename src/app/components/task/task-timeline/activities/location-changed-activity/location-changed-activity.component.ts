import { ChangeDetectionStrategy, Component, computed, input, InputSignal, Signal } from '@angular/core';
import { TaskLocationChangedActivity } from '@app/shared/types/models/task-activities/task-location-changed-activity';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-location-changed-activity',
  templateUrl: './location-changed-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule]
})
export class LocationChangedActivityComponent {
  protected locationPath: Signal<string> = computed(() =>
    this.activity()
      ?.data?.to?.locationsPath?.map(location => location.name)
      .join(' > ')
  );

  public readonly activity: InputSignal<TaskLocationChangedActivity> = input.required<TaskLocationChangedActivity>();
}
