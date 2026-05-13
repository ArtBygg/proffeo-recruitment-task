import { GroupUserDTO } from './group-user.dto';

export interface GroupDTO {
  id: string;
  name: string;
  companyId: string;
  parentGroupId?: string;
  hasChildren: boolean;
  children?: GroupDTO[];
  users?: GroupUserDTO[];
}
