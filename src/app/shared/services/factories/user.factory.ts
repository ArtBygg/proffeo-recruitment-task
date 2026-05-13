import { Injectable } from '@angular/core';
import { UserDTO } from '@app/shared/types/models/user/user-dto.model';
import { User } from '@app/shared/types/models/user/user.model';
import { AbstractFactory } from './abstract.factory';

@Injectable({ providedIn: 'root' })
export class UserFactory extends AbstractFactory<UserDTO, User> {
  public produce(item: UserDTO): User {
    return item
      ? new User({
          id: item.id,
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email,
          status: item.status!,
          createdAt: new Date(item.createdAt!),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
          activatedAt: item.activatedAt ? new Date(item.activatedAt) : undefined,
          lastActivityDate: item.lastActivityDate ? new Date(item.lastActivityDate) : undefined,
          profileCompletion: item.profileCompletion,
          blockedAt: item.blockedAt ? new Date(item.blockedAt) : undefined,
          notes: item.notes,
          address: item.address,
          phoneNumbers: item.phoneNumbers
        })
      : undefined;
  }
  //
}
