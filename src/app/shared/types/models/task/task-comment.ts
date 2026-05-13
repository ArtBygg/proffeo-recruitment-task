import { Signal } from '@angular/core';
import { FileInfo } from '../files/file-info';
import { User } from '../user/user.model';

export class TaskComment {
  public id: string | undefined;
  public description: string | undefined;
  public createdAt: Date | undefined;
  public createdBy: Signal<User>;
  public attachments: Array<FileInfo> | undefined;

  public constructor(value: Partial<TaskComment>) {
    Object.assign(this, value);
  }
}
