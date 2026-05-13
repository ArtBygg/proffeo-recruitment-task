import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CompanyDTO } from '@app/shared/services/dtos/company/company.dto';

@Injectable({ providedIn: 'root' })
export class CompaniesHttpService {
  private readonly httpClient = inject(HttpClient);
  private readonly base = environment.APIEndPoint;

  getCompaniesForCooperation(companyId: string): Observable<CompanyDTO[]> {
    return this.httpClient.get<CompanyDTO[]>(`${this.base}companies/${companyId}/companies-for-cooperation`);
  }
}
