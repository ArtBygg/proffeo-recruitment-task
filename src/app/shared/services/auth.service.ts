import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { UserStatus } from '../types/enums/user-status.enum';
import { UserDTO } from '../types/models/user/user-dto.model';
import { User } from '../types/models/user/user.model';
import { UserFactory } from './factories/user.factory';

const MOCK_USER: UserDTO = {
  id: 'a3c758b4-c500-4e67-847b-c9b7f0408006',
  email: 'test@user.com',
  firstName: 'test',
  lastName: 'user',
  status: UserStatus.ACTIVE,
  profileCompletion: 100,
  createdAt: new Date()
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly userFactory: UserFactory = inject(UserFactory);

  private _currentUser: WritableSignal<User> = signal(this.userFactory.produce(MOCK_USER));

  public isAuthenticated: Signal<boolean> = computed(() => true);
  public currentUser: Signal<User> = this._currentUser.asReadonly();
}
