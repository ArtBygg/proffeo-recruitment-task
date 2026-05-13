import { Signal } from '@angular/core';
import { Company } from '@app/shared/types/models/company/company.model';
import { AbsenceType } from '../../enums/absence-type';
import { TimeReport } from './time-report';

export class AbsenceReport extends TimeReport {
  public company: Signal<Company> | undefined;
  public absenceType: AbsenceType | undefined;

  public constructor(value: Partial<AbsenceReport>) {
    super(value);
    Object.assign(this, value);
  }
}
