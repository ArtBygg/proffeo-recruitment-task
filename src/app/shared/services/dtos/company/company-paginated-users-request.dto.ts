import { SortDirection } from '@app/shared/types/enums/sort-direction.enum';

export interface CompanyPaginatedUsersRequest {
  search?: string;
  page: number;
  limit: number;
  sort: string;
  order: SortDirection;
}
