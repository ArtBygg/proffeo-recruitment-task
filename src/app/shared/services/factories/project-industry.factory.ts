import { inject, Injectable, Injector } from '@angular/core';
import { ProjectIndustryDTO } from '@app/shared/services/dtos/project-industry/project-industry.dto';
import { UsersDataService } from '@app/shared/services/users-data.service';
import { ProjectIndustry } from '@app/shared/types/models/project-industry/project-industry.model';
import { CompanyIndustriesDataService } from '../company-industries-data.service';
import { AbstractFactory } from './abstract.factory';

@Injectable({ providedIn: 'root' })
export class ProjectIndustryFactory extends AbstractFactory<ProjectIndustryDTO, ProjectIndustry> {
  private readonly injector: Injector = inject(Injector);
  private readonly industriesDataService: CompanyIndustriesDataService =
    this.injector.get<CompanyIndustriesDataService>(CompanyIndustriesDataService);
  private readonly usersService: UsersDataService = this.injector.get<UsersDataService>(UsersDataService);

  public constructor() {
    super();
  }

  public produce(item: ProjectIndustryDTO): ProjectIndustry {
    return item
      ? new ProjectIndustry({
          id: item.id,
          projectId: item.projectId,
          industry: this.industriesDataService.getById(item.industry.id),
          administrator: this.usersService.getById(item.administrator.id)
        })
      : undefined;
  }
}
