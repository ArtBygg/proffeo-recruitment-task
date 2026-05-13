import { TaskRole } from '@app/shared/types/enums/task-role.enum';
import { ProjectParticipantDTO } from '../project-participants/project-participant.dto';

export interface TaskParticipantDTO {
  id: string;
  taskId: string;
  projectParticipant: ProjectParticipantDTO;
  role: TaskRole;
}
