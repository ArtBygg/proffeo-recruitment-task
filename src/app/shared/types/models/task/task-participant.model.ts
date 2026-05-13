import { Signal } from '@angular/core';
import { TaskRole } from '@app/shared/types/enums/task-role.enum';
import { ProjectParticipant } from '../project/project-participant';
import { IdBased } from '../shared/id-based.model';

export class TaskParticipant implements IdBased {
  public id: string | undefined;
  public taskId: string | undefined;
  public projectParticipant: Signal<ProjectParticipant>;
  public role: TaskRole;

  public constructor(data: Partial<TaskParticipant>) {
    Object.assign(this, data);
  }
}
