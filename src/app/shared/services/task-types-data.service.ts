import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { TaskType } from '../types/models/task/task-type.model';
import { AppEvent } from '../types/models/notifications/app-event';
import { DataService } from './data-service';
import { TaskTypeDTO } from './dtos/project-tasks/project-task-type.dt';
import { TaskTypeFactory } from './factories/task-type.factory';

const MOCK_TASK_TYPES: TaskTypeDTO[] = [
  {
    id: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f',
    code: 'ZK',
    name: 'Work for client',
    isDescriptionCommentingEnabled: false
  },
  {
    id: '3be24941-7c9a-48cc-b071-8cdcf046786b',
    code: 'RE',
    name: 'Complaint',
    isDescriptionCommentingEnabled: false
  },
  {
    id: 'c638acf1-ccae-4a22-82df-2e6c58d3831b',
    code: 'RD',
    name: 'Unexpected work',
    isDescriptionCommentingEnabled: false
  },
  {
    id: 'f9cc182a-382b-4f5d-90f4-163ad65e4f20',
    code: 'BHP',
    name: 'Safety work',
    isDescriptionCommentingEnabled: false
  },
  {
    id: 'd678d5d6-ca00-4ce1-9b7f-48e1a5cc2178',
    code: 'PP',
    name: 'Cleanup work',
    isDescriptionCommentingEnabled: false
  }
];

@Injectable({ providedIn: 'root' })
export class TaskTypesDataService extends DataService<TaskTypeDTO, TaskType> {
  private readonly taskTypeFactory: TaskTypeFactory = inject(TaskTypeFactory);

  private readonly _taskTypes: Signal<TaskType[]> = signal(
    MOCK_TASK_TYPES.map(dto => this.taskTypeFactory.produce(dto))
  );

  public getById(taskTypeId: string): Signal<TaskType | undefined> {
    return computed(() => this._taskTypes().find(t => t.id === taskTypeId));
  }

  public getActiveCompanyTaskTypes(): Signal<TaskType[]> {
    return this._taskTypes;
  }

  public getCompanyTaskTypes(_companyId: string): Signal<TaskType[]> {
    return this._taskTypes;
  }

  public loadTaskType(_taskTypeId: string): void {}

  public upsertLocalData(_dto: TaskTypeDTO): Signal<TaskType> {
    return signal(undefined);
  }

  protected override handleEvent(_event: AppEvent): void {}
}
