import { inject, Injectable } from '@angular/core';
import { HoursType } from '@app/shared/types/enums/hours-type';
import { DropdownItem } from '@app/shared/types/models/shared/dropdown-item';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class HoursTypeDictionaryService {
  private readonly translateService: TranslateService = inject(TranslateService);

  public getHoursTypeDictionary(): DropdownItem<string>[] {
    return [
      // {
      //   value: 'Auto',
      //   label: this.translateService.instant('time-report-hour-type-ordinary-auto')
      // },
      {
        value: 'OrdinaryHours' as HoursType,
        label: 'time-report-hour-type-ordinary-hours'
      },
      {
        value: 'BankPlus' as HoursType,
        label: 'time-report-hour-type-bank_plus'
      },
      {
        value: 'BankMinus' as HoursType,
        label: 'time-report-hour-type-bank_minus'
      },
      {
        value: 'Overtime50' as HoursType,
        label: 'time-report-hour-type-overtime_50'
      },
      {
        value: 'Overtime100' as HoursType,
        label: 'time-report-hour-type-overtime_100'
      }
    ];
  }
}
