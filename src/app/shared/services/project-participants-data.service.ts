import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal, Signal } from '@angular/core';
import { DataService } from '@app/shared/services/data-service';
import { ProjectParticipantDTO } from '@app/shared/services/dtos/project-participants/project-participant.dto';
import { LoaderService } from '@app/shared/services/shared/loader.service';
import { ToastService } from '@app/shared/services/shared/toast.service';
import { UserStatus } from '@app/shared/types/enums/user-status.enum';
import { GroupUser } from '@app/shared/types/models/group/group-user.model';
import { Group } from '@app/shared/types/models/group/group.model';
import { ProjectParticipant } from '@app/shared/types/models/project/project-participant';
import { UserDTO } from '@app/shared/types/models/user/user-dto.model';
import { DataStore } from '@app/store/data-store';
import { IdsCollection } from '@app/store/ids-collection';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { GroupRole } from '../types/enums/group-role.enum';
import { ActiveProjectService } from './active-project.service';
import { ProjectParticipantFactory } from './factories/project-participant.factory';

/**
 * ProjectParticipantsDataService - Project participants and groups in the data store.
 *
 * Loads participants for {@link ActiveProjectService.activeProjectId} when it changes (constructor `effect`),
 * replacing the previous `ActiveProjectSet` notification hook.
 *
 * Scope: Global (`providedIn: 'root'`).
 *
 * Usage: Project participants UI, task filters, and {@link TasksActionsService}.
 *
 * Architecture:
 * - {@link ProjectParticipantsDataService}: Store and HTTP for participants/groups
 * - {@link ActiveProjectService}: Drives default load for the active project
 */
const MOCK_PROJECT_PARTICIPANTS_PROJECT_ID = '656e918f-6b5e-463e-ad4f-1146e86617e5';
const MOCK_ZERO_PROJECT_ID = '00000000-0000-0000-0000-000000000000';

const MOCK_USERS_BY_ID: Record<string, UserDTO> = {
  '596f379c-35df-44a5-a13e-8375714761ec': {
    id: '596f379c-35df-44a5-a13e-8375714761ec',
    email: 'mikolaj.bozecki8@gmail.com',
    firstName: 'Mikołaj ',
    lastName: 'Bożęcki ',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.DELETED,
    createdAt: new Date('2025-09-27T12:50:40.574657Z'),
    lastActivityDate: new Date('2025-10-27T15:31:08.371217Z'),
    updatedAt: new Date('2026-01-13T13:18:31.559389Z'),
    activatedAt: new Date('2025-09-29T08:17:23.478177Z')
  },
  '632ceed0-5251-42a6-b5ba-f509c3afdbca': {
    id: '632ceed0-5251-42a6-b5ba-f509c3afdbca',
    email: 'r.pietraszewski75@gmail.com',
    firstName: 'Rafał',
    lastName: 'Pietraszewski',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2023-04-04T10:03:46.941908Z'),
    lastActivityDate: new Date('2026-01-07T11:50:10.35461Z'),
    updatedAt: new Date('2026-01-07T11:50:10.495853Z'),
    activatedAt: new Date('2023-04-04T15:07:26.147579Z'),
    address: '',
    phoneNumbers: ''
  },
  'ddef1ffc-ecb3-4224-ae77-2621fcf1f3f2': {
    id: 'ddef1ffc-ecb3-4224-ae77-2621fcf1f3f2',
    email: 'kubanam1995@gmail.com',
    firstName: 'Kuba',
    lastName: 'Nam',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2025-10-06T16:28:08.878003Z'),
    lastActivityDate: new Date('2026-01-07T13:58:51.801467Z'),
    updatedAt: new Date('2026-01-07T13:58:51.953258Z'),
    activatedAt: new Date('2025-10-06T16:31:43.833394Z')
  },
  '932b811d-0af0-423d-a673-29d513edc039': {
    id: '932b811d-0af0-423d-a673-29d513edc039',
    email: 'piotr@proffeo.net',
    firstName: 'Piotr@Proffeo ',
    lastName: 'Net',
    notes: 'Multi company user',
    profileCompletion: 100,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-03-13T21:20:42.564067Z'),
    lastActivityDate: new Date('2026-01-06T23:56:57.491135Z'),
    updatedAt: new Date('2026-01-23T20:29:55.464496Z'),
    activatedAt: new Date('2025-04-04T14:11:11.084261Z'),
    blockedAt: new Date('2025-04-04T14:11:09.191067Z')
  },
  'febbab2f-5ad4-4225-8b1f-1f9ea84b8a1e': {
    id: 'febbab2f-5ad4-4225-8b1f-1f9ea84b8a1e',
    email: 'j.biernat955@gmail.com',
    firstName: 'Joanna',
    lastName: 'Biernat',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.DELETED,
    createdAt: new Date('2025-09-27T13:18:29.481081Z'),
    lastActivityDate: new Date('2025-10-22T09:29:39.49796Z'),
    updatedAt: new Date('2026-01-13T13:18:36.257116Z'),
    activatedAt: new Date('2025-09-29T16:43:21.954893Z')
  },
  'babcb2de-c990-4c75-9289-f0974784a532': {
    id: 'babcb2de-c990-4c75-9289-f0974784a532',
    email: 'szymon20005920@gmail.com',
    firstName: 'Szymon ',
    lastName: 'Enderman',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2025-03-18T10:26:19.612836Z'),
    lastActivityDate: new Date('2026-01-07T08:15:18.192981Z'),
    updatedAt: new Date('2026-01-07T08:15:18.376898Z'),
    activatedAt: new Date('2025-03-18T19:02:21.825303Z')
  },
  '3fc67e07-cc72-4f05-b3b0-f373b5394139': {
    id: '3fc67e07-cc72-4f05-b3b0-f373b5394139',
    email: 'admin@proffeo.net',
    firstName: 'Admin@Proffeo',
    lastName: 'Net',
    profileCompletion: 0,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-02-21T13:54:40.464099Z'),
    lastActivityDate: new Date('2024-05-16T19:47:25.604759Z'),
    updatedAt: new Date('2025-09-12T22:35:13.372729Z'),
    activatedAt: new Date('2024-03-06T11:31:59.464101Z')
  },
  '019cf825-85a8-7080-b9ba-be71c290931b': {
    id: '019cf825-85a8-7080-b9ba-be71c290931b',
    email: 'klaudia.szczepanska.x@gmail.com',
    firstName: 'Klaudia',
    lastName: 'Szczepańska',
    notes: 'sad',
    profileCompletion: 100,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2026-03-16T19:35:34.570257Z'),
    updatedAt: new Date('2026-04-02T18:47:13.692486Z'),
    activatedAt: new Date('2026-03-25T11:35:38.998533Z'),
    address: 'asd',
    phoneNumbers: '111111111'
  },
  '24ab23c2-69cb-4a20-b7ef-84c65dfff80e': {
    id: '24ab23c2-69cb-4a20-b7ef-84c65dfff80e',
    email: 'maciek@gube.dev',
    firstName: 'Maciek ',
    lastName: 'Guba',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.DELETED,
    createdAt: new Date('2024-11-16T22:15:34.35461Z'),
    lastActivityDate: new Date('2025-12-22T13:03:29.339978Z'),
    updatedAt: new Date('2026-01-13T13:19:11.609631Z'),
    activatedAt: new Date('2024-12-16T16:29:36.559724Z')
  },
  '2d666090-ae98-4f47-bcb9-4dea6216fef2': {
    id: '2d666090-ae98-4f47-bcb9-4dea6216fef2',
    email: 'piotr.artbygg@gmail.com',
    firstName: 'Piotr@Artbygg',
    lastName: 'gmail',
    profileCompletion: 0,
    status: UserStatus.INACTIVE,
    createdAt: new Date('2025-04-27T18:53:47.31547Z'),
    updatedAt: new Date('2026-03-20T15:26:13.232398Z'),
    address: 'sdfgh',
    phoneNumbers: '333333333'
  },
  'ec1b7e30-194c-466a-a7c6-0c34de58a7ba': {
    id: 'ec1b7e30-194c-466a-a7c6-0c34de58a7ba',
    email: 'zysko.marek@gmail.com',
    firstName: 'Marek',
    lastName: 'Zysko',
    notes: '12345',
    profileCompletion: 100,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2026-01-15T19:37:48.130516Z'),
    updatedAt: new Date('2026-04-02T19:04:14.50626Z'),
    activatedAt: new Date('2026-01-15T19:40:50.772268Z'),
    address: 'asda',
    phoneNumbers: '531 876 444'
  },
  'bf68c2e3-1e83-4d0e-b474-d24b5278644d': {
    id: 'bf68c2e3-1e83-4d0e-b474-d24b5278644d',
    email: 'admin@hmspartner.eu',
    firstName: 'Piotr',
    lastName: 'Reglinski',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2023-04-08T09:05:59.19549Z'),
    lastActivityDate: new Date('2024-05-15T18:53:42.326083Z'),
    updatedAt: new Date('2023-04-08T10:32:45.26415Z'),
    activatedAt: new Date('2023-04-08T10:21:45.338207Z'),
    address: '',
    phoneNumbers: ''
  },
  'e5279a59-11a2-4630-b46c-fee951cb1340': {
    id: 'e5279a59-11a2-4630-b46c-fee951cb1340',
    email: 'r.testowy75@gmail.com',
    firstName: 'Rafal',
    lastName: 'Testowy',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.INACTIVE,
    createdAt: new Date('2025-03-09T13:59:27.433557Z')
  }
};

const MOCK_GROUPS = {
  proffeo: {
    id: '25b1096c-8570-444f-98d0-2e8a9c5b6c73',
    name: 'Proffeo',
    companyId: '2b8cab41-ee72-4617-903c-f390ead12a36',
    hasChildren: false
  },
  frontend: {
    id: '344cb348-d8ec-4a60-905d-22306e1ab423',
    name: 'FE',
    companyId: '2b8cab41-ee72-4617-903c-f390ead12a36',
    parentGroupId: '25b1096c-8570-444f-98d0-2e8a9c5b6c73',
    hasChildren: true
  },
  mz: {
    id: '56893482-de74-4a95-9116-5a6a414e8003',
    name: 'MZ',
    companyId: '14ad9215-4548-4515-a568-5315b9150ae2',
    parentGroupId: '41c34099-f631-4d84-8b8e-63063cca6b09',
    hasChildren: true
  },
  hmsPartner: {
    id: '8d4084d6-175f-4b7b-8e11-f6e565e5e93c',
    name: 'HMS PARTNER ',
    companyId: '3f917935-1a13-4ffa-b018-f6fe5671d56f',
    hasChildren: false
  }
};

const projectParticipant = (
  id: string,
  group: (typeof MOCK_GROUPS)[keyof typeof MOCK_GROUPS],
  user: UserDTO,
  role: GroupRole = GroupRole.NONE
): ProjectParticipantDTO => ({
  group,
  id,
  projectId: MOCK_ZERO_PROJECT_ID,
  role,
  user
});

const MOCK_PROJECT_PARTICIPANTS: ProjectParticipantDTO[] = [
  projectParticipant('002df542-517b-4df9-9e2d-dea302475cb3', MOCK_GROUPS.proffeo, MOCK_USERS_BY_ID['596f379c-35df-44a5-a13e-8375714761ec']),
  projectParticipant('03562a12-484c-46b1-9423-7fcdacf1f9d1', MOCK_GROUPS.frontend, MOCK_USERS_BY_ID['632ceed0-5251-42a6-b5ba-f509c3afdbca']),
  projectParticipant('181dff02-3b20-4dbc-b9c2-d1182c8a7c51', MOCK_GROUPS.proffeo, MOCK_USERS_BY_ID['632ceed0-5251-42a6-b5ba-f509c3afdbca']),
  projectParticipant('1e244c8a-1b94-4da3-b4f3-330d579f8114', MOCK_GROUPS.frontend, MOCK_USERS_BY_ID['ddef1ffc-ecb3-4224-ae77-2621fcf1f3f2']),
  projectParticipant('36b3533c-f458-4dc8-a327-9c14e2c98840', MOCK_GROUPS.proffeo, MOCK_USERS_BY_ID['932b811d-0af0-423d-a673-29d513edc039']),
  projectParticipant('5067b6f5-7734-4113-981c-1ffde7bb5a84', MOCK_GROUPS.proffeo, MOCK_USERS_BY_ID['febbab2f-5ad4-4225-8b1f-1f9ea84b8a1e']),
  projectParticipant('646e75fc-7e04-4a17-b8eb-36fb908bd078', MOCK_GROUPS.proffeo, MOCK_USERS_BY_ID['babcb2de-c990-4c75-9289-f0974784a532']),
  projectParticipant('744ab0a2-86aa-4bfb-8dbd-3865b93c8ad1', MOCK_GROUPS.frontend, MOCK_USERS_BY_ID['3fc67e07-cc72-4f05-b3b0-f373b5394139']),
  projectParticipant('819af7f3-1e30-4d94-a288-e6cb0ccb581a', MOCK_GROUPS.proffeo, MOCK_USERS_BY_ID['ddef1ffc-ecb3-4224-ae77-2621fcf1f3f2']),
  projectParticipant('76a613ee-7142-4d62-aa72-0227421751e0', MOCK_GROUPS.proffeo, MOCK_USERS_BY_ID['24ab23c2-69cb-4a20-b7ef-84c65dfff80e']),
  projectParticipant('8d6e5b5c-3b23-46d6-993c-57efeb97fb31', MOCK_GROUPS.frontend, MOCK_USERS_BY_ID['932b811d-0af0-423d-a673-29d513edc039']),
  projectParticipant('a5e6bc89-7771-41ff-a175-c1f40b25480c', MOCK_GROUPS.mz, MOCK_USERS_BY_ID['019cf825-85a8-7080-b9ba-be71c290931b']),
  projectParticipant('aef02b00-11da-48f6-b523-300662d4993f', MOCK_GROUPS.frontend, MOCK_USERS_BY_ID['2d666090-ae98-4f47-bcb9-4dea6216fef2']),
  projectParticipant('bb0ccba9-2de2-4c12-9bdf-90c6cc6d5196', MOCK_GROUPS.mz, MOCK_USERS_BY_ID['ec1b7e30-194c-466a-a7c6-0c34de58a7ba'], GroupRole.ADMIN),
  projectParticipant('c00d3edf-aae4-4671-a724-4e8118291760', MOCK_GROUPS.hmsPartner, MOCK_USERS_BY_ID['bf68c2e3-1e83-4d0e-b474-d24b5278644d'], GroupRole.ADMIN),
  projectParticipant('cd4c8a4f-ad47-4ed0-8733-1a25a532b391', MOCK_GROUPS.frontend, MOCK_USERS_BY_ID['ec1b7e30-194c-466a-a7c6-0c34de58a7ba'], GroupRole.ADMIN),
  projectParticipant('d4bae557-81c8-4e81-8341-6bd3f408ad72', MOCK_GROUPS.proffeo, MOCK_USERS_BY_ID['3fc67e07-cc72-4f05-b3b0-f373b5394139'], GroupRole.ADMIN),
  projectParticipant('e0233e12-b317-44a6-857e-3b337aab23f4', MOCK_GROUPS.frontend, MOCK_USERS_BY_ID['e5279a59-11a2-4630-b46c-fee951cb1340'])
];

@Injectable({ providedIn: 'root' })
export class ProjectParticipantsDataService extends DataService<ProjectParticipantDTO, ProjectParticipant> {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly loaderService: LoaderService = inject(LoaderService);
  private readonly projectParticipantFactory: ProjectParticipantFactory = inject(ProjectParticipantFactory);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly activeProjectService: ActiveProjectService = inject(ActiveProjectService);

  private participants: DataStore<ProjectParticipant> = new DataStore<ProjectParticipant>();
  private projectParticipants: DataStore<IdsCollection> = new DataStore<IdsCollection>();
  private readonly pendingProjectParticipantLoads = new Set<string>();

  public constructor() {
    super();
    effect(() => {
      const projectId = this.activeProjectService.activeProjectId();
      if (!projectId) {
        return;
      }
      this.loadProjectParticipants(projectId);
    });
  }
  public getProjectParticipants(projectId: string): Signal<ProjectParticipant[] | undefined> {
    if (!projectId) return signal(undefined);
    if (!this.projectParticipants.hasDataForId(projectId)) this.fetchProjectParticipants(projectId);

    return computed(() => {
      return (
        this.projectParticipants
          .get(projectId)()
          ?.ids?.map(id => this.participants.get(id)()) || []
      );
    });
  }

  public getProjectGroupAdmin(projectId: string, groupId: string): Signal<ProjectParticipant | undefined> {
    return computed(() => {
      return this.getProjectParticipants(projectId)()?.find(
        pp => pp.group()?.id === groupId && pp.role === GroupRole.ADMIN
      );
    });
  }

  public getProjectGroups(projectId: string): Signal<Group[]> {
    if (!projectId) {
      return signal([]);
    }

    return computed(() => {
      const participants = this.getProjectParticipants(projectId)() ?? [];
      const byGroupId = new Map<string, ProjectParticipant[]>();

      for (const participant of participants) {
        const group = participant.group();
        if (!group?.id) {
          continue;
        }
        const bucket = byGroupId.get(group.id);
        if (bucket) {
          bucket.push(participant);
        } else {
          byGroupId.set(group.id, [participant]);
        }
      }

      const result: Group[] = [];

      for (const groupParticipants of byGroupId.values()) {
        const sourceGroup = groupParticipants[0].group();
        if (!sourceGroup?.id) {
          continue;
        }

        const participantByUserId = new Map<string, ProjectParticipant>();
        for (const participant of groupParticipants) {
          const userId = participant.user()?.id;
          if (!userId) {
            continue;
          }
          if (!participantByUserId.has(userId)) {
            participantByUserId.set(userId, participant);
          }
        }

        const groupUsers = Array.from(participantByUserId.values()).map(
          participant =>
            new GroupUser({
              id: participant.id,
              groupId: sourceGroup.id,
              applicationUser: participant.user,
              role: participant.role
            })
        );

        result.push(
          new Group({
            childrenCount: sourceGroup.childrenCount,
            id: sourceGroup.id,
            name: sourceGroup.name,
            companyId: sourceGroup.companyId,
            parentGroupId: sourceGroup.parentGroupId,
            users: signal(groupUsers)
          })
        );
      }

      result.sort((left, right) =>
        (left.name ?? '').localeCompare(right.name ?? '', undefined, { sensitivity: 'base' })
      );

      return result;
    });
  }

  public loadProjectParticipants(projectId: string): void {
    if (!projectId) {
      return;
    }

    if (
      this.projectParticipants.hasDataForId(projectId) &&
      this.projectParticipants.get(projectId)()?.id !== undefined
    ) {
      return;
    }

    this.fetchProjectParticipants(projectId);
  }

  public getById(participantId: string): Signal<ProjectParticipant | undefined> {
    return computed(() => this.participants.get(participantId)());
  }

  public upsertLocalData(dto: ProjectParticipantDTO): Signal<ProjectParticipant> {
    return dto ? this.participants.upsert(this.projectParticipantFactory.produce(dto)) : signal(undefined);
  }

  protected fetchProjectParticipants(projectId: string): void {
    if (this.pendingProjectParticipantLoads.has(projectId)) {
      return;
    }

    this.pendingProjectParticipantLoads.add(projectId);
    queueMicrotask(() => {
      const projectParticipants =
        projectId === MOCK_PROJECT_PARTICIPANTS_PROJECT_ID ? MOCK_PROJECT_PARTICIPANTS : [];

      this.participants.upsertMany(
        projectParticipants.map(projectParticipant => this.projectParticipantFactory.produce(projectParticipant))
      );
      this.projectParticipants.upsert({
        id: projectId,
        ids: projectParticipants.map(projectParticipant => projectParticipant.id)
      });
      this.pendingProjectParticipantLoads.delete(projectId);
    });
  }

  public removeUsersFromGroup(projectId: string, group: Group, usersToRemoveIds: string[]): void {
    this.loaderService.startLoading();
    this.httpClient
      .post(environment.APIEndPoint + `projects/${projectId}/participants/groups/${group.id}/remove-users`, {
        applicationUserIds: usersToRemoveIds
      })
      .subscribe({
        next: (projectParticipants: ProjectParticipantDTO[]) => {
          this.projectParticipants.upsert({
            id: projectId,
            ids: projectParticipants.map(_ => _.id)
          });

          usersToRemoveIds.forEach(ppId => this.participants.delete(ppId));

          this.toastService.success(
            this.translateService.instant('project-participants.toasts.user-successfully-removed')
          );
        },
        error: () => this.loaderService.stopLoading(),
        complete: () => this.loaderService.stopLoading()
      });
  }

  public addUsersToGroup(projectId: string, group: Group, usersToAddIds: string[]): void {
    this.loaderService.startLoading();
    this.httpClient
      .post<ProjectParticipantDTO[]>(
        environment.APIEndPoint + `projects/${projectId}/participants/groups/${group.id}/add-users`,
        {
          applicationUserIds: usersToAddIds
        }
      )
      .subscribe({
        next: (projectParticipants: ProjectParticipantDTO[]) => {
          this.participants.upsertMany(
            projectParticipants.map(projectParticipant => this.projectParticipantFactory.produce(projectParticipant))
          );

          this.projectParticipants.upsert({
            id: projectId,
            ids: projectParticipants.map(_ => _.id)
          });

          this.toastService.success(
            this.translateService.instant('project-participants.toasts.user-successfully-added')
          );
        },
        error: () => this.loaderService.stopLoading(),
        complete: () => this.loaderService.stopLoading()
      });
  }

  public addGroups(projectId: string, groupsToAddIds: string[]): void {
    this.loaderService.startLoading();
    this.httpClient
      .post<ProjectParticipantDTO[]>(environment.APIEndPoint + `projects/${projectId}/participants/groups`, {
        groupIds: groupsToAddIds
      })
      .subscribe({
        next: (addedParticipants: ProjectParticipantDTO[]) => {
          this.participants.upsertMany(
            addedParticipants.map(projectParticipant => this.projectParticipantFactory.produce(projectParticipant))
          );
          const existingGroupChildren: string[] = this.projectParticipants.get(projectId)().ids ?? [];
          this.projectParticipants.upsert({
            id: projectId,
            ids: existingGroupChildren.concat(...addedParticipants.map(participant => participant.id))
          });
          this.toastService.success(
            this.translateService.instant('project-participants.toasts.groups-successfully-added')
          );
        },
        error: () => this.loaderService.stopLoading(),
        complete: () => this.loaderService.stopLoading()
      });
  }

  public removeGroupById(projectId: string, groupId: string): void {
    this.loaderService.startLoading();
    this.httpClient.delete(environment.APIEndPoint + `projects/${projectId}/participants/groups/` + groupId).subscribe({
      next: () => {
        if (this.projectParticipants.hasDataForId(projectId)) {
          const allProjectParticipants = this.projectParticipants.get(projectId)();

          let newProjectParticipants = [...allProjectParticipants.ids];
          const participantsToRemove = [];

          allProjectParticipants.ids.forEach(ppId => {
            if (this.participants.hasDataForId(ppId)) {
              const projectParticpant = this.participants.get(ppId)();
              if (projectParticpant.group().id === groupId) {
                participantsToRemove.push(projectParticpant);
                newProjectParticipants = newProjectParticipants.filter(_ => _ !== ppId);
              }
            }
          });

          this.projectParticipants.upsert({
            id: projectId,
            ids: newProjectParticipants
          });

          participantsToRemove.forEach(pp => this.participants.delete(pp));
        }

        this.toastService.success(
          this.translateService.instant('project-participants.toasts.groups-successfully-removed')
        );
      },
      error: () => this.loaderService.stopLoading(),
      complete: () => this.loaderService.stopLoading()
    });
  }
}
