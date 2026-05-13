import { IndustryDTO } from './company-industry/company-industry.dto';
import { CompanyDTO } from './company/company.dto';
import { GroupUserDTO } from './group/group-user.dto';
import { GroupDTO } from './group/group.dto';
import { LocationDTO } from './location/location.dto';
import { ProjectIndustryDTO } from './project-industry/project-industry.dto';
import { ProjectParticipantDTO } from './project-participants/project-participant.dto';
import { TaskParticipantDTO } from './project-tasks/project-task-participant.dto';
import { TaskTypeDTO } from './project-tasks/project-task-type.dt';
import { ProjectTaskDTO } from './project-tasks/project-task.dto';
import { ProjectDTO } from './project/project.dto';
import { UserDTO } from './user/user.dto';

export interface ContextDataDTO {
  companies: CompanyDTO[];
  groups: GroupDTO[];
  groupUsers: GroupUserDTO[];
  industries: IndustryDTO[];
  locations: LocationDTO[];
  projects: ProjectDTO[];
  projectIndustries: ProjectIndustryDTO[];
  projectParticipants: ProjectParticipantDTO[];
  projectTaskParticipants: TaskParticipantDTO[];
  tasks: ProjectTaskDTO[];
  taskTypes: TaskTypeDTO[];
  users: UserDTO[];
}
