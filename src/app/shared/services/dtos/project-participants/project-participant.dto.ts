import { GroupDTO } from '@app/shared/services/dtos/group/group.dto';
import { GroupRole } from '@app/shared/types/enums/group-role.enum';
import { UserDTO } from '@app/shared/types/models/user/user-dto.model';

export interface ProjectParticipantDTO {
  id: string;
  projectId: string;
  group: GroupDTO;
  user: UserDTO;
  role: GroupRole;
}
