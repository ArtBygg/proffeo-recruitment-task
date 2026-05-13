import { User } from '@app/shared/types/models/user/user.model';
import { PageData } from '@app/store/page-data';

export interface CompanyUsersPageData extends PageData {
  content?: User[];
}
