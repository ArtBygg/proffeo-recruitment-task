import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { ProjectDTO } from '@app/shared/services/dtos/project/project.dto';
import { Currency } from '@app/shared/types/enums/currency.enum';
import { Project } from '@app/shared/types/models/project/project.model';
import { AppEvent } from '../types/models/notifications/app-event';
import { DataService } from './data-service';
import { ProjectFactory } from './factories/project.factory';

const PROFFEO_COMPANY_ID = '2b8cab41-ee72-4617-903c-f390ead12a36';

const MOCK_ACTIVE_PROJECTS: ProjectDTO[] = [
  {
    id: '7b48a980-ddc3-416c-ae80-d27b11e45734',
    name: 'Zadania Marka',
    description: 'Projekt  Marka do testowania w trakcie pracy',
    avatarId: 'dc4afdbb-dffc-48b5-ac1b-0c26ff5f8942',
    companyId: PROFFEO_COMPANY_ID,
    endDate: new Date('2025-01-22T23:00:00Z'),
    supervisorId: 'ec1b7e30-194c-466a-a7c6-0c34de58a7ba',
    estimation: { hours: 20, financial: { amount: 0.0, currency: Currency.PLN } },
    statistic: undefined
  },
  {
    id: '8e2976eb-cb8e-45ad-b432-433a0687a050',
    name: 'Bugs',
    description: '',
    avatarId: '029cda5b-3a63-4980-a3fc-5edcafba0c75',
    companyId: PROFFEO_COMPANY_ID,
    startDate: new Date('2024-05-01T00:00:00Z'),
    endDate: new Date('2024-10-31T00:00:00Z'),
    supervisorId: '932b811d-0af0-423d-a673-29d513edc039',
    estimation: { hours: 0, financial: { amount: 0.0, currency: Currency.PLN } },
    statistic: undefined
  },
  {
    id: 'e393ff72-f157-4638-a3cc-94f92831d12d',
    name: 'Organizacyjne',
    description: 'projekt organizacyjny do spotkań, PR review i rzeczy innych niż czyste programowanie',
    avatarId: '14944a38-5d06-4ba3-b132-22cf5cd78454',
    companyId: PROFFEO_COMPANY_ID,
    supervisorId: '8591e555-9322-4e4e-a1eb-de9642e0e3cc',
    estimation: { hours: 0, financial: { amount: 0.0, currency: Currency.PLN } },
    statistic: { hours: 0, tasksDonePercentage: 0, financial: { amount: 0.0, currency: Currency.PLN } }
  },
  {
    id: 'fa2ffd4a-aabe-4eff-9649-b4be49878c75',
    name: 'Backlog',
    description: 'Miejsce na planowanie i dyskutowanie opcji. ',
    avatarId: 'b9f2c004-688d-4fda-b426-8ef274e19ecd',
    companyId: PROFFEO_COMPANY_ID,
    startDate: new Date('2024-05-09T00:00:00Z'),
    endDate: new Date('2026-10-23T00:00:00Z'),
    address: 'eeee',
    supervisorId: '3fc67e07-cc72-4f05-b3b0-f373b5394139',
    estimation: { hours: 0, financial: { amount: 0.0, currency: Currency.PLN } },
    statistic: undefined
  },
  {
    id: '656e918f-6b5e-463e-ad4f-1146e86617e5',
    name: 'Proffeo_V4',
    description: 'Aktualne zadania na uruchomienie MVP v4',
    avatarId: 'bc6e09f4-735f-4959-81bf-fe6bec13d83e',
    companyId: PROFFEO_COMPANY_ID,
    startDate: new Date('2025-10-06T01:36:32Z'),
    endDate: new Date('2025-10-06T01:36:32Z'),
    supervisorId: '632ceed0-5251-42a6-b5ba-f509c3afdbca',
    estimation: { hours: 0, financial: { amount: 0.0, currency: Currency.PLN } },
    statistic: { hours: 0, tasksDonePercentage: 0, financial: { amount: 0.0, currency: Currency.PLN } }
  },
  {
    id: 'ee5690fe-9985-43ea-834f-6ad07a380b19',
    name: 'ProffeoV4_Bugs',
    avatarId: 'a662ef4e-0eee-4cd9-af01-3b47f3d34b45',
    companyId: PROFFEO_COMPANY_ID,
    startDate: new Date('2025-11-13T09:45:15Z'),
    endDate: new Date('2025-11-13T09:45:15Z'),
    supervisorId: '632ceed0-5251-42a6-b5ba-f509c3afdbca',
    estimation: { hours: 0, financial: { amount: 0.0, currency: Currency.PLN } },
    statistic: undefined
  },
  {
    id: '6c26eb8e-81f0-4e49-9d0e-362fd72113d9',
    name: 'Rekrutacja UI ',
    description: '',
    avatarId: '5b839105a8d34df898a98294ca7af595',
    companyId: PROFFEO_COMPANY_ID,
    address: '',
    supervisorId: '932b811d-0af0-423d-a673-29d513edc039',
    estimation: undefined,
    statistic: undefined
  }
];

@Injectable({ providedIn: 'root' })
export class ProjectsDataService extends DataService<ProjectDTO, Project> {
  private readonly projectsFactory: ProjectFactory = inject(ProjectFactory);

  private readonly _activeProjects: Signal<Project[]> = signal(
    MOCK_ACTIVE_PROJECTS.map(dto => this.projectsFactory.produce(dto))
  );
  private readonly _emptyProjects: Signal<Project[]> = signal([]);

  public getCompanyProjects(companyId: string): Signal<Project[]> {
    return companyId === PROFFEO_COMPANY_ID ? this._activeProjects : this._emptyProjects;
  }

  public getCompanyArchivedProjects(_companyId: string): Signal<Project[]> {
    return this._emptyProjects;
  }

  public getCompanyDraftProjects(_companyId: string): Signal<Project[]> {
    return this._emptyProjects;
  }

  public getById(projectId: string): Signal<Project | undefined> {
    return computed(() => this._activeProjects().find(p => p.id === projectId));
  }

  public getArchiveProjectById(_projectId: string): Signal<Project | undefined> {
    return signal(undefined);
  }

  public getDraftProjectById(_projectId: string): Signal<Project | undefined> {
    return signal(undefined);
  }

  public upsertLocalData(_dto: ProjectDTO): Signal<Project> {
    return signal(undefined);
  }

  public upsertArchiveLocalData(_dto: ProjectDTO): Signal<Project> {
    return signal(undefined);
  }

  public upsertDraftLocalData(_dto: ProjectDTO): Signal<Project> {
    return signal(undefined);
  }

  public loadCompanyProjects(_companyId: string): void {}

  public loadCompanyArchivedProjects(_companyId: string): void {}

  public loadCompanyDraftProjects(_companyId: string): void {}

  public reloadCompanyProjects(_companyId: string): void {}

  protected override handleEvent(_event: AppEvent): void {}
}
