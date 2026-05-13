import { Signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IdBased } from '@app/shared/types/models/shared/id-based.model';
import { UserRole } from '@app/shared/types/models/user-role/user.role';
import { User } from '@app/shared/types/models/user/user.model';
import { GroupUser } from './group-user.model';

//TODO - remove it form here !!!!
export interface CreateCompanyGroupForm {
  name: FormControl<string>;
}

export interface CreateCompanyGroupModalData {
  parentGroupId: string;
}

export interface EditCompanyGroupNameModalData {
  group: Group;
  id: string;
}

export interface SelectUsersToCompanyGroupModalData {
  preselectedUsers: User[];
  lockedUser: User;
  group: Group;
}

export interface SelectUsersAsProjectParticpantsModalData {
  preselectedUsers: User[];
  lockedUser: User;
  group: Group;
}

export interface SelectUsersRolesTModalData {
  preselectedRoles: UserRole[];
  userId: string;
}

export interface SelectAdminGroupModalData {
  preselectedUser: User;
  group: Group;
  id: string;
  isProjectParticipantsView: boolean;
}

export interface EditCompanyGroupNameForm {
  name: FormControl<string>;
  id: FormControl<string>;
}

export class Group implements IdBased {
  public childrenCount: number;
  public id: string;
  public name: string;
  public companyId: string;
  public parentGroupId?: string;
  public users: Signal<GroupUser[]>;

  public constructor(data: Partial<Group>) {
    Object.assign(this, data);
  }
}
