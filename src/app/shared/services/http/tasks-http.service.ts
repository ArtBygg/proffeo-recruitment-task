import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TaskCreateData } from '@app/components/task/task-create/task-create.component';
import { ModelWithContextData } from '@app/shared/services/dtos/dto-with-context-data.dto';
import { PaginatedDataDTO } from '@app/shared/services/dtos/paginated-data.dto';
import { ProjectTaskDTO } from '@app/shared/services/dtos/project-tasks/project-task.dto';
import { PageKey } from '@app/shared/services/tasks-data.service';
import { SortDirection } from '@app/shared/types/enums/sort-direction.enum';
import { TaskPriority } from '@app/shared/types/enums/task-priority.enum';
import { TaskSortField } from '@app/shared/types/enums/task-sort-field';
import { TaskStatus } from '@app/shared/types/enums/task-status.enum';
import { TaskFilters } from '@app/shared/types/models/task/task-filters.model';
import { Task } from '@app/shared/types/models/task/task.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { TaskEstimationDTO } from '../dtos/project-tasks/project-task-estimation.dto';

export interface RootTasksResponse {
  page: number;
  limit: number;
  total: number;
  sortByField?: string;
  direction: SortDirection;
  appliedFilter: {
    filterRef: {
      id: string;
      name?: string;
    };
    state: TaskFilters;
  };
  items?: ProjectTaskDTO[];
}

export interface RootTasksRequest {
  pageRequest: {
    page: number;
    limit: number;
    sortByField?: string;
    direction: SortDirection;
  };
  filterRequest?: {
    filterRefId?: string;
    filterName?: string;
    state?: TaskFilters;
  };
}

export interface TaskCreateDTO {
  name: string;
  taskTypeId: string;
  parentTaskId?: string;
  industryId?: string;
  groupId?: string;
  locationIds?: string[];
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: Date;
  endDate?: Date;
  estimation?: TaskEstimationDTO;
  percentageOfProgress?: number;
}
/**
 * TasksHttpService - HTTP API layer for tasks.
 *
 * This service handles all HTTP communication with the tasks API endpoints.
 *
 * Usage: Used by {@link TasksDataService} to perform API calls.
 *
 * Architecture:
 * - {@link TasksActionsService}: User actions, mutations, side effects (toasts, modals)
 * - {@link TasksDataService}: Data access, queries, getters, store management
 * - {@link TasksHttpService}: HTTP API calls
 */
@Injectable({ providedIn: 'root' })
export class TasksHttpService {
  private httpClient: HttpClient = inject(HttpClient);

  public lockTask(taskId: string): Observable<ProjectTaskDTO> {
    return this.httpClient.post<ProjectTaskDTO>(`${environment.APIEndPoint}tasks/${taskId}/lock`, null);
  }

  public unlockTask(taskId: string): Observable<ProjectTaskDTO> {
    return this.httpClient.post<ProjectTaskDTO>(`${environment.APIEndPoint}tasks/${taskId}/unlock`, null);
  }

  public deleteTask(taskId: string): Observable<ProjectTaskDTO> {
    return this.httpClient.delete<ProjectTaskDTO>(`${environment.APIEndPoint}tasks/${taskId}`);
  }

  public updateField<T>(task: Task, endpoint: string, payload: T): Observable<ProjectTaskDTO> {
    return this.httpClient.patch<ProjectTaskDTO>(`${environment.APIEndPoint}tasks/${task.id}/${endpoint}`, payload);
  }

  public getTask(taskId: string): Observable<ProjectTaskDTO> {
    return this.httpClient.get<ProjectTaskDTO>(`${environment.APIEndPoint}tasks/${taskId}`);
  }

  public fetchSubtasks(
    projectId: string,
    taskId: string,
    params: RootTasksRequest
  ): Observable<ModelWithContextData<PaginatedDataDTO<ProjectTaskDTO>>> {
    return this.httpClient.post<ModelWithContextData<PaginatedDataDTO<ProjectTaskDTO>>>(
      `${environment.APIEndPoint}projects/${projectId}/tasks/${taskId}/subtasks`,
      params
    );
  }

  public createTask(projectId: string, newTaskData: TaskCreateData): Observable<ProjectTaskDTO[]> {
    const formData = new FormData();
    const taskCreateDTO: TaskCreateDTO = {
      name: newTaskData.task.name,
      taskTypeId: newTaskData.task.taskTypeId,
      parentTaskId: newTaskData.task.parentTaskId,
      industryId: newTaskData.task.industryId,
      groupId: newTaskData.task.groupId,
      locationIds: newTaskData.task.locationId ? [newTaskData.task.locationId] : undefined,
      status: newTaskData.task.status as TaskStatus,
      description: newTaskData.task.description,
      priority: newTaskData.task.priority as TaskPriority
    };
    formData.append('model', JSON.stringify(taskCreateDTO));

    newTaskData.files?.forEach((file, i) => {
      formData.append(`files[${i}].File`, file, file.name);
    });
    return this.httpClient.post<ProjectTaskDTO[]>(`${environment.APIEndPoint}projects/${projectId}/tasks`, formData);
  }

  public fetchTasks(pageKey: PageKey): Observable<ModelWithContextData<RootTasksResponse>> {
    const filtersData = this.processFiltersDetails(
      pageKey.page,
      pageKey.limit,
      pageKey.sortField,
      pageKey.sortDir,
      pageKey.searchText,
      pageKey.filtersId,
      pageKey.filters
    );

    const data = structuredClone(filtersData);
    const normalized: TaskFilters = { ...((data as RootTasksRequest)?.filterRequest?.state ?? {}) };
    delete (normalized as Record<string, unknown>)['direction'];
    delete (normalized as Record<string, unknown>)['limit'];
    delete (normalized as Record<string, unknown>)['page'];

    return this.httpClient.post<ModelWithContextData<RootTasksResponse>>(
      `${environment.APIEndPoint}projects/${pageKey.projectId}/root-tasks`,
      filtersData
    );
  }

  private processFiltersDetails(
    page: number,
    limit: number,
    sortField: string,
    sortDir: string,
    searchText?: string,
    filtersId?: string,
    filters?: TaskFilters,
    isSubtask?: boolean
  ): RootTasksRequest | unknown {
    const order = Object.values(SortDirection).find(value => value.toLowerCase() === sortDir?.toLowerCase());

    const orderBy = Object.values(TaskSortField).find(value => value.toLowerCase() === sortField?.toLowerCase());

    if (isSubtask) {
      return {
        page: page,
        limit: limit,
        sortByField: sortField,
        direction: sortDir,

        text: searchText,
        taskStatus: filters?.taskStatus || [],
        taskPriority: filters?.taskPriority || [],
        group: filters?.group || [],
        user: filters?.user || [],
        location: filters?.location || [],
        industry: filters?.industry || [],
        userRole: filters?.userRole || [],
        createdBy: filters?.createdBy || []
      };
    }

    const filtersRequestData: RootTasksRequest = {
      pageRequest: {
        page,
        limit,
        sortByField: orderBy,
        direction: order ?? SortDirection.DESC
      }
    };

    if (filtersId) {
      filtersRequestData.filterRequest = { filterRefId: filtersId ?? null };
    }

    if (filters) {
      filtersRequestData.filterRequest = {
        filterRefId: filtersId ?? null,
        state: {
          text: searchText ?? null,
          taskStatus: filters.taskStatus ?? null,
          taskPriority: filters.taskPriority ?? null,
          group: filters.group ?? null,
          noGroup: filters.noGroup ?? false,
          user: filters.user ?? null,
          noUsers: filters.noUsers ?? false,
          location: filters.location ?? null,
          noLocation: filters.noLocation ?? false,
          industry: filters.industry ?? null,
          noIndustry: filters.noIndustry ?? false,
          userRole: filters.userRole ?? null,
          createdBy: filters.createdBy ?? null,
          startDateFrom: filters.startDateFrom ?? null,
          startDateTo: filters.startDateTo ?? null,
          endDateFrom: filters.endDateFrom ?? null,
          endDateTo: filters.endDateTo ?? null,
          createdDateFrom: filters.createdDateFrom ?? null,
          createdDateTo: filters.createdDateTo ?? null,
          editDateFrom: filters.editDateFrom ?? null,
          editDateTo: filters.editDateTo ?? null,
          projectTagIds: filters.projectTagIds ?? null,
          taskTypeIds: filters.taskTypeIds ?? null
        }
      };
    }

    return filtersRequestData;
  }
}
