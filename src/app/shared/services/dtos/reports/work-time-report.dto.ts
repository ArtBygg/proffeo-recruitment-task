import { LocationDTO } from '../location/location.dto';
import { ProjectTaskDTO } from '../project-tasks/project-task.dto';
import { ProjectDTO } from '../project/project.dto';
import { TimeReportDTO } from './time-report.dto';

export interface WorkTimeReportDTO extends TimeReportDTO {
  bankHoursDuration: string;
  diet?: number;
  expenses?: number;
  hoursType: string;
  locationId?: string;
  otherExpenses?: number;
  overtime50Duration: string;
  overtime100Duration: string;
  privateKm?: number;
  taskId: string;
  standardHoursDuration: string;
  location?: LocationDTO;
  project?: ProjectDTO;
  task?: ProjectTaskDTO;
}
