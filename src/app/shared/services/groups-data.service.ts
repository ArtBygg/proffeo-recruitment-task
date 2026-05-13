import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { LoaderService } from '@app/shared/services/shared/loader.service';
import { ToastService } from '@app/shared/services/shared/toast.service';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';

import { GroupUserDTO } from '@app/shared/services/dtos/group/group-user.dto';
import { DataStore } from '@app/store/data-store';
import { IdsCollection } from '@app/store/ids-collection';
import { Group } from '../types/models/group/group.model';
import { AppEvent } from '../types/models/notifications/app-event';
import { DataService } from './data-service';
import { CreateGroupRequest } from './dtos/group/create-group-request.dto';
import { GroupDTO } from './dtos/group/group.dto';
import { UpdateGroupRequest } from './dtos/group/update-group-request.dto';
import { GroupUserFactory } from './factories/group-user.factory';
import { GroupFactory } from './factories/group.factory';
import { UsersDataService } from './users-data.service';

@Injectable({ providedIn: 'root' })
export class GroupsDataService extends DataService<GroupDTO, Group> {
  private readonly groups: DataStore<Group> = new DataStore<Group>();
  private readonly groupChildren: DataStore<IdsCollection> = new DataStore<IdsCollection>();
  private readonly companyGroups: DataStore<IdsCollection> = new DataStore<IdsCollection>();

  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly groupFactory: GroupFactory = inject(GroupFactory);
  private readonly groupUserFactory: GroupUserFactory = inject(GroupUserFactory);
  private readonly loaderService: LoaderService = inject(LoaderService);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly usersService: UsersDataService = inject(UsersDataService);

  public getById(id: string): Signal<Group | undefined> {
    return computed(() => this.groups.get(id)());
  }

  public getCompanyGroups(companyId: string): Signal<Group[] | undefined> {
    return computed(() => {
      if (!companyId) {
        return undefined;
      }
      // Always read the store signal so this computed re-runs when fetch upserts (hasDataForId alone does not subscribe).
      const collection = this.companyGroups.get(companyId)();
      if (collection?.id === undefined) {
        return undefined;
      }
      const ids = collection.ids ?? [];
      return ids.map(id => this.getById(id)()).filter((g): g is Group => g !== undefined);
    });
  }

  public getGroupChildren(groupId: string): Signal<Signal<Group>[] | undefined> {
    if (!groupId) {
      return signal(undefined);
    }

    return computed(() => (this.groupChildren.get(groupId)()?.ids ?? []).map(id => this.getById(id)) || []);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected handleEvent(_event: AppEvent): void {
    // if (event.eventType == 'UserSignedIn'){
    //   this.loadCompanyGroups(event.data as string);
    // }
  }

  public loadCompanyGroups(companyId: string): void {
    if (!companyId) {
      return;
    }

    if (this.companyGroups.hasDataForId(companyId) && this.companyGroups.get(companyId)()?.id !== undefined) {
      return;
    }

    this.fetchCompanyGroups(companyId);
  }

  public upsertLocalData(dto: GroupDTO): Signal<Group> {
    if (!dto) {
      return signal(undefined);
    }
    this.updateGroupUserData(dto?.users);
    return this.groups.upsert(this.groupFactory.produce(dto));
  }

  public upsertOnlyNewLocalData(dto: GroupDTO): Signal<Group> {
    if (!dto) {
      return signal(undefined);
    }
    if (this.groups.hasDataForId(dto.id)) {
      return this.groups.get(dto.id);
    }
    return this.upsertLocalData(dto);
  }

  public fetchCompanyGroups(companyId: string): void {
    // this.loaderService.startLoading();

    this.httpClient.get<GroupDTO[]>(`${environment.APIV3EndPoint}companies/${companyId}/groups`).subscribe({
      next: (groups: GroupDTO[]) => {
        groups?.forEach(group => {
          this.updateGroupAndChildrenData(group);
        });
        this.companyGroups.upsert({
          id: companyId,
          ids: groups?.map(group => group.id) ?? []
        });
      }
      // error: () => this.loaderService.stopLoading(),
      // complete: () => this.loaderService.stopLoading()
    });
  }

  private updateGroupAndChildrenData(dto: GroupDTO): void {
    this.updateGroupData(dto);
    const children = dto.children ?? [];

    this.groupChildren.upsert({
      id: dto.id,
      ids: children.map(c => c.id)
    });

    children.forEach(child => this.updateGroupAndChildrenData(child));
    children.forEach(child => this.updateGroupAndChildrenData(child));
  }

  private updateGroupData(dto: GroupDTO): void {
    this.groups.upsert(this.groupFactory.produce(dto));
  }

  private updateGroupUserData(groupUsersDTO: GroupUserDTO[]): void {
    if (groupUsersDTO?.length) {
      groupUsersDTO.forEach(groupUserDto => {
        this.usersService.upsertLocalData(groupUserDto.applicationUser);
      });
    }
  }

  public addCompanyGroup(companyId: string, request: CreateGroupRequest): void {
    this.loaderService.startLoading();
    this.httpClient.post<GroupDTO>(environment.APIV3EndPoint + `companies/${companyId}/groups`, request).subscribe({
      next: (companyGroup: GroupDTO) => {
        this.updateGroupData(companyGroup);
        const existingParentGroupChildren: string[] = this.groupChildren.get(companyGroup.parentGroupId)().ids ?? [];
        this.groupChildren.upsert({
          id: companyGroup.parentGroupId,
          ids: existingParentGroupChildren.concat(companyGroup.id)
        });
        this.toastService.success(
          this.translateService.instant('company-groups.toasts.successfully-created', {
            value: companyGroup.name
          })
        );
      },
      error: () => this.loaderService.stopLoading(),
      complete: () => this.loaderService.stopLoading()
    });
    this.httpClient.post<GroupDTO>(environment.APIV3EndPoint + `companies/${companyId}/groups`, request).subscribe({
      next: (companyGroup: GroupDTO) => {
        this.updateGroupData(companyGroup);
        const existingParentGroupChildren: string[] = this.groupChildren.get(companyGroup.parentGroupId)().ids ?? [];
        this.groupChildren.upsert({
          id: companyGroup.parentGroupId,
          ids: existingParentGroupChildren.concat(companyGroup.id)
        });
        this.toastService.success(
          this.translateService.instant('company-groups.toasts.successfully-created', {
            value: companyGroup.name
          })
        );
      },
      error: () => this.loaderService.stopLoading(),
      complete: () => this.loaderService.stopLoading()
    });
  }

  public updateCompanyGroupName(companyId: string, group: Group, request: UpdateGroupRequest): void {
    this.loaderService.startLoading();
    this.httpClient
      .put<GroupDTO>(environment.APIV3EndPoint + `companies/${companyId}/groups/${group.id}`, request)
      .subscribe({
        next: (companyGroup: GroupDTO) => {
          this.updateGroupData(companyGroup);
          this.toastService.success(
            this.translateService.instant('company-groups.toasts.name-successfully-saved', {
              value: companyGroup.name
            })
          );
        },
        error: () => this.loaderService.stopLoading(),
        complete: () => this.loaderService.stopLoading()
      });
  }

  public deleteGroup(companyId: string, group: Group): void {
    this.loaderService.startLoading();
    this.httpClient.delete(environment.APIV3EndPoint + `companies/${companyId}/groups/${group.id}`).subscribe({
      next: () => {
        const existingParentGroupChildren: string[] = this.groupChildren.get(group.parentGroupId)().ids ?? [];
        this.groupChildren.upsert({
          id: group.parentGroupId,
          ids: existingParentGroupChildren.filter(existingGroup => existingGroup !== group.id)
        });
        this.groups.delete(group.id);
        if (this.groupChildren.hasDataForId(group.id)) {
          this.groupChildren.delete(group.id);
        }
        this.toastService.success(
          this.translateService.instant('company-groups.toasts.successfully-deleted', {
            value: group.name
          })
        );
      },
      error: () => this.loaderService.stopLoading(),
      complete: () => this.loaderService.stopLoading()
    });
    this.httpClient.delete(environment.APIV3EndPoint + `companies/${companyId}/groups/${group.id}`).subscribe({
      next: () => {
        const existingParentGroupChildren: string[] = this.groupChildren.get(group.parentGroupId)().ids ?? [];
        this.groupChildren.upsert({
          id: group.parentGroupId,
          ids: existingParentGroupChildren.filter(existingGroup => existingGroup !== group.id)
        });
        this.groups.delete(group.id);
        if (this.groupChildren.hasDataForId(group.id)) {
          this.groupChildren.delete(group.id);
        }
        this.toastService.success(
          this.translateService.instant('company-groups.toasts.successfully-deleted', {
            value: group.name
          })
        );
      },
      error: () => this.loaderService.stopLoading(),
      complete: () => this.loaderService.stopLoading()
    });
  }

  public removeUsersFromGroup(companyId: string, group: Group, usersToRemoveIds: string[]): void {
    this.loaderService.startLoading();
    this.httpClient
      .post<GroupUserDTO[]>(
        environment.APIV3EndPoint + `companies/${companyId}/groups/${group.id}/users/remove-users`,
        {
          applicationUserIds: usersToRemoveIds
        }
      )
      .subscribe({
        next: (data: GroupUserDTO[]) => {
          this.updateGroupUserData(data);

          this.groups.upsert({
            ...this.groups.get(group.id)(),
            users: data?.length
              ? signal(data.map(groupUserDTO => this.groupUserFactory.produce(groupUserDTO)))
              : signal([])
          });

          this.toastService.success(this.translateService.instant('company-groups.toasts.user-successfully-removed'));
        },
        error: () => this.loaderService.stopLoading(),
        complete: () => this.loaderService.stopLoading()
      });
  }

  public addUsersToGroup(companyId: string, group: Group, usersToAddIds: string[]): void {
    this.loaderService.startLoading();
    this.httpClient
      .post<GroupUserDTO[]>(environment.APIV3EndPoint + `companies/${companyId}/groups/${group.id}/users/add-users`, {
        applicationUserIds: usersToAddIds
      })
      .subscribe({
        next: (data: GroupUserDTO[]) => {
          this.updateGroupUserData(data);

          this.groups.upsert({
            ...this.groups.get(group.id)(),
            users: data?.length
              ? signal(data.map(groupUserDTO => this.groupUserFactory.produce(groupUserDTO)))
              : signal([])
          });

          this.toastService.success(this.translateService.instant('company-groups.toasts.user-successfully-added'));
        },
        error: () => this.loaderService.stopLoading(),
        complete: () => this.loaderService.stopLoading()
      });
  }

  public setGroupAdmin(companyId: string, group: Group, newAdminUserId: string): void {
    this.loaderService.startLoading();
    this.httpClient
      .post<GroupUserDTO[]>(`${environment.APIV3EndPoint}companies/${companyId}/groups/${group.id}/users/set-admin`, {
        applicationUserId: newAdminUserId
      })
      .subscribe({
        next: (data: GroupUserDTO[]) => {
          this.updateGroupUserData(data);

          this.groups.upsert({
            ...this.groups.get(group.id)(),
            users: data?.length
              ? signal(data.map(groupUserDTO => this.groupUserFactory.produce(groupUserDTO)))
              : signal([])
          });

          this.toastService.success(this.translateService.instant('company-groups.toasts.admin-successfully-added'));
        },
        error: () => this.loaderService.stopLoading(),
        complete: () => this.loaderService.stopLoading()
      });
  }
}
