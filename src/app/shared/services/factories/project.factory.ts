import { inject, Injectable, Injector, signal } from '@angular/core';
import { ProjectDTO } from '@app/shared/services/dtos/project/project.dto';
import { Project } from '@app/shared/types/models/project/project.model';
import { CompaniesDataService } from '../companies-data.service';
import { UsersDataService } from '../users-data.service';
import { AbstractFactory } from './abstract.factory';

@Injectable({ providedIn: 'root' })
export class ProjectFactory extends AbstractFactory<ProjectDTO, Project> {
  private readonly injector: Injector = inject(Injector);
  private readonly companiesService: CompaniesDataService =
    this.injector.get<CompaniesDataService>(CompaniesDataService);
  private readonly usersService: UsersDataService = this.injector.get<UsersDataService>(UsersDataService);

  public constructor() {
    super();
  }

  public produce(item: ProjectDTO): Project {
    return item
      ? new Project({
          id: item.id,
          name: item.name,
          description: item.description,
          avatarId: item.avatarId,
          company: this.companiesService.getById(item.companyId),
          startDate: item.startDate,
          endDate: item.endDate,
          address: item.address,
          supervisor: item.supervisorId ? this.usersService.getById(item.supervisorId) : signal(undefined),
          client: item.clientId ? this.usersService.getById(item.clientId) : signal(undefined),
          estimation: item.estimation,
          statistic: item.statistic
        })
      : undefined;
  }
}
