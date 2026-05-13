import { GroupRole } from '../../../types/enums/group-role.enum';
import { UserDTO } from '../user/user.dto';

export interface GroupUserDTO {
  id: string;
  groupId: string;
  applicationUser: UserDTO;
  role: GroupRole;
}
