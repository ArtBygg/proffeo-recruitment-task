import { UserDTO } from '@app/shared/types/models/user/user-dto.model';
import { IndustryDTO } from '../company-industry/company-industry.dto';

export interface ProjectIndustryDTO {
  administrator: UserDTO;
  id: string;
  industry: IndustryDTO;
  projectId: string;
}
