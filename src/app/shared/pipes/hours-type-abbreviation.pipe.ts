import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HoursType } from '../types/enums/hours-type';

@Pipe({
  name: 'hoursTypeAbbr',
  standalone: true
})
export class HoursTypeAbbreviationPipe implements PipeTransform {
  private readonly translateService = inject(TranslateService);

  public transform(value: HoursType | undefined): string {
    if (!value) {
      return '-';
    }

    const translationKey = `hours-type-abbr-${value}`;
    return this.translateService.instant(translationKey);
  }
}
