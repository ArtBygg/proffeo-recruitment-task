import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AvatarComponent } from '@app/shared/components/group-avatars/avatar/proffeo-avatar.component';
import { AvatarSize } from '@app/shared/types/enums/avatar-size.enum';
import { User } from '@app/shared/types/models/user/user.model';

@Component({
  selector: 'proffeo-timeline-entry',
  templateUrl: './timeline-entry.component.html',
  styleUrls: ['./timeline-entry.component.scss'],
  imports: [NgClass, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineEntryComponent {
  public readonly cardClass = input<string>('');
  public readonly user = input<User | null>(null);
  public readonly pointAvatarSize = input<AvatarSize>(AvatarSize.EXTRA_SMALL);
}
