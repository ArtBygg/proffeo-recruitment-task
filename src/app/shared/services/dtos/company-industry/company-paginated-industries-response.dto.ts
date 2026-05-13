import { SortDirection } from '@app/shared/types/enums/sort-direction.enum';
import { IndustryDTO } from './company-industry.dto';

export interface CompanyPaginatedUsersResponseDTO {
  page: number;
  limit: number;
  total: number;
  sortByField: string;
  direction: SortDirection;
  items: IndustryDTO[];
}
