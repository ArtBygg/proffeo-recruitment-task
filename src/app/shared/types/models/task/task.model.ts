import { computed, Signal, WritableSignal } from '@angular/core';
import { TaskPriority } from '@app/shared/types/enums/task-priority.enum';
import { TaskStatus } from '@app/shared/types/enums/task-status.enum';
import { ProjectIndustry } from '@app/shared/types/models/project-industry/project-industry.model';
import { Project } from '@app/shared/types/models/project/project.model';
import { IdBased } from '@app/shared/types/models/shared/id-based.model';
import { TaskTimer } from '@app/shared/types/models/task/task-timer';
import { User } from '@app/shared/types/models/user/user.model';
import { environment } from '@env/environment';
import { TaskDescriptionStatus } from '../../enums/task-description-status.enum';
import { Location } from '../location/location.model';
import { ProjectParticipant } from '../project/project-participant';
import { TaskEstimation } from './task-estimation';
import { TaskStatistics } from './task-statistics';
import { TaskType } from './task-type.model';

export class Task implements IdBased {
  public id: string | undefined;
  public name: string = '';
  public taskNumber: string | undefined;
  public description?: string | undefined;
  public descriptionUpdatedBy: Signal<User>;
  public descriptionUpdatedOn: Date | undefined;
  public avatarId: string | undefined;
  public hasChildren: boolean | undefined;
  public parentTask: Signal<Task>;
  public level: number = 0;
  public project: Signal<Project>;
  public taskType: Signal<TaskType>;
  public status: TaskStatus | undefined;
  public priority: TaskPriority | undefined;
  public projectGroupAdministrator: Signal<ProjectParticipant>;
  public projectIndustry: Signal<ProjectIndustry>;
  public timeReportWithLocation: boolean;
  public location: Signal<Location>;
  public taskTotalTrackedSeconds: number;
  public isLocked: boolean | undefined;
  public createdAt: Date;
  public createdBy: Signal<User>;
  public startDate?: Date;
  public endDate?: Date;
  public deletedBy: Signal<User>;
  public deletedAt?: Date;
  public percentageOfProgress: number | undefined;
  public subtasksCount: number | undefined;
  public estimation?: TaskEstimation;
  public statistics?: TaskStatistics;
  public timer: WritableSignal<TaskTimer | undefined>;
  public lastActivityAt?: Date;
  public acceptanceRequested: boolean;
  public projectTaskDescriptionStatus: TaskDescriptionStatus;

  public constructor(data: Partial<Task>) {
    Object.assign(this, data);
    if (data?.timer) {
      this.timer.set(new TaskTimer(data.timer()));
    }
  }

  public get url(): Signal<string> {
    return computed(() => `${location.origin}${this.project()?.url()}/tasks/${this.id}`);
  }

  public getAvatarUrl(): Signal<string> {
    return computed(() =>
      this.avatarId ? `${environment.AvatarsEndPoint}avatars/Tasks/${this.avatarId}.jpg` : undefined
    );
  }
}
