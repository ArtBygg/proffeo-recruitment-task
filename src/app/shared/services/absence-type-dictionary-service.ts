import { inject, Injectable } from '@angular/core';
import { AbsenceType } from '@app/shared/types/enums/absence-type';
import { DropdownItem } from '@app/shared/types/models/shared/dropdown-item';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AbsenceTypeDictionaryService {
  private readonly translateService: TranslateService = inject(TranslateService);

  public getAbsenceTypeDictionary(): DropdownItem<string>[] {
    return [
      {
        value: 'Holiday' as AbsenceType,
        label: this.translateService.instant('time-report-absence-type-holiday')
      },
      {
        value: 'HoursBankMinus' as AbsenceType,
        label: this.translateService.instant('time-report-absence-type-hour_bank_minus')
      },
      {
        value: 'Overtime100Minus' as AbsenceType,
        label: this.translateService.instant('time-report-absence-type-overtime_100_minus')
      },
      {
        value: 'Overtime50Minus' as AbsenceType,
        label: this.translateService.instant('time-report-absence-type-overtime_50_minus')
      },
      {
        value: 'PublicHoliday' as AbsenceType,
        label: this.translateService.instant('time-report-absence-type-public_holiday')
      },
      {
        value: 'PublicHolidayWithSalary' as AbsenceType,
        label: this.translateService.instant('time-report-absence-type-public_holiday_with_salary')
      },
      {
        value: 'SickLeaveChild' as AbsenceType,
        label: this.translateService.instant('time-report-absence-type-sick_leave_child')
      },
      {
        value: 'SickLeaveNoticeDay' as AbsenceType,
        label: this.translateService.instant('time-report-absence-type-sick_leave_notice_day')
      },
      {
        value: 'SickLeave' as AbsenceType,
        label: this.translateService.instant('time-report-absence-type-sick_leave')
      }
    ];
  }
}
