import { NgClass, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AvatarSize } from '@app/shared/types/enums/avatar-size.enum';
import { User } from '@app/shared/types/models/user/user.model';

export enum AvatarBorderType {
  IndustryAdmin = 'accent',
  GroupAdmin = 'yellow-400',
  User = 'gray-400'
}

@Component({
  selector: 'proffeo-avatar',
  templateUrl: './proffeo-avatar.component.html',
  styleUrls: ['./proffeo-avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlicePipe, MatIconModule, MatTooltipModule, NgClass]
})
export class AvatarComponent {
  public readonly size = input<AvatarSize>(AvatarSize.NORMAL);
  public readonly readonly = input<boolean>(false);
  public readonly borderType = input<AvatarBorderType>(undefined);
  public readonly avatarNumber = input<number>(0);
  public readonly iconName = input<string>(undefined);
  public readonly matTooltip = input<string>(undefined);
  public readonly ngIcon = input<boolean>(false);
  public readonly ngIconName = input<string>('person');
  public readonly userInteraction = output<void>();
  public user: InputSignal<User> = input<User>();

  protected getRingClass(): string {
    const borderType = this.borderType();
    const ringColorClass: string = borderType ? `ring-${borderType}` : 'ring-white';
    return `${this.getAvatarSize()} ${ringColorClass}`;
  }

  protected getDefaultTooltip(): string | undefined {
    return this.user() ? this.user()?.fullName : 'Add user(s)';
  }

  protected getAvatarSize(): string {
    switch (this.size()) {
      case 'extra mini':
        return 'w-4 h-4 ring-1';
      case 'mini':
        return 'w-6 h-6 ring-2';
      case 'extra small':
        return 'w-8 h-8 ring-2';
      case 'medium small':
        return 'w-10 h-10 ring-2';
      case 'small':
        return 'w-12 h-12 ring-2';
      case 'normal':
        return 'w-16 h-16 ring-2';
      case 'medium':
        return 'w-24 h-24 ring-4';
      case 'large':
        return 'w-32 h-32 ring-4';
      case 'huge':
        return 'w-40 h-40 ring-4';
      default:
        return 'w-16 h-16 ring-4';
    }
  }

  protected getIconClass(): string {
    switch (this.size()) {
      case 'mini':
        return 'text-[0.625rem]';
      case 'extra small':
        return 'text-xs';
      case 'small':
        return 'text-sm';
      case 'normal':
        return 'text-lg';
      case 'medium':
        return 'text-xl';
      case 'large':
        return 'text-2xl';
      case 'huge':
        return 'text-3xl';
      default:
        return 'text-lg';
    }
  }

  protected getTextSizeClass(): string {
    switch (this.size()) {
      case 'mini':
        return 'text-xs';
      case 'extra small':
        return 'text-xs';
      case 'small':
        return 'text-xs';
      case 'normal':
        return 'text-lg';
      case 'medium':
        return 'text-xl';
      case 'large':
        return 'text-2xl';
      case 'huge':
        return 'text-3xl';
      default:
        return 'text-base';
    }
  }

  protected avatarClicked(): void {
    if (!this.readonly()) {
      this.userInteraction.emit();
    }
  }
}
