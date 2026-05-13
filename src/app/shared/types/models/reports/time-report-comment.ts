import { User } from '@app/shared/types/models/user/user.model';

export class TimeReportComment {
  public id: string | undefined;
  public comment: string | undefined;
  public createdBy: User | undefined;
  public createdOn: Date | undefined;

  public constructor(value: Partial<TimeReportComment>) {
    Object.assign(this, value);
  }
}
