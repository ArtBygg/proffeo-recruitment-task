import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { DataService } from '@app/shared/services/data-service';
import { IndustryDTO } from '@app/shared/services/dtos/company-industry/company-industry.dto';
import { CompanyIndustriesPageData } from '@app/shared/types/models/company-industries-page-data';
import { Industry } from '@app/shared/types/models/industry/industry.model';
import { AppEvent } from '@app/shared/types/models/notifications/app-event';
import { CompanyUsersPageParams } from '@app/shared/types/models/page-params';
import { CompanyIndustryFactory } from './factories/company-industry-factory.service';

const MOCK_INDUSTRIES: IndustryDTO[] = [
  { id: '2b1c9e78-0be0-4805-b8d8-11c20d1dc138', name: 'VVS ' },
  { id: '1d812b1f-3c86-42d7-a1fc-b91ef0265d57', name: 'Ventilasjon' },
  { id: '6311d239-a99d-4441-bed1-1bb45dc26697', name: 'UI/UX' },
  { id: '5329e9d5-f14c-4e7c-912c-f0db3a00cc33', name: 'Tømrer' },
  { id: '10d5b187-697b-41f3-8023-618718ef526a', name: 'Test 1ABC' },
  { id: '6235a3b9-a028-41d2-a13d-c7d82b2dcb33', name: 'Taktekker' },
  { id: '134e774f-de0d-46dc-857a-60b676760b3b', name: 'Snekker' },
  { id: '161df5bd-7eb5-49da-8a65-3afa87c34e2c', name: 'Sandvich' },
  { id: '48f4336f-7362-42b6-ae0b-be874d831b48', name: 'Mur&Pus' },
  { id: '4262ed9d-049e-4a35-9ed4-6647ec7343c0', name: 'Montasje' },
  { id: '5edf1d5b-4289-4d80-8ac5-d24c4c531b7b', name: 'Maler' },
  { id: '993893cf-d7de-441f-86c2-7c9f55d88471', name: 'Industry testowe' },
  { id: '05d757a5-9ec2-441e-ab44-c060eec1936b', name: 'HOVED / MAIN' },
  { id: 'bce11331-1db5-4c56-bf03-3e95c01c3b9f', name: 'HMS / BHP' },
  { id: '16a64044-7db1-4343-b11c-a2756fc644c7', name: 'Gulvsliper' },
  { id: '2609644c-fa01-4352-a06a-aceec36dd860', name: 'Flislegger' },
  { id: 'deb3789e-f3cc-4dca-99cb-32a72ab8a683', name: 'FE' },
  { id: '611d5e43-a541-4ff3-bbfe-765af63f87ee', name: 'Elektro' },
  { id: '235c17ba-ca22-47ae-825f-7e21af0fbb6f', name: 'Blikkenslager' },
  { id: '4b9eb51a-6471-4894-84d1-d92512520cf6', name: 'BE' },
  { id: '5a1b90ae-59d6-4efe-8b36-ad3e3f6cd6a0', name: 'Administration' },
  { id: '572b7758-837b-4bbd-92f7-cd5e431d9e01', name: '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' }
];

@Injectable({ providedIn: 'root' })
export class CompanyIndustriesDataService extends DataService<IndustryDTO, Industry> {
  private readonly companyIndustryFactory: CompanyIndustryFactory = inject(CompanyIndustryFactory);

  private readonly _industries: Signal<Industry[]> = signal(
    MOCK_INDUSTRIES.map(dto => this.companyIndustryFactory.produce(dto))
  );

  public getCompanyIndustries(_companyId: string): Signal<Industry[]> {
    return this._industries;
  }

  public getCompanyIndustriesPageList(
    pageParams: CompanyUsersPageParams
  ): Signal<CompanyIndustriesPageData | undefined> {
    if (!pageParams?.companyId) {
      return signal(undefined);
    }

    return computed(() => {
      const all = this._industries();
      const search = pageParams.search?.toLowerCase() ?? '';
      const filtered = search ? all.filter(i => i.name?.toLowerCase().includes(search)) : all;
      const page = pageParams.page ?? 0;
      const limit = pageParams.limit ?? filtered.length;
      const start = page * limit;
      return {
        total: filtered.length,
        id: pageParams.companyId,
        page,
        limit,
        ids: filtered.slice(start, start + limit).map(i => i.id),
        content: filtered.slice(start, start + limit)
      };
    });
  }

  public getById(industryId: string): Signal<Industry | undefined> {
    return computed(() => this._industries().find(i => i.id === industryId));
  }

  public loadCompanyIndustries(_companyId: string): void {}

  public loadCompanyIndustriesPages(_pageParams: CompanyUsersPageParams): void {}

  public deleteCompanyIndustry(_pageParams: CompanyUsersPageParams, _industry: Industry): void {}

  public addCompanyIndustry(_pageParams: CompanyUsersPageParams, _request: { name: string }): void {}

  public updateCompanyIndustry(_industryId: string, _request: { id: string; name: string }): void {}

  public upsertLocalData(_dto: IndustryDTO): Signal<Industry> {
    return signal(undefined);
  }

  protected override handleEvent(_event: AppEvent): void {}
}
