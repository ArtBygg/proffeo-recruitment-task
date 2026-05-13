import { UserStatus } from '@app/shared/types/enums/user-status.enum';

export interface CreateUserRequestBody {
  email: string;
  firstName: string;
  lastName: string;
  notes?: string;
  phoneNumbers?: string;
  address?: string;
}

export interface UpdateUserDetailsRequestBody {
  firstName: string;
  lastName: string;
  notes?: string;
  address?: string;
  phoneNumbers?: string;
}

export interface UserDTO {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  notes?: string;
  profileCompletion: number;
  status: UserStatus;
  createdAt: Date;
  lastActivityDate?: Date;
  updatedAt?: Date;
  activatedAt?: Date;
  blockedAt?: Date;
  address?: string;
  phoneNumbers?: string;
}
