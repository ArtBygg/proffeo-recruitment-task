import { Injectable } from '@angular/core';
import { CompanyDTO } from '@app/shared/services/dtos/company/company.dto';
import { Company } from '@app/shared/types/models/company/company.model';
import { AbstractFactory } from './abstract.factory';

@Injectable({ providedIn: 'root' })
export class CompanyFactory extends AbstractFactory<CompanyDTO, Company> {
  public produce(item: CompanyDTO): Company {
    return item
      ? new Company({
          id: item.id,
          name: item.name,
          description: item.description,
          directUserCompany: item.directUserCompany
        })
      : undefined;
  }
}
