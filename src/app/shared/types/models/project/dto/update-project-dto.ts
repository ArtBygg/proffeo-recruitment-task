import { ProjectEstimation } from '@app/shared/types/models/project/project-estimation';

export interface UpdateProjectDTO {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  address: string;
  supervisorId: string;
  clientId?: string;
  estimation: ProjectEstimation;
  avatarId: string;
}
