import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { DataService } from '@app/shared/services/data-service';
import { ProjectIndustryDTO } from '@app/shared/services/dtos/project-industry/project-industry.dto';
import { LoaderService } from '@app/shared/services/shared/loader.service';
import { ToastService } from '@app/shared/services/shared/toast.service';
import { UserStatus } from '@app/shared/types/enums/user-status.enum';
import { ProjectIndustry } from '@app/shared/types/models/project-industry/project-industry.model';
import { DataStore } from '@app/store/data-store';
import { IdsCollection } from '@app/store/ids-collection';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { CompanyIndustriesDataService } from './company-industries-data.service';
import { ProjectIndustryFactory } from './factories/project-industry.factory';
import { UsersDataService } from './users-data.service';

const MOCK_PROJECT_INDUSTRIES_PROJECT_ID = '656e918f-6b5e-463e-ad4f-1146e86617e5';

const MOCK_PROJECT_INDUSTRIES: ProjectIndustryDTO[] = [
  {
    administrator: {
      id: 'ec1b7e30-194c-466a-a7c6-0c34de58a7ba',
      email: 'zysko.marek@gmail.com',
      firstName: 'Marek',
      lastName: 'Zysko',
      notes: '12345',
      profileCompletion: 100,
      status: UserStatus.ACTIVE,
      createdAt: new Date('2026-01-15T19:37:48.130516Z'),
      updatedAt: new Date('2026-04-02T19:04:14.50626Z'),
      activatedAt: new Date('2026-01-15T19:40:50.772268Z'),
      address: 'asda',
      phoneNumbers: '531 876 444'
    },
    id: '828725e7-b3cc-40c2-99da-5af3e00efc14',
    industry: {
      id: '6311d239-a99d-4441-bed1-1bb45dc26697',
      name: 'UI/UX'
    },
    projectId: '00000000-0000-0000-0000-000000000000'
  },
  {
    administrator: {
      id: 'ec1b7e30-194c-466a-a7c6-0c34de58a7ba',
      email: 'zysko.marek@gmail.com',
      firstName: 'Marek',
      lastName: 'Zysko',
      notes: '12345',
      profileCompletion: 100,
      status: UserStatus.ACTIVE,
      createdAt: new Date('2026-01-15T19:37:48.130516Z'),
      updatedAt: new Date('2026-04-02T19:04:14.50626Z'),
      activatedAt: new Date('2026-01-15T19:40:50.772268Z'),
      address: 'asda',
      phoneNumbers: '531 876 444'
    },
    id: 'a3137d56-2fc3-4bf4-95a7-89f5097f0c0d',
    industry: {
      id: 'deb3789e-f3cc-4dca-99cb-32a72ab8a683',
      name: 'FE'
    },
    projectId: '00000000-0000-0000-0000-000000000000'
  },
  {
    administrator: {
      id: '632ceed0-5251-42a6-b5ba-f509c3afdbca',
      email: 'r.pietraszewski75@gmail.com',
      firstName: 'Rafał',
      lastName: 'Pietraszewski',
      notes: '',
      profileCompletion: 0,
      status: UserStatus.ACTIVE,
      createdAt: new Date('2023-04-04T10:03:46.941908Z'),
      lastActivityDate: new Date('2026-01-07T11:50:10.35461Z'),
      updatedAt: new Date('2026-01-07T11:50:10.495853Z'),
      activatedAt: new Date('2023-04-04T15:07:26.147579Z'),
      address: '',
      phoneNumbers: ''
    },
    id: 'cd96feca-b24b-4611-81c3-75dfd4e5053b',
    industry: {
      id: '4b9eb51a-6471-4894-84d1-d92512520cf6',
      name: 'BE'
    },
    projectId: '00000000-0000-0000-0000-000000000000'
  },
  {
    administrator: {
      id: '932b811d-0af0-423d-a673-29d513edc039',
      email: 'piotr@proffeo.net',
      firstName: 'Piotr@Proffeo ',
      lastName: 'Net',
      notes: 'Multi company user',
      profileCompletion: 100,
      status: UserStatus.ACTIVE,
      createdAt: new Date('2024-03-13T21:20:42.564067Z'),
      lastActivityDate: new Date('2026-01-06T23:56:57.491135Z'),
      updatedAt: new Date('2026-01-23T20:29:55.464496Z'),
      activatedAt: new Date('2025-04-04T14:11:11.084261Z'),
      blockedAt: new Date('2025-04-04T14:11:09.191067Z')
    },
    id: '4e564113-0840-44e8-83c0-dc0d8ab6629a',
    industry: {
      id: '05d757a5-9ec2-441e-ab44-c060eec1936b',
      name: 'HOVED / MAIN'
    },
    projectId: '00000000-0000-0000-0000-000000000000'
  }
];

@Injectable({ providedIn: 'root' })
export class ProjectIndustriesDataService extends DataService<ProjectIndustryDTO, ProjectIndustry> {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly industriesDataService: CompanyIndustriesDataService = inject(CompanyIndustriesDataService);
  private readonly loaderService: LoaderService = inject(LoaderService);
  private readonly projectIndustryFactory: ProjectIndustryFactory = inject(ProjectIndustryFactory);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly usersService: UsersDataService = inject(UsersDataService);

  private industries: DataStore<ProjectIndustry> = new DataStore<ProjectIndustry>();
  private projectIndustries: DataStore<IdsCollection> = new DataStore<IdsCollection>();
  private readonly pendingProjectIndustryLoads = new Set<string>();

  public getProjectIndustries(projectId: string): Signal<ProjectIndustry[] | undefined> {
    if (!projectId) {
      return signal(undefined);
    }
    if (!this.projectIndustries.hasDataForId(projectId)) {
      this.fetchProjectIndustries(projectId);
    }

    return computed(
      () =>
        this.projectIndustries
          .get(projectId)()
          ?.ids?.map(id => this.industries.get(id)()) || []
    );
  }

  public getById(industryId: string): Signal<ProjectIndustry | undefined> {
    return computed(() => this.industries.get(industryId)());
  }

  public getProjectIndustryByIndustryId(industryId: string, projectId: string): Signal<ProjectIndustry | undefined> {
    if (!industryId || !projectId) {
      return signal(undefined);
    }

    return computed(
      () => this.getProjectIndustries(projectId)()?.find(pi => pi.industry().id === industryId) || undefined
    );
  }

  // TODO: delete this and leave only get() methods that fetch data if it's not available
  public loadProjectIndustries(projectId: string): void {
    if (this.projectIndustries.hasDataForId(projectId)) {
      return;
    }
    this.fetchProjectIndustries(projectId);
  }

  public upsertLocalData(dto: ProjectIndustryDTO): Signal<ProjectIndustry> {
    return dto ? this.industries.upsert(this.projectIndustryFactory.produce(dto)) : signal(undefined);
  }

  protected fetchProjectIndustries(projectId: string): void {
    if (this.pendingProjectIndustryLoads.has(projectId)) {
      return;
    }

    this.pendingProjectIndustryLoads.add(projectId);
    queueMicrotask(() => {
      const projectIndustries =
        projectId === MOCK_PROJECT_INDUSTRIES_PROJECT_ID ? MOCK_PROJECT_INDUSTRIES : [];

      if (projectIndustries.length) {
        projectIndustries.forEach(projectIndustry => {
          this.industriesDataService.upsertLocalData(projectIndustry.industry);
          this.usersService.upsertLocalData(projectIndustry.administrator);
        });
      }

      this.industries.upsertMany(
        projectIndustries.map(projectIndustry => this.projectIndustryFactory.produce(projectIndustry))
      );

      this.projectIndustries.upsert({
        id: projectId,
        ids: projectIndustries.map(projectIndustry => projectIndustry.id)
      });
      this.pendingProjectIndustryLoads.delete(projectId);
    });
  }

  public setIndustryAdmin(projectId: string, projectIndustry: ProjectIndustry, newAdminUserId: string): void {
    this.loaderService.startLoading();

    this.httpClient
      .put<ProjectIndustryDTO>(
        `${environment.APIEndPoint}projects/${projectId}/industries/${projectIndustry.industry().id}`,
        {
          industryId: projectIndustry.industry().id,
          administratorId: newAdminUserId
        }
      )
      .subscribe({
        next: (projectIndustryDTO: ProjectIndustryDTO) => {
          this.upsertLocalData(projectIndustryDTO);
          this.toastService.success(
            this.translateService.instant('project-industries.toasts.admin-successfully-changed')
          );
        },
        error: () => this.loaderService.stopLoading(),
        complete: () => this.loaderService.stopLoading()
      });
  }

  public deleteIndustry(projectId: string, projectIndustry: ProjectIndustry): void {
    this.loaderService.startLoading();

    this.httpClient
      .delete<void>(`${environment.APIEndPoint}projects/${projectId}/industries/${projectIndustry.industry().id}`)
      .subscribe({
        next: () => {
          this.toastService.success(
            this.translateService.instant('project-industries.toasts.successfully-deleted', {
              name: projectIndustry.industry().name
            })
          );
          const existingProjectIndustries: string[] = this.projectIndustries.get(projectId)().ids ?? [];
          this.projectIndustries.upsert({
            id: projectId,
            ids: existingProjectIndustries.filter(id => id !== projectIndustry.id)
          });
          this.industries.delete(projectIndustry.id);
        },
        error: () => this.loaderService.stopLoading(),
        complete: () => this.loaderService.stopLoading()
      });
  }

  public addIndustryToProject(projectId: string, industryId: string, administratorId: string): void {
    this.loaderService.startLoading();

    this.httpClient
      .post<ProjectIndustryDTO>(`${environment.APIEndPoint}projects/${projectId}/industries/`, {
        industryId,
        administratorId
      })
      .subscribe({
        next: (projectIndustryDTO: ProjectIndustryDTO) => {
          this.upsertLocalData(projectIndustryDTO);
          this.toastService.success(
            this.translateService.instant('project-industries.toasts.successfully-deleted', {
              name: projectIndustryDTO.industry.name
            })
          );
          const existingProjectIndustries: string[] = this.projectIndustries.get(projectId)().ids ?? [];
          this.projectIndustries.upsert({
            id: projectId,
            ids: existingProjectIndustries.concat(projectIndustryDTO.id)
          });
        },
        error: () => this.loaderService.stopLoading(),
        complete: () => this.loaderService.stopLoading()
      });
  }
}
