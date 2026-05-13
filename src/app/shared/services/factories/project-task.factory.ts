import { inject, Injectable, Injector, signal } from '@angular/core';
import { TaskDescriptionStatus } from '@app/shared/types/enums/task-description-status.enum';
import { TaskPriority } from '@app/shared/types/enums/task-priority.enum';
import { TaskStatus } from '@app/shared/types/enums/task-status.enum';
import { TaskTimer } from '@app/shared/types/models/task/task-timer';
import { Task } from '@app/shared/types/models/task/task.model';
import { ProjectTaskDTO } from '../dtos/project-tasks/project-task.dto';
import { LocationsDataService } from '../locations-data.service';
import { ProjectIndustriesDataService } from '../project-industries-data.service';
import { ProjectParticipantsDataService } from '../project-participants-data.service';
import { ProjectsDataService } from '../projects-data.service';
import { TaskTypesDataService } from '../task-types-data.service';
import { TasksDataService } from '../tasks-data.service';
import { UsersDataService } from '../users-data.service';
import { AbstractFactory } from './abstract.factory';

@Injectable({ providedIn: 'root' })
export class ProjectTaskFactory extends AbstractFactory<ProjectTaskDTO, Task> {
  private readonly injector: Injector = inject(Injector);
  private readonly locationsService: LocationsDataService = this.injector.get(LocationsDataService);
  private readonly projectsService: ProjectsDataService = this.injector.get(ProjectsDataService);
  private readonly taskTypesService: TaskTypesDataService = this.injector.get(TaskTypesDataService);
  private readonly usersService: UsersDataService = this.injector.get(UsersDataService);
  private readonly projectIndustriesDataService: ProjectIndustriesDataService =
    this.injector.get(ProjectIndustriesDataService);
  private readonly projectParticipantsDataService: ProjectParticipantsDataService =
    inject(ProjectParticipantsDataService);

  public constructor() {
    super();
  }

  public produce(item: Partial<ProjectTaskDTO>): Task {
    const tasksService: TasksDataService = this.injector.get(TasksDataService);
    return item
      ? new Task({
          id: item.id,
          name: item.name,
          taskNumber: item.taskNumber,
          description: item.description,
          descriptionUpdatedBy: item.descriptionUpdatedById
            ? this.usersService.getById(item.descriptionUpdatedById)
            : signal(undefined),
          descriptionUpdatedOn: item.descriptionUpdatedOn ? new Date(item.descriptionUpdatedOn) : undefined,
          avatarId: item.avatarId,
          parentTask: item.parentTaskId ? tasksService.getById(item.parentTaskId) : signal(undefined),
          project: this.projectsService.getById(item.projectId),
          taskType: item.taskTypeId ? this.taskTypesService.getById(item.taskTypeId) : signal(undefined),
          status: this.mapStatus(item.status),
          priority: this.mapPriority(item.priority),

          projectGroupAdministrator: item.groupId
            ? this.projectParticipantsDataService.getProjectGroupAdmin(item.projectId, item.groupId)
            : signal(undefined),
          projectIndustry: item.industryId
            ? this.projectIndustriesDataService.getProjectIndustryByIndustryId(item.industryId, item.projectId)
            : signal(undefined),

          timeReportWithLocation: item.timeReportWithLocation,
          location: item.locationId ? this.locationsService.getById(item.locationId) : signal(undefined),
          taskTotalTrackedSeconds: item.taskTotalTrackedSeconds,
          isLocked: item.isLocked,
          createdAt: new Date(item.createdAt),
          createdBy: this.usersService.getById(item.createdById),
          startDate: item.startDate ? new Date(item.startDate) : undefined,
          endDate: item.endDate ? new Date(item.endDate) : undefined,
          deletedBy: item.deletedBy ? this.usersService.getById(item.deletedBy) : signal(undefined),
          deletedAt: item.deletedAt ? new Date(item.deletedAt) : undefined,
          percentageOfProgress: item.percentageOfProgress,
          subtasksCount: item.subtasksCount,
          estimation: item.estimation,
          statistics: item.statistics,
          timer: signal(
            new TaskTimer({
              id: (item as { timerId?: string }).timerId ?? null,
              taskId: item.id,
              user: this.usersService.getById(item.createdById)(),
              alreadyTrackedSeconds: item.taskTotalTrackedSeconds ?? 0
            })
          ),
          lastActivityAt: item.lastActivityAt ? new Date(item.lastActivityAt) : undefined,
          acceptanceRequested: item.acceptanceRequested ?? false,
          projectTaskDescriptionStatus: mapTaskDescriptionStatus(item.projectTaskDescriptionStatus)
        })
      : undefined;
  }

  private mapStatus(value: string): TaskStatus | undefined {
    if (!value) {
      return undefined;
    }

    switch (value.toUpperCase()) {
      case 'TO_DO':
        return TaskStatus.TO_DO;
      case 'IN_PROGRESS':
        return TaskStatus.IN_PROGRESS;
      case 'DONE':
        return TaskStatus.DONE;
      case 'IN_PLANNING':
        return TaskStatus.IN_PLANNING;
      case 'IN_REVIEW':
        return TaskStatus.IN_REVIEW;
      case 'ACCEPTED':
        return TaskStatus.ACCEPTED;
      case 'REJECTED':
        return TaskStatus.REJECTED;
    }

    return TaskStatus.TO_DO;
  }

  private mapPriority(value: string): TaskPriority | undefined {
    if (!value) {
      return undefined;
    }

    switch (value.toUpperCase()) {
      case 'MEDIUM':
        return TaskPriority.MEDIUM;
      case 'NORMAL':
        return TaskPriority.NORMAL;
      case 'HIGH':
        return TaskPriority.HIGH;
    }

    return TaskPriority.NORMAL;
  }
}
function mapTaskDescriptionStatus(value: string): TaskDescriptionStatus {
  if (!value) {
    return TaskDescriptionStatus.InProgress;
  }

  switch (value.toUpperCase()) {
    case 'ACCEPTED':
      return TaskDescriptionStatus.Accepted;
    case 'INPROGRESS':
      return TaskDescriptionStatus.InProgress;
    case 'REJECTED':
      return TaskDescriptionStatus.Rejected;
    case 'REVIEWREQUESTED':
      return TaskDescriptionStatus.ReviewRequested;
  }

  return TaskDescriptionStatus.InProgress;
}
