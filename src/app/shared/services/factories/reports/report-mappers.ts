import { AbsenceType } from '@app/shared/types/enums/absence-type';
import { HoursType } from '@app/shared/types/enums/hours-type';
import { TimeReportStatus } from '@app/shared/types/models/reports/time-report';

export class ReportMappers {
  public static mapAbsenceType(report: string): AbsenceType {
    if (!report) {
      return undefined;
    }

    switch (report.toLowerCase()) {
      case 'holiday':
        return 'Holiday';
      case 'vacation':
        return 'Vacation';
      case 'hoursbankminus':
        return 'HoursBankMinus';
      case 'overtimeminus':
        return 'OvertimeMinus';
      case 'publicholiday':
        return 'PublicHoliday';
      case 'sickleavechild':
        return 'SickLeaveChild';
      case 'sickleave':
        return 'SickLeave';
      case 'other':
        return 'Other';
      default:
        throw Error(`Unrecognized AbsenceType: ${report}`);
      case 'overtime100minus':
        return 'Overtime100Minus';
      case 'overtime50minus':
        return 'Overtime50Minus';
      case 'publicholidaywithsalary':
        return 'PublicHolidayWithSalary';
      case 'sickleavenoticeday':
        return 'SickLeaveNoticeDay';
    }
  }

  public static mapStatus(value: string): TimeReportStatus | undefined {
    if (!value) {
      return undefined;
    }

    switch (value.toLowerCase()) {
      case 'pending':
        return TimeReportStatus.PENDING;
      case 'approved':
        return TimeReportStatus.APPROVED;
      case 'processed':
        return TimeReportStatus.PROCESSED;
      default:
        throw Error('Unrecognized TimeReportStatus');
    }
  }

  public static mapHoursType(value: string): HoursType | undefined {
    if (!value) {
      return undefined;
    }

    switch (value.toLowerCase()) {
      case 'auto':
        return 'Auto';
      case 'ordinaryhours':
        return 'OrdinaryHours';
      case 'bankplus':
        return 'BankPlus';
      case 'bankminus':
        return 'BankMinus';
      case 'overtime50':
        return 'Overtime50';
      case 'overtime100':
        return 'Overtime100';
      default:
        throw Error('Unrecognized Hour type');
    }
  }
}
