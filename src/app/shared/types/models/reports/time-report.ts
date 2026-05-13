import { Signal } from '@angular/core';
import { User } from '@app/shared/types/models/user/user.model';

export type TimeReportType = 'WorkTime' | 'Absence';

export enum TimeReportStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PROCESSED = 'PROCESSED'
}

export abstract class TimeReport {
  public id: string | undefined;
  public description: string | undefined;
  public status: TimeReportStatus | undefined;
  public date: Date | undefined;
  public duration: string | undefined;
  public dateFrom?: Date;
  public dateTo?: Date;
  public user: Signal<User> | undefined;
  public reportType: TimeReportType | undefined;
  public createdBy: Signal<User> | undefined;
  public createdOn: Date | undefined;
  public comments: string | undefined;

  public constructor(value: Partial<TimeReport>) {
    Object.assign(this, value);
  }
}
