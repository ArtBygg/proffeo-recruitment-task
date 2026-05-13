import { inject, Injectable, Injector, signal } from '@angular/core';
import { Group } from '@app/shared/types/models/group/group.model';
import { GroupDTO } from '../dtos/group/group.dto';
import { AbstractFactory } from './abstract.factory';
import { GroupUserFactory } from './group-user.factory';

@Injectable({ providedIn: 'root' })
export class GroupFactory extends AbstractFactory<GroupDTO, Group> {
  private readonly injector: Injector = inject(Injector);
  private readonly groupUserFactory: GroupUserFactory = this.injector.get<GroupUserFactory>(GroupUserFactory);

  public constructor() {
    super();
  }

  public produce(item: GroupDTO): Group {
    if (!item) {
      return undefined;
    }

    const groupUsersDTO = item.users ?? [];
    const groupUsers = groupUsersDTO.map(u => this.groupUserFactory.produce(u));

    return new Group({
      childrenCount: item.children?.length ?? 0,
      id: item.id,
      name: item.name,
      companyId: item.companyId,
      parentGroupId: item.parentGroupId,
      users: signal(groupUsers)
    });
  }
}
