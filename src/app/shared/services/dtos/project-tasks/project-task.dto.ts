import { TaskEstimationDTO } from './project-task-estimation.dto';
import { TaskStatisticsDTO } from './project-task-statistics.dto';
import { TaskTypeDTO } from './project-task-type.dt';

export interface ProjectTaskDTO {
  avatarId: string;
  createdAt: string;
  createdById: string;
  deletedBy: string;
  deletedAt: string;
  description: string;
  descriptionUpdatedById: string;
  descriptionUpdatedOn: string;
  estimation: TaskEstimationDTO;
  startDate: string;
  endDate: string;
  groupId: string;
  id: string;
  industryId: string;
  isLocked: boolean;
  lastActivityAt: string;
  lastActivityById: string;
  locationId: string;
  name: string;
  parentTaskId: string;
  percentageOfProgress: number;
  projectId: string;
  priority: string;
  statistics: TaskStatisticsDTO;
  status: string;
  subtasksCount: number;
  taskNumber: string;
  taskTotalTrackedSeconds: number;
  taskTypeId: string;
  timeReportWithLocation: boolean;
  taskType: TaskTypeDTO;
  acceptanceRequested: boolean;
  projectTaskDescriptionStatus: string;
}
