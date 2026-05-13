import { inject, Injectable, Injector } from '@angular/core';
import { TaskParticipant } from '@app/shared/types/models/task/task-participant.model';
import { TaskParticipantDTO } from '../dtos/project-tasks/project-task-participant.dto';
import { ProjectParticipantsDataService } from '../project-participants-data.service';
import { AbstractFactory } from './abstract.factory';

@Injectable({ providedIn: 'root' })
export class TaskParticipantFactory extends AbstractFactory<TaskParticipantDTO, TaskParticipant> {
  private readonly injector: Injector = inject(Injector);

  private readonly projectParticipantService: ProjectParticipantsDataService =
    this.injector.get<ProjectParticipantsDataService>(ProjectParticipantsDataService);

  public constructor() {
    super();
  }

  public produce(item: TaskParticipantDTO): TaskParticipant {
    return item
      ? new TaskParticipant({
          id: item.id,
          taskId: item.taskId,
          projectParticipant: this.projectParticipantService.upsertLocalData(item.projectParticipant)
        })
      : undefined;
  }
}
