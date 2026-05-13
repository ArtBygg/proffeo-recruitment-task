import { PermissionTypeEnum } from '@app/shared/types/enums/permission-context-type.enum';

export class UserRole {
  public id: string;
  public roleId: string;
  public userId: string;
  public contextId: string;
  public contextType: PermissionTypeEnum;

  public constructor(user: Partial<UserRole>) {
    Object.assign(this, user);
  }
}
