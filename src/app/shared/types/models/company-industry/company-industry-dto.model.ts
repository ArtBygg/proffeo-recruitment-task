import { IndustryDTO } from '@app/shared/services/dtos/company-industry/company-industry.dto';
import { SortDirection } from '@app/shared/types/enums/sort-direction.enum';

export interface UpdateCompanyIndustryRequestBody {
  id: string;
  name: string;
}

export interface CreateCompanyIndustryRequestBody {
  name: string;
}

export interface CompanyIndustryEditModalData {
  companyIndustryToEdit: IndustryDTO;
}

export interface CreateCompanyIndustryModalData {
  companyIndustryToEdit: IndustryDTO;
}

export interface CompanyPaginatedCompanyIndustriesResponse {
  page: number;
  limit: number;
  total: number;
  sortByField: string;
  direction: SortDirection;
  items: IndustryDTO[];
}

export interface CompanyPaginatedCompanyIndustriesRequest {
  search?: string;
  page: number;
  limit: number;
  sort: string;
  order: SortDirection;
}
