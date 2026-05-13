import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { CompanyDTO } from '@app/shared/services/dtos/company/company.dto';
import { Company } from '../types/models/company/company.model';
import { AppEvent } from '../types/models/notifications/app-event';
import { DataService } from './data-service';
import { CompanyFactory } from './factories/company.factory';

const MOCK_COMPANIES: CompanyDTO[] = [
  {
    id: '05d2152e-f6ab-466f-9339-b191d85e678a',
    name: 'KIELB ELEKTRO',
    description: 'KIELB ELEKTRO',
    directUserCompany: true
  },
  {
    id: '2b8cab41-ee72-4617-903c-f390ead12a36',
    name: 'Proffeo',
    description: '',
    directUserCompany: true
  },
  {
    id: 'b7594c91-5bdd-4dfa-b283-90e0bf40e56e',
    name: 'TRAUST',
    description: 'TRAUST',
    directUserCompany: true
  },
  {
    id: 'de7158fa-c22e-4d50-b169-68f411e6b323',
    name: 'Buskerud Blikk',
    description: '',
    directUserCompany: true
  },
  {
    id: 'ecd632c9-8cee-46e5-b6a6-fdb9af2f3dc7',
    name: 'ArtBygg',
    description: 'ArtBygg',
    directUserCompany: true
  }
];

@Injectable({ providedIn: 'root' })
export class CompaniesDataService extends DataService<CompanyDTO, Company> {
  private readonly companyFactory: CompanyFactory = inject(CompanyFactory);

  private readonly _companies: Signal<Company[]> = signal(
    MOCK_COMPANIES.map(dto => this.companyFactory.produce(dto))
  );

  public getUserCompanies(_userId: string): Signal<Company[]> {
    return this._companies;
  }

  public getById(companyId: string): Signal<Company | undefined> {
    return computed(() => this._companies().find(c => c.id === companyId));
  }

  public upsertLocalData(_dto: CompanyDTO): Signal<Company> {
    return signal(undefined);
  }

  public loadUserCompanies(_userId: string): void {}

  public getCompaniesForCooperation(): Signal<Company[]> {
    return this._companies;
  }

  public loadCompaniesForCooperation(_companyId: string): void {}

  protected override handleEvent(_event: AppEvent): void {}
}
