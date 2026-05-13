import { CompanyUsersPageParams } from '@app/shared/types/models/page-params';

export interface IndustryDTO {
  id: string;
  name: string;
}

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
  pageParams: CompanyUsersPageParams;
}
