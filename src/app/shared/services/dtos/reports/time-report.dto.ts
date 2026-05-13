import { UserDTO } from '../user/user.dto';
import { ReportType } from './report-type';

export interface TimeReportDTO {
  comments: string | undefined;
  createdBy: UserDTO;
  createdOn: string;
  date: string;
  dateFrom: string;
  dateTo: string;
  description?: string;
  duration: string;
  id: string;
  status: string;
  user: UserDTO;
  type: ReportType;
}
