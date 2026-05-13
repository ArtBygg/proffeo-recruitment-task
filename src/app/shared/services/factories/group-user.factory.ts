import { inject, Injectable, Injector } from '@angular/core';
import { GroupUser } from '@app/shared/types/models/group/group-user.model';
import { GroupUserDTO } from '../dtos/group/group-user.dto';
import { UsersDataService } from '../users-data.service';
import { AbstractFactory } from './abstract.factory';

@Injectable({ providedIn: 'root' })
export class GroupUserFactory extends AbstractFactory<GroupUserDTO, GroupUser> {
  private readonly injector: Injector = inject(Injector);
  private readonly usersService: UsersDataService = this.injector.get<UsersDataService>(UsersDataService);

  public constructor() {
    super();
  }

  public produce(item: GroupUserDTO): GroupUser {
    return item
      ? new GroupUser({
          id: item.id,
          groupId: item.groupId,
          applicationUser: this.usersService.upsertLocalData(item.applicationUser),
          role: item.role
        })
      : undefined;
  }
}
