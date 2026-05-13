import { UserDTO } from '../user/user.dto';
import { ProjectEstimationDTO } from './project-estimation.dto';
import { ProjectStatisticDTO } from './project-statistic.dto';

export interface ProjectDTO {
  id: string;
  name?: string;
  description?: string;
  avatarId?: string;
  companyId: string;
  startDate?: Date;
  endDate?: Date;
  address?: string;
  supervisor?: UserDTO;
  client?: UserDTO;
  supervisorId?: string;
  clientId?: string;
  estimation: ProjectEstimationDTO;
  statistic: ProjectStatisticDTO;
}
