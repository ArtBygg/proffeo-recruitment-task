import { Industry } from '@app/shared/types/models/industry/industry.model';
import { PageData } from '@app/store/page-data';

export interface CompanyIndustriesPageData extends PageData {
  content?: Industry[];
}
