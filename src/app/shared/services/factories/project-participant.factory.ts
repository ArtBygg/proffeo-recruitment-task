import { inject, Injectable, Injector } from '@angular/core';
import { ProjectParticipantDTO } from '@app/shared/services/dtos/project-participants/project-participant.dto';
import { GroupsDataService } from '@app/shared/services/groups-data.service';
import { UsersDataService } from '@app/shared/services/users-data.service';
import { ProjectParticipant } from '@app/shared/types/models/project/project-participant';
import { AbstractFactory } from './abstract.factory';

@Injectable({ providedIn: 'root' })
export class ProjectParticipantFactory extends AbstractFactory<ProjectParticipantDTO, ProjectParticipant> {
  private readonly injector: Injector = inject(Injector);
  private readonly groupsDataService: GroupsDataService = this.injector.get<GroupsDataService>(GroupsDataService);
  private readonly usersDataService: UsersDataService = this.injector.get<UsersDataService>(UsersDataService);

  public constructor() {
    super();
  }

  public produce(item: ProjectParticipantDTO): ProjectParticipant {
    return item
      ? new ProjectParticipant({
          group: this.groupsDataService.upsertLocalData(item.group),
          id: item.id,
          projectId: item.projectId,
          role: item.role,
          user: this.usersDataService.upsertLocalData(item.user)
        })
      : undefined;
  }
}
