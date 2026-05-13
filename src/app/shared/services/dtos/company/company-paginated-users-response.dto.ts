import { SortDirection } from '@app/shared/types/enums/sort-direction.enum';
import { UserDTO } from '../user/user.dto';

export interface CompanyPaginatedUsersResponse {
  page: number;
  limit: number;
  total: number;
  sortByField: string;
  direction: SortDirection;
  items: UserDTO[];
}
