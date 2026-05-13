import { Injectable } from '@angular/core';
import { IndustryDTO } from '@app/shared/services/dtos/company-industry/company-industry.dto';
import { Industry } from '@app/shared/types/models/industry/industry.model';
import { AbstractFactory } from './abstract.factory';

@Injectable({ providedIn: 'root' })
export class CompanyIndustryFactory extends AbstractFactory<IndustryDTO, Industry> {
  public produce(item: IndustryDTO): Industry {
    return item
      ? new Industry({
          id: item.id,
          name: item.name
        })
      : undefined;
  }
}
