import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal, Signal, untracked } from '@angular/core';
import { DataService } from '@app/shared/services/data-service';
import { TagDTO } from '@app/shared/services/dtos/project-tag/tag.dto';
import { LoaderService } from '@app/shared/services/shared/loader.service';
import { ToastService } from '@app/shared/services/shared/toast.service';
import { CreateProjectTagRequestBody, Tag, UpdateProjectTagRequestBody } from '@app/shared/types/models/tag/tag.model';
import { DataStore } from '@app/store/data-store';
import { IdsCollection } from '@app/store/ids-collection';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { finalize, Observable, tap } from 'rxjs';
import { ActiveProjectService } from './active-project.service';
import { ProjectTagFactory } from './factories/project-tag.factory';

/**
 * TagsDataService - Project tags and task-tag associations in the store.
 *
 * Loads project tags when {@link ActiveProjectService.activeProjectId} changes (constructor `effect`).
 *
 * Scope: Global (`providedIn: 'root'`).
 *
 * Usage: Tag management views, task filters, and task tagging flows.
 *
 * Architecture:
 * - {@link TagsDataService}: Store and HTTP
 * - {@link ActiveProjectService}: Triggers load for the active project’s tags
 */
const MOCK_PROJECT_TAGS_PROJECT_ID = '656e918f-6b5e-463e-ad4f-1146e86617e5';

const MOCK_PROJECT_TAGS: TagDTO[] = [
  {
    id: '30bf6021-1368-4b45-beb0-3de59bae33c6',
    description: '',
    hexColor: '#ff9300',
    name: 'Sprint 3',
    projectId: MOCK_PROJECT_TAGS_PROJECT_ID
  },
  {
    id: '00cc776c-eb13-4f40-9df9-f765ceda7ae3',
    description: '',
    hexColor: '#76bb40',
    name: 'Mobile',
    projectId: MOCK_PROJECT_TAGS_PROJECT_ID
  },
  {
    id: '29c02865-4504-4718-abd1-13b72cb2fb8d',
    description: '',
    hexColor: '#371a94',
    name: 'Desktop',
    projectId: MOCK_PROJECT_TAGS_PROJECT_ID
  },
  {
    id: '36d7bedc-528c-4cce-8ffa-569232fd03f9',
    description: 'Taski czekające na akceptację biznesu/wyceny',
    hexColor: '#636363',
    name: 'Backlog',
    projectId: MOCK_PROJECT_TAGS_PROJECT_ID
  },
  {
    id: 'f0db9133-2dd7-46fa-ae2f-dfc4dbe9c761',
    description: 'Backend',
    hexColor: '#c4bc00',
    name: 'BE',
    projectId: MOCK_PROJECT_TAGS_PROJECT_ID
  },
  {
    id: 'd29ac5db-cbb6-4c05-ac76-1481cfbb49e9',
    description: 'Frontend',
    hexColor: '#ed1287',
    name: 'FE',
    projectId: MOCK_PROJECT_TAGS_PROJECT_ID
  },
  {
    id: 'f067d300-c65e-486d-a053-6c1c4c40e6e1',
    description: '',
    hexColor: '#ff2600',
    name: 'BUG',
    projectId: MOCK_PROJECT_TAGS_PROJECT_ID
  },
  {
    id: 'c6db369c-4653-474f-9f9d-17633afdf28d',
    description: '',
    hexColor: '#669d34',
    name: 'V4.2',
    projectId: MOCK_PROJECT_TAGS_PROJECT_ID
  },
  {
    id: 'ff1d097a-d4a0-46d7-9492-5f28075b26e2',
    description: '',
    hexColor: '#874efe',
    name: 'V4.1',
    projectId: MOCK_PROJECT_TAGS_PROJECT_ID
  },
  {
    id: 'e3785568-f839-4c50-a456-93b5bcd33669',
    description: '',
    hexColor: '#00eeff',
    name: 'Klaudia',
    projectId: MOCK_PROJECT_TAGS_PROJECT_ID
  },
  {
    id: 'fd163aa0-0fe9-45a8-80fb-2d45b4ea049a',
    description: '',
    hexColor: '#2c9d15',
    name: 'Refaktor',
    projectId: MOCK_PROJECT_TAGS_PROJECT_ID
  },
  {
    id: '9a9a922f-6ff9-4b54-91b4-fcd0dc866777',
    description: 'Tag testowy',
    hexColor: '#ff0000',
    name: 'Do omówienia',
    projectId: MOCK_PROJECT_TAGS_PROJECT_ID
  },
  {
    id: 'e6befc73-4d0e-4e2c-86e9-456a0e3966cc',
    description: 'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    hexColor: '#0e0977',
    name: 'ABC',
    projectId: MOCK_PROJECT_TAGS_PROJECT_ID
  }
];

const mockProjectTagById = (tagId: string): TagDTO => MOCK_PROJECT_TAGS.find(tag => tag.id === tagId)!;

const MOCK_TASK_TAGS: Record<string, TagDTO[]> = {
  '6a65b8bf-e9ed-42a9-98cf-85456d6b0344': [
    mockProjectTagById('d29ac5db-cbb6-4c05-ac76-1481cfbb49e9'),
    mockProjectTagById('ff1d097a-d4a0-46d7-9492-5f28075b26e2'),
    mockProjectTagById('e3785568-f839-4c50-a456-93b5bcd33669')
  ],
  'd40b0efe-7fd7-4d76-b495-9f631494cc7d': [
    mockProjectTagById('d29ac5db-cbb6-4c05-ac76-1481cfbb49e9'),
    mockProjectTagById('ff1d097a-d4a0-46d7-9492-5f28075b26e2'),
    mockProjectTagById('e3785568-f839-4c50-a456-93b5bcd33669')
  ],
  '07c4a3ea-98b7-4a59-9367-eacf954c4988': [
    mockProjectTagById('f0db9133-2dd7-46fa-ae2f-dfc4dbe9c761'),
    mockProjectTagById('d29ac5db-cbb6-4c05-ac76-1481cfbb49e9'),
    mockProjectTagById('ff1d097a-d4a0-46d7-9492-5f28075b26e2')
  ],
  '895940c3-3a0b-421f-ae46-19ea4e9c21a5': [
    mockProjectTagById('e3785568-f839-4c50-a456-93b5bcd33669'),
    mockProjectTagById('ff1d097a-d4a0-46d7-9492-5f28075b26e2')
  ],
  '1bef599f-cac4-4749-82fa-58bbe1afc630': [mockProjectTagById('e3785568-f839-4c50-a456-93b5bcd33669')]
};

@Injectable({ providedIn: 'root' })
export class TagsDataService extends DataService<TagDTO, Tag> {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly loaderService: LoaderService = inject(LoaderService);
  private readonly projectTagFactory: ProjectTagFactory = inject(ProjectTagFactory);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly translateService: TranslateService = inject(TranslateService);

  private readonly activeProjectService: ActiveProjectService = inject(ActiveProjectService);
  private tags: DataStore<Tag> = new DataStore<Tag>();
  private projectTags: DataStore<IdsCollection> = new DataStore<IdsCollection>();
  private taskTags: DataStore<IdsCollection> = new DataStore<IdsCollection>();
  private readonly pendingProjectTagLoads = new Set<string>();
  private readonly pendingTaskTagLoads = new Set<string>();

  public constructor() {
    super();
    effect(() => {
      const projectId = this.activeProjectService.activeProjectId();
      if (!projectId) {
        return;
      }
      untracked(() => {
        this.loadProjectTags(projectId);
      });
    });
  }

  public getProjectTags(projectId: string): Signal<Tag[] | undefined> {
    if (!projectId) {
      return signal([]);
    }

    if (!this.projectTags.hasDataForId(projectId)) {
      this.fetchProjectTags(projectId);
    }

    return computed(
      () =>
        this.projectTags
          .get(projectId)()
          ?.ids?.map(id => this.tags.get(id)()) || []
    );
  }

  public getById(tagId: string): Signal<Tag | undefined> {
    return computed(() => this.tags.get(tagId)());
  }

  public getTaskTags(taskId: string): Signal<Tag[] | undefined> {
    if (!taskId) {
      return signal(undefined);
    }

    if (!this.taskTags.hasDataForId(taskId)) {
      this.fetchTaskTags(taskId);
    }

    return computed(
      () =>
        this.taskTags
          .get(taskId)()
          ?.ids?.map(id => this.tags.get(id)()) || []
    );
  }

  public loadProjectTags(projectId: string): void {
    if (this.projectTags.hasDataForId(projectId)) {
      return;
    }
    this.fetchProjectTags(projectId);
  }

  public updateTag(projectId: string, tagId: string, request: UpdateProjectTagRequestBody): Observable<TagDTO> {
    this.loaderService.startLoading();
    return this.httpClient.put<TagDTO>(environment.APIEndPoint + `projects/${projectId}/tags/${tagId}`, request).pipe(
      tap((tag: TagDTO) => {
        this.upsertLocalData(tag);
        this.toastService.success(
          this.translateService.instant('project-tags.toasts.successfully-edited', {
            tagName: tag.name
          })
        );
      }),
      finalize(() => this.loaderService.stopLoading())
    );
  }

  public createTag(projectId: string, request: CreateProjectTagRequestBody): Observable<TagDTO> {
    this.loaderService.startLoading();
    return this.httpClient.post<TagDTO>(environment.APIEndPoint + `projects/${projectId}/tags`, request).pipe(
      tap((tag: TagDTO) => {
        this.upsertLocalData(tag);
        const existingProjectTags: string[] = this.projectTags.get(projectId)().ids ?? [];
        this.projectTags.upsert({ id: projectId, ids: existingProjectTags.concat(tag.id) });
        this.toastService.success(
          this.translateService.instant('project-tags.toasts.successfully-created', {
            tagName: tag.name
          })
        );
      }),
      finalize(() => this.loaderService.stopLoading())
    );
  }

  public deleteTag(projectId: string, tag: Tag): Observable<void> {
    this.loaderService.startLoading();
    return this.httpClient.delete<void>(environment.APIEndPoint + `projects/${projectId}/tags/${tag.id}`).pipe(
      tap(() => {
        const existingProjectTags: string[] = this.projectTags.get(projectId)().ids ?? [];
        this.projectTags.upsert({
          id: projectId,
          ids: existingProjectTags.filter(existingTag => existingTag !== tag.id)
        });
        this.tags.delete(tag.id);
        this.toastService.success(
          this.translateService.instant('project-tags.toasts.successfully-deleted', {
            tagName: tag.name
          })
        );
      }),
      finalize(() => this.loaderService.stopLoading())
    );
  }

  public fetchProjectTags(projectId: string): void {
    if (this.pendingProjectTagLoads.has(projectId)) {
      return;
    }

    this.pendingProjectTagLoads.add(projectId);
    queueMicrotask(() => {
      const tags = projectId === MOCK_PROJECT_TAGS_PROJECT_ID ? MOCK_PROJECT_TAGS : [];

      this.tags.upsertMany(tags.map(itm => this.projectTagFactory.produce(itm)));

      this.projectTags.upsert({
        id: projectId,
        ids: tags.map(itm => itm.id)
      });
      this.pendingProjectTagLoads.delete(projectId);
    });
  }

  public fetchTaskTags(taskId: string): void {
    if (this.pendingTaskTagLoads.has(taskId)) {
      return;
    }

    this.pendingTaskTagLoads.add(taskId);
    queueMicrotask(() => {
      const tags = MOCK_TASK_TAGS[taskId] ?? [];

      this.tags.upsertMany(tags.map(itm => this.projectTagFactory.produce(itm)));
      this.taskTags.upsert({
        id: taskId,
        ids: tags.map(itm => itm.id)
      });
      this.pendingTaskTagLoads.delete(taskId);
    });
  }

  public updateTaskTags(taskId: string, tagIds: string[]): Observable<TagDTO[]> {
    return this.httpClient.post<TagDTO[]>(environment.APIEndPoint + `tasks/${taskId}/tags`, { tagIds: tagIds }).pipe(
      tap((tags: TagDTO[]) => {
        this.tags.upsertMany(tags.map(itm => this.projectTagFactory.produce(itm)));
        this.taskTags.upsert({
          id: taskId,
          ids: tags.map(itm => itm.id)
        });

        this.toastService.success(this.translateService.instant('project-tags.toasts.successfully-added-to-task'));
      })
    );
  }

  public upsertLocalData(dto: TagDTO): Signal<Tag> {
    return dto ? this.tags.upsert(this.projectTagFactory.produce(dto)) : signal(undefined);
  }
}
