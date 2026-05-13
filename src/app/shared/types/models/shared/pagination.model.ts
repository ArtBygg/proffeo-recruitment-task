import { SortDirection } from '@app/shared/types/enums/sort-direction.enum';

export interface Pagination {
  page: number;
  limit: number;
  sortByField: string;
  direction: SortDirection;
  search?: string;
}

export interface PaginationResponse<T> {
  page: number;
  limit: number;
  total: number;
  sortByField: string;
  direction: SortDirection;
  items: T[];
}
