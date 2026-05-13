import { SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, Signal } from '@angular/core';
import {
  AvatarBorderType,
  AvatarComponent
} from '@app/shared/components/group-avatars/avatar/proffeo-avatar.component';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { AvatarSize } from '@app/shared/types/enums/avatar-size.enum';
import { User } from '@app/shared/types/models/user/user.model';

@Component({
  selector: 'proffeo-group-avatars',
  templateUrl: './proffeo-group-avatars.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlicePipe, AvatarComponent]
})
export class AvatarsGroupComponent {
  protected readonly deviceService: DeviceService = inject(DeviceService);
  protected readonly AvatarBorderType = AvatarBorderType;
  protected readonly avatarsCount: Signal<number> = computed(() => {
    return this.deviceService.isMobile() ? 2 : this.showAvatarsCount();
  });

  public readonly groupUsers = input.required<User[]>();
  public readonly showAvatarsCount = input<number>(3);
  public readonly avatarSize = input<AvatarSize>(AvatarSize.EXTRA_SMALL);
  public readonly showMore = input<boolean>(true);
  public readonly marginFirstAvatar = input<boolean>(false);
  public readonly administratorId = input<string>(undefined);
  public readonly showNumberOnly = input<boolean>(false);
  public readonly baseZIndex = input<number>(0);
  public readonly avatarClick = output<User>();

  protected get paddingValue(): string {
    if (!this.groupUsers()?.length) {
      return '0';
    }

    switch (this.avatarSize()) {
      case 'mini':
        return '0.6rem';
      case 'extra small':
        return '0.6rem';
      case 'medium small':
        return '1rem';
      case 'small':
        return '1.25rem';
      case 'normal':
        return '1.5rem';
      case 'medium':
        return '1.75rem';
      case 'large':
        return '2rem';
      case 'huge':
        return '2.5rem';
      default:
        return '1rem';
    }
  }

  protected get marginValue(): string {
    if (!this.groupUsers()?.length) {
      return '0';
    }

    return `-${this.paddingValue}`;
  }

  protected onAvatarClick(user: User): void {
    this.avatarClick.emit(user);
  }

  protected getZIndex(index: number): number {
    const base = this.baseZIndex();
    return base > 0 ? base - index : this.groupUsers().length - index;
  }
}
