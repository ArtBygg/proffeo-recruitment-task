import { inject, Injectable, Injector } from '@angular/core';
import { WorkTimeReport } from '@app/shared/types/models/reports/work-time-report';
import { WorkTimeReportDTO } from '../../dtos/reports/work-time-report.dto';
import { UsersDataService } from '../../users-data.service';
import { AbstractFactory } from '../abstract.factory';
import { ReportMappers } from './report-mappers';

@Injectable({ providedIn: 'root' })
export class WorkTimeReportFactory extends AbstractFactory<WorkTimeReportDTO, WorkTimeReport> {
  private readonly injector: Injector = inject(Injector);
  private readonly usersService: UsersDataService = this.injector.get<UsersDataService>(UsersDataService);

  public produce(item: WorkTimeReportDTO): WorkTimeReport {
    if (!item) {
      return undefined;
    }
    if (item.user) {
      this.usersService.upsertLocalData(item.user);
    }
    if (item.createdBy) {
      this.usersService.upsertLocalData(item.createdBy);
    }

    return new WorkTimeReport({
      id: item.id,
      description: item.description,
      status: ReportMappers.mapStatus(item.status),
      date: new Date(item.date),
      duration: item.duration,
      dateFrom: item.dateFrom ? new Date(item.dateFrom) : undefined,
      dateTo: item.dateTo ? new Date(item.dateTo) : undefined,
      user: this.usersService.getById(item.user.id),
      reportType: 'WorkTime',
      createdBy: this.usersService.getById(item.createdBy.id),
      createdOn: new Date(item.createdOn),
      comments: item.comments,
      taskId: item.taskId,
      projectId: item.project?.id,
      locationId: item.locationId,
      // will be enriched in component
      task: undefined,
      location: undefined,
      project: undefined,
      hoursType: ReportMappers.mapHoursType(item.hoursType),
      standardHoursDuration: item.standardHoursDuration,
      bankHoursDuration: item.bankHoursDuration,
      overtime50HoursDuration: item.overtime50Duration,
      overtime100HoursDuration: item.overtime100Duration,
      diet: item.diet,
      privateKm: item.privateKm,
      expenses: item.expenses,
      otherExpenses: item.otherExpenses
    });
  }
}
