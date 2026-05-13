import { HoursType } from '@app/shared/types/enums/hours-type';
import { TimeReport } from '@app/shared/types/models/reports/time-report';
import { TaskEstimation } from '../task/task-estimation';
import { TaskType } from '../task/task-type.model';

interface WorkTimeReportTask {
  id?: string;
  name?: string;
  taskNumber?: string;
  taskType?: TaskType;
  estimation?: TaskEstimation;
}

interface WorkTimeReportLocation {
  id?: string;
  name?: string;
}

interface WorkTimeReportProject {
  id?: string;
  name?: string;
}

export class WorkTimeReport extends TimeReport {
  public taskId: string | undefined;
  public projectId: string | undefined;
  public locationId: string | undefined;
  public task?: WorkTimeReportTask;
  public location?: WorkTimeReportLocation;
  public project?: WorkTimeReportProject;
  public hoursType: HoursType | undefined;
  public standardHoursDuration: string | undefined;
  public bankHoursDuration: string | undefined;
  public overtime50HoursDuration: string | undefined;
  public overtime100HoursDuration: string | undefined;
  public diet: number | undefined;
  public privateKm: number | undefined;
  public expenses: number | undefined;
  public otherExpenses: number | undefined;

  public constructor(value: Partial<WorkTimeReport>) {
    super(value);
    Object.assign(this, value);
  }
}
