import { SortDirection } from '@app/shared/types/enums/sort-direction.enum';

export interface PaginatedDataDTO<T> {
  page: number;
  limit: number;
  total: number;
  sortByField: string;
  direction: SortDirection;
  items: T[];
}
