import { Signal } from '@angular/core';
import { GroupRole } from '../../enums/group-role.enum';
import { Group } from '../group/group.model';
import { User } from '../user/user.model';

export class ProjectParticipant {
  public group: Signal<Group>;
  public id: string;
  public projectId: string;
  public role: GroupRole;
  public user: Signal<User>;

  public constructor(value: Partial<ProjectParticipant>) {
    Object.assign(this, value);
  }
}
