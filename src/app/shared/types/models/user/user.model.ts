import { UserStatus } from '@app/shared/types/enums/user-status.enum';
import { IdBased } from '@app/shared/types/models/shared/id-based.model';
import { UserDTO } from '@app/shared/types/models/user/user-dto.model';

export class User implements IdBased {
  protected _firstNameLowerCase?: string;
  protected _lastNameLowerCase?: string;
  protected _fullnameLowerCase?: string;

  public id: string;
  public email?: string;
  public firstName?: string;
  public lastName?: string;
  public notes?: string;
  public profileCompletion: number;
  public status: UserStatus;
  public createdAt: Date;
  public lastActivityDate?: Date;
  public updatedAt?: Date;
  public activatedAt?: Date;
  public blockedAt?: Date;
  public address?: string;
  public phoneNumbers?: string;

  public constructor(user: UserDTO) {
    Object.assign(this, user);
    this._firstNameLowerCase = this.firstName?.toLowerCase();
    this._lastNameLowerCase = this.lastName?.toLowerCase();
    this._fullnameLowerCase = `${this._firstNameLowerCase} ${this._lastNameLowerCase}`;
  }

  public get fullName(): string {
    return this.firstName + ' ' + this.lastName;
  }

  public matchesSearch(searchQuery: string): boolean {
    if (!searchQuery) return true;

    const search = searchQuery.toLowerCase();

    return (
      this._firstNameLowerCase?.includes(search) ||
      this._lastNameLowerCase?.includes(search) ||
      this._fullnameLowerCase?.includes(search) ||
      false
    );
  }
}
