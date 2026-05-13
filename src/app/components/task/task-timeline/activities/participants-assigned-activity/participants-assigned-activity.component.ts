import { ChangeDetectionStrategy, Component, computed, input, Signal } from '@angular/core';
import { AvatarsGroupComponent } from '@app/shared/components/group-avatars/proffeo-group-avatars.component';
import {
  TaskParticipant,
  TaskParticipantsAssignedActivity
} from '@app/shared/types/models/task-activities/task-participants-assigned-activity';
import { User } from '@app/shared/types/models/user/user.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-participants-assigned-activity',
  templateUrl: './participants-assigned-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarsGroupComponent, TranslateModule]
})
export class ParticipantsAssignedActivityComponent {
  protected readonly users: Signal<User[]> = computed(() =>
    this.activity().data.participants?.map((participant: TaskParticipant) => participant.user)
  );
  public readonly activity = input.required<TaskParticipantsAssignedActivity>();
}
