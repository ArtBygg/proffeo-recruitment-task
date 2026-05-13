import { CompanyDTO } from '../company/company.dto';
import { TimeReportDTO } from './time-report.dto';

export interface AbsenceReportDTO extends TimeReportDTO {
  absenceType: string;
  companyId: string;
  company: CompanyDTO;
}
