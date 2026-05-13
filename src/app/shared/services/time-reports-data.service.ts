import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { DataStore } from '@app/store/data-store';
import { IdsCollection } from '@app/store/ids-collection';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { forEach } from 'lodash';
import { forkJoin, Observable, tap } from 'rxjs';
import { TimeReport, TimeReportStatus } from '../types/models/reports/time-report';
import { WorkTimeReport } from '../types/models/reports/work-time-report';
import { CompaniesDataService } from './companies-data.service';
import { CompanyIndustriesDataService } from './company-industries-data.service';
import { DataService } from './data-service';
import { ContextDataDTO } from './dtos/context-data.dto';
import { ModelWithContextData } from './dtos/dto-with-context-data.dto';
import { TimeReportDTO } from './dtos/reports/time-report.dto';
import { TimeReportFactory } from './factories/reports/time-report.factory';
import { GroupsDataService } from './groups-data.service';
import { LocationsDataService } from './locations-data.service';
import { ProjectIndustriesDataService } from './project-industries-data.service';
import { ProjectParticipantsDataService } from './project-participants-data.service';
import { ProjectsDataService } from './projects-data.service';
import { ToastService } from './shared/toast.service';
import { TaskParticipantsDataService } from './task-participants-data.service';
import { TaskTypesDataService } from './task-types-data.service';
import { TasksDataService } from './tasks-data.service';
import { UsersDataService } from './users-data.service';

@Injectable({ providedIn: 'root' })
export class TimeReportsDataService extends DataService<TimeReportDTO, TimeReport> {
  private readonly timeReports: DataStore<TimeReport> = new DataStore<TimeReport>();
  private readonly userTimeReports: DataStore<IdsCollection> = new DataStore<IdsCollection>();
  private readonly taskTimeReports: DataStore<IdsCollection> = new DataStore<IdsCollection>();

  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly timeReportFactory: TimeReportFactory = inject(TimeReportFactory);
  private readonly companiesService: CompaniesDataService = inject(CompaniesDataService);
  private readonly groupsService: GroupsDataService = inject(GroupsDataService);
  private readonly industriesService: CompanyIndustriesDataService = inject(CompanyIndustriesDataService);
  private readonly locationsService: LocationsDataService = inject(LocationsDataService);
  private readonly projectsService: ProjectsDataService = inject(ProjectsDataService);
  private readonly projectIndustriesService: ProjectIndustriesDataService = inject(ProjectIndustriesDataService);
  private readonly projectParticipantsService: ProjectParticipantsDataService = inject(ProjectParticipantsDataService);
  private readonly taskTypesService: TaskTypesDataService = inject(TaskTypesDataService);
  private readonly tasksService: TasksDataService = inject(TasksDataService);
  private readonly usersService: UsersDataService = inject(UsersDataService);
  private readonly taskParticipantsService: TaskParticipantsDataService = inject(TaskParticipantsDataService);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly translateService: TranslateService = inject(TranslateService);

  public getTimeReports(dateFrom: Date, dateTo: Date): Signal<TimeReport[] | undefined> {
    return computed(
      () =>
        this.userTimeReports
          .get(this.getCollectionKey(dateFrom, dateTo))()
          ?.ids?.map(id => this.timeReports.get(id)())
          .filter(report => report !== undefined) || []
    );
  }

  public getById(timeReportId: string): Signal<TimeReport | undefined> {
    return computed(() => this.timeReports.get(timeReportId)());
  }

  public getTaskTimeReports(taskId: string, dateFrom: Date, dateTo: Date): Signal<TimeReport[] | undefined> {
    return computed(
      () =>
        this.taskTimeReports
          .get(this.getTaskCollectionKey(taskId, dateFrom, dateTo))()
          ?.ids?.map(id => this.timeReports.get(id)())
          .filter(report => report !== undefined) || []
    );
  }

  public loadTaskTimeReports(taskId: string, dateFrom: Date, dateTo: Date): void {
    const key = this.getTaskCollectionKey(taskId, dateFrom, dateTo);
    if (this.taskTimeReports.hasDataForId(key)) {
      return;
    }
    this.fetchTaskTimeReports(taskId, dateFrom, dateTo);
  }

  private getTaskCollectionKey(taskId: string, dateFrom: Date, dateTo: Date): string {
    return `${taskId}-${this.getCollectionKey(dateFrom, dateTo)}`;
  }

  public loadTimeReports(dateFrom: Date, dateTo: Date): void {
    if (this.timeReports.hasDataForId(this.getCollectionKey(dateFrom, dateTo))) {
      return;
    }
    this.fetchTimeReports(dateFrom, dateTo);
  }

  public upsertLocalData(dto: TimeReportDTO): Signal<TimeReport> {
    return dto ? this.timeReports.upsert(this.timeReportFactory.produce(dto)) : signal(undefined);
  }

  protected getCollectionKey = (dateFrom: Date, dateTo: Date): string =>
    `${dateFrom.getFullYear()}-${dateFrom.getMonth()}-${dateFrom.getDate()}-${dateTo.getFullYear()}-${dateTo.getMonth()}-${dateTo.getDate()}`;

  protected fetchTimeReports(dateFrom: Date, dateTo: Date): void {
    const params = {
      dateFrom: this.toStartOfDayUTC(dateFrom),
      dateTo: this.toEndOfDayUTC(dateTo)
    };

    this.httpClient
      .get<ModelWithContextData<TimeReportDTO[]>>(`${environment.APIEndPoint}time-reports`, { params })
      .subscribe({
        next: (data: ModelWithContextData<TimeReportDTO[]>) => {
          this.uploadContextDataItems(data.contextData);

          if (data && data.data?.length) {
            data.data.forEach(r => {
              this.upsertLocalData(r);
            });
          }

          this.userTimeReports.upsert({
            id: this.getCollectionKey(dateFrom, dateTo),
            ids: data.data?.map(_ => _.id)
          });
        }
      });
  }

  protected fetchTaskTimeReports(taskId: string, dateFrom: Date, dateTo: Date): void {
    const params = {
      dateFrom: this.toStartOfDayUTC(dateFrom),
      dateTo: this.toEndOfDayUTC(dateTo)
    };

    this.httpClient
      .get<TimeReportDTO[]>(`${environment.APIEndPoint}tasks/${taskId}/work-time-reports`, {
        params
      })
      .subscribe({
        next: (data: TimeReportDTO[]) => {
          if (data?.length) {
            forEach(data, r => {
              this.upsertLocalData(r);
            });
          }

          this.taskTimeReports.upsert({
            id: this.getTaskCollectionKey(taskId, dateFrom, dateTo),
            ids: data?.map(_ => _.id) || []
          });
        }
      });
  }

  private uploadContextDataItems(contextData: ContextDataDTO): void {
    if (!contextData) {
      return;
    }

    contextData.companies?.forEach(dto => this.companiesService.upsertLocalData(dto));
    contextData.groups?.forEach(dto => this.groupsService.upsertLocalData(dto));
    contextData.industries?.forEach(dto => this.industriesService.upsertLocalData(dto));
    contextData.locations?.forEach(dto => this.locationsService.upsertLocalData(dto));
    contextData.projects?.forEach(dto => this.projectsService.upsertLocalData(dto));
    contextData.projectIndustries?.forEach(dto => this.projectIndustriesService.upsertLocalData(dto));
    contextData.projectParticipants?.forEach(dto => this.projectParticipantsService.upsertLocalData(dto));
    contextData.taskTypes?.forEach(dto => this.taskTypesService.upsertLocalData(dto));
    contextData.users?.forEach(dto => this.usersService.upsertLocalData(dto));
    contextData.tasks?.forEach(dto => this.tasksService.upsertLocalData(dto));

    contextData.projectTaskParticipants?.forEach(dto => {
      this.taskParticipantsService.upsertLocalData(dto);
      this.taskParticipantsService.upsertLocalDataTaskParticipants(dto);
    });
  }

  private toStartOfDayUTC(date: Date): string {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).toISOString();
  }

  private toEndOfDayUTC(date: Date): string {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).toISOString();
  }

  public addWorkTimeReport(
    taskId: string,
    workTimeReport: WorkTimeReport,
    files?: File[],
    descriptions?: string[],
    tags?: string[][]
  ): Observable<[TimeReportDTO]> {
    const form = new FormData();

    files?.forEach((file, i) => {
      form.append(`files[${i}].File`, file, file.name);
      if (descriptions?.[i]) form.append(`files[${i}].Description`, descriptions[i]);
      if (tags?.[i]?.length) form.append(`files[${i}].Tags`, tags[i].join(';'));
    });

    form.append('model', JSON.stringify(workTimeReport));

    return this.httpClient
      .post<[TimeReportDTO]>(`${environment.APIEndPoint}tasks/${taskId}/work-time-reports`, form)
      .pipe(
        tap((dto: [TimeReportDTO]) => {
          dto.forEach(timeReport => {
            this.upsertLocalData(timeReport);
            const dtoDateFrom = new Date(timeReport.dateFrom);
            const dtoDateTo = new Date(timeReport.dateTo);

            const collectionKey = this.getCollectionKey(dtoDateFrom, dtoDateTo);
            const existingIds = this.userTimeReports.get(collectionKey)()?.ids ?? [];

            const taskCollectionKey = this.getTaskCollectionKey(taskId, dtoDateFrom, dtoDateTo);
            const taskExistingIds = this.taskTimeReports.get(taskCollectionKey)()?.ids ?? [];

            if (!existingIds.includes(timeReport.id)) {
              this.userTimeReports.upsert({
                id: collectionKey,
                ids: [...existingIds, timeReport.id]
              });
            }

            if (!taskExistingIds.includes(timeReport.id)) {
              this.taskTimeReports.upsert({
                id: taskCollectionKey,
                ids: [...taskExistingIds, timeReport.id]
              });
            }
          });
          this.toastService.success(this.translateService.instant('time-reports.toasts.successfully-created'));
        })
      );
  }

  public updateWorkTimeReport(
    workTimeReport: WorkTimeReport,
    files?: File[],
    descriptions?: string[],
    tags?: string[][]
  ): Observable<TimeReportDTO> {
    const form = new FormData();

    files?.forEach((file, i) => {
      form.append(`files[${i}].File`, file, file.name);
      if (descriptions?.[i]) form.append(`files[${i}].Description`, descriptions[i]);
      if (tags?.[i]?.length) form.append(`files[${i}].Tags`, tags[i].join(';'));
    });

    form.append('model', JSON.stringify(workTimeReport));

    return this.httpClient
      .put<TimeReportDTO>(`${environment.APIEndPoint}work-time-reports/${workTimeReport.id}`, form)
      .pipe(
        tap((dto: TimeReportDTO) => {
          this.upsertLocalData(dto);
          this.toastService.success(this.translateService.instant('time-reports.toasts.successfully-updated'));
        })
      );
  }

  public deleteTimeReport(reportId: string, dateFrom: Date, dateTo: Date, taskId?: string): Observable<void> {
    return this.httpClient.delete<void>(`${environment.APIEndPoint}time-reports/${reportId}`).pipe(
      tap(() => {
        const collectionKey = this.getCollectionKey(dateFrom, dateTo);
        const existingIds = this.userTimeReports.get(collectionKey)()?.ids ?? [];

        this.userTimeReports.upsert({
          id: collectionKey,
          ids: existingIds.filter(id => id !== reportId)
        });

        if (!taskId) {
          return;
        }

        const taskCollectionKey = this.getTaskCollectionKey(taskId, dateFrom, dateTo);
        const taskExistingIds = this.taskTimeReports.get(taskCollectionKey)()?.ids ?? [];

        this.taskTimeReports.upsert({
          id: taskCollectionKey,
          ids: taskExistingIds.filter(id => id !== reportId)
        });

        this.timeReports.delete(reportId);
        this.toastService.success(this.translateService.instant('time-reports.toasts.successfully-deleted'));
      })
    );
  }

  public approveTimeReports(reportIds: string[]): Observable<void[]> {
    const baseUrl = 'time-reports';
    const requests = reportIds.map(id =>
      this.httpClient.put<void>(`${environment.APIEndPoint}${baseUrl}/${id}/approve`, {})
    );

    return forkJoin(requests).pipe(
      tap(() => {
        reportIds.forEach(id => {
          const report = this.timeReports.get(id)();
          if (report && 'status' in report) {
            const updatedReport = { ...report, status: TimeReportStatus.APPROVED };
            this.timeReports.upsert(updatedReport);
          }
        });
        this.toastService.success(this.translateService.instant('time-reports.toasts.successfully-approved'));
      })
    );
  }
}
