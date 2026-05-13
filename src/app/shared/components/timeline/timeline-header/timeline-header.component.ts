import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { User } from '@app/shared/types/models/user/user.model';

@Component({
  selector: 'proffeo-timeline-header',
  templateUrl: './timeline-header.component.html',
  styleUrls: ['./timeline-header.component.scss'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineHeaderComponent {
  protected readonly userLabel = computed(() => {
    const user = this.user();
    if (!user) {
      return 'Unknown user';
    }

    return user.fullName || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Unknown user';
  });

  public readonly user = input<User | null>(null);
  public readonly dateTime = input<Date | null>(null);
}
