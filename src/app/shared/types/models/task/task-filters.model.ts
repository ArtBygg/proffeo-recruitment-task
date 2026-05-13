import { ProjectTaskUserRole } from '../../enums/project-task-user-role.enum';
import { TaskPriority } from '../../enums/task-priority.enum';
import { TaskStatus } from '../../enums/task-status.enum';

export interface TaskFilters {
  text?: string;
  taskStatus?: TaskStatus[];
  taskPriority?: TaskPriority[];
  group?: string[];
  noGroup?: boolean;
  user?: string[];
  noUsers?: boolean;
  location?: string[];
  noLocation?: boolean;
  industry?: string[];
  noIndustry?: boolean;
  userRole?: TaskUserRoleFilter[];
  createdBy?: string[];
  projectTagIds?: string[];
  taskTypeIds?: string[];
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
  createdDateFrom?: Date;
  createdDateTo?: Date;
  editDateFrom?: Date;
  editDateTo?: Date;
}

export interface TaskUserRoleFilter {
  applicationUserId?: string;
  role: ProjectTaskUserRole;
}
