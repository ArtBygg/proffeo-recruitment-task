import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  InputSignal,
  OutputEmitterRef,
  Signal,
  computed,
  input,
  output
} from '@angular/core';
import {
  AvatarBorderType,
  AvatarComponent
} from '@app/shared/components/group-avatars/avatar/proffeo-avatar.component';
import { AvatarsGroupComponent } from '@app/shared/components/group-avatars/proffeo-group-avatars.component';
import { AvatarSize } from '@app/shared/types/enums/avatar-size.enum';
import { GroupRole } from '@app/shared/types/enums/group-role.enum';
import { ProjectIndustry } from '@app/shared/types/models/project-industry/project-industry.model';
import { ProjectParticipant } from '@app/shared/types/models/project/project-participant';
import { User } from '@app/shared/types/models/user/user.model';

@Component({
  selector: 'proffeo-task-user-assignees',
  templateUrl: './task-user-assignees.component.html',
  imports: [AvatarsGroupComponent, AvatarComponent, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskUserAssigneesComponent {
  protected readonly avatarBorderType: typeof AvatarBorderType = AvatarBorderType;
  protected readonly taskNotAdminUsers: Signal<User[]> = computed(() => {
    const participants = this.taskUsers();
    const industryAdminId = this.projectIndustry()?.administrator()?.id;
    const notAdminUsers = participants
      ?.filter?.(p => p.role !== GroupRole.ADMIN && p.user().id !== industryAdminId)
      .map(p => p.user());

    return notAdminUsers;
  });

  public readonly changeIndustry: OutputEmitterRef<void> = output<void>();
  public readonly changeGroup: OutputEmitterRef<void> = output<void>();
  public readonly changeUsers: OutputEmitterRef<void> = output<void>();
  public readonly projectIndustry: InputSignal<ProjectIndustry> = input<ProjectIndustry>(undefined);
  public readonly projectGroupAdmin: InputSignal<ProjectParticipant> = input<ProjectParticipant>(undefined);
  public readonly isReadonly: InputSignal<boolean> = input<boolean>(false);
  public readonly avatarsLimit: InputSignal<number> = input<number>(3);
  public readonly showGroupAdmin: InputSignal<boolean> = input<boolean>(true);
  public readonly showIndustryAdmin: InputSignal<boolean> = input<boolean>(true);
  public readonly avatarsOverlapping: InputSignal<boolean> = input<boolean>(false);
  public readonly showNumberOnly: InputSignal<boolean> = input<boolean>(false);
  public readonly avatarSize: InputSignal<AvatarSize> = input<AvatarSize>(AvatarSize.EXTRA_SMALL);
  public readonly taskUsers: InputSignal<ProjectParticipant[]> = input<ProjectParticipant[]>([]);

  protected onIndustryClick(): void {
    if (!this.isReadonly()) {
      this.changeIndustry.emit();
    }
  }

  protected onGroupAdminClick(): void {
    if (!this.isReadonly()) {
      this.changeGroup.emit();
    }
  }

  protected onUserClick(): void {
    if (!this.isReadonly()) {
      this.changeUsers.emit();
    }
  }
}
