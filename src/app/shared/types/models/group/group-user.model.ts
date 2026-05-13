import { Signal } from '@angular/core';
import { GroupRole } from '../../enums/group-role.enum';
import { User } from '../user/user.model';

export class GroupUser {
  public id: string;
  public groupId: string;
  public applicationUser: Signal<User>;
  public role: GroupRole;

  public constructor(entity: Partial<GroupUser>) {
    Object.assign(this, entity);
  }
}
