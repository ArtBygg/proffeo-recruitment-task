import { computed, inject, Injectable, Signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SelectGroupsModalComponent } from '@app/components/modals/select-groups-modal/select-groups-modal.component';
import {
  SelectMultipleLocationsModalComponent,
  SelectMultipleLocationsModalResult
} from '@app/components/modals/select-multiple-locations-modal/select-multiple-locations-modal.component';
import { UserRoleFilterModalComponent } from '@app/components/modals/select-user-role-modal/select-user-role-modal.component';
import { AuthService } from '@app/shared/services/auth.service';
import { ModalService } from '@app/shared/services/shared/modal.service';
import { ProjectTaskUserRole } from '@app/shared/types/enums/project-task-user-role.enum';
import { SelectMode } from '@app/shared/types/enums/select-mode.enum';
import { TASK_SORT_FIELD_TRANSLATION_KEYS, TaskSortField } from '@app/shared/types/enums/task-sort-field';
import { Group } from '@app/shared/types/models/group/group.model';
import { Location } from '@app/shared/types/models/location/location.model';
import { ProjectParticipant } from '@app/shared/types/models/project/project-participant';
import { TaskFilters, TaskUserRoleFilter } from '@app/shared/types/models/task/task-filters.model';
import { User } from '@app/shared/types/models/user/user.model';
import { TranslateService } from '@ngx-translate/core';
import { TaskFiltersService } from './task-filters.service';

/**
 * TaskFiltersHelperService - Presentation helpers for task list filters (modals, labels, display strings).
 *
 * Does not expose filter state or options; reads {@link TaskFiltersService} only for internal use.
 * Components must inject {@link TaskFiltersService} to read or mutate filter state after modal results.
 *
 * Scope: Route-level instance via `providers` on the project tasks view (same injector as {@link TaskFiltersService}).
 *
 * Usage: Toolbar templates for sort labels, location/group/role picker entry points, date display parsing, and tooltip text.
 *
 * Architecture:
 * - {@link TaskFiltersService}: Authoritative state, URL sync, available options
 * - This service: Translate-backed labels, modal opening (streams), derived display strings
 */
@Injectable()
export class TaskFiltersHelperService {
  private readonly taskFiltersState: TaskFiltersService = inject(TaskFiltersService);
  private readonly modalService: ModalService = inject(ModalService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly authService: AuthService = inject(AuthService);

  private readonly filters: Signal<TaskFilters | null> = this.taskFiltersState.filters;
  private readonly parentLocations: Signal<Location[]> = this.taskFiltersState.parentLocations;
  private readonly allLocations: Signal<Location[]> = this.taskFiltersState.availableLocations;
  private readonly availableUsers: Signal<User[]> = this.taskFiltersState.availableUsers;
  private readonly availableGroupAdmins: Signal<User[]> = this.taskFiltersState.availableGroupAdmins;
  private readonly availableIndustryAdmins: Signal<User[]> = this.taskFiltersState.availableIndustryAdmins;
  private readonly availableGroups: Signal<Group[]> = this.taskFiltersState.availableGroups;
  private readonly availableProjectParticipants: Signal<ProjectParticipant[]> =
    this.taskFiltersState.availableProjectParticipants;

  public readonly locationsDisplayValue: Signal<string> = computed(() => {
    if (this.filters()?.noLocation) {
      return this.translateService.instant('task-filters.emptyValue') ?? '';
    }
    const selectedLocationIds = this.filters()?.location ?? [];
    if (!selectedLocationIds.length) return '';
    return selectedLocationIds
      .map(id => this.allLocations().find(location => location.id === id)?.name ?? '')
      .join(', ');
  });

  public getSortByLabel(value: TaskSortField): string {
    const key = TASK_SORT_FIELD_TRANSLATION_KEYS.get(value);
    return this.translateService.instant(key ?? '') ?? '';
  }

  public openSelectLocationsModal(): MatDialogRef<
    SelectMultipleLocationsModalComponent,
    SelectMultipleLocationsModalResult
  > {
    const selectedLocations: Location[] = (this.filters()?.location ?? [])
      .map(id => this.allLocations().find(location => location.id === id))
      .filter((location): location is Location => location !== null && location !== undefined);
    return this.modalService.openSelectMultipleLocationsModal({
      locations: this.parentLocations(),
      selectedLocations,
      noLocation: this.filters()?.noLocation ?? false
    });
  }

  public openSelectGroupsModal(): MatDialogRef<SelectGroupsModalComponent, Group[] | undefined> {
    const selectedGroups: Group[] = (this.filters()?.group ?? [])
      .map(id => this.availableGroups().find(group => group.id === id))
      .filter((group): group is Group => group !== null && group !== undefined);
    return this.modalService.openSelectGroupsModal({
      groups: this.availableGroups,
      lockedGroups: [],
      selectedGroups,
      selectionMode: SelectMode.MULTIPLE
    });
  }

  public openSelectUserRoleModal(): MatDialogRef<UserRoleFilterModalComponent, TaskUserRoleFilter[]> {
    const selectedUserRole = this.filters()?.userRole ?? [];
    return this.modalService.openSelectUserRoleModal({
      availableUsers: this.availableUsers(),
      availableGroupAdmins: this.availableGroupAdmins(),
      availableIndustryAdmins: this.availableIndustryAdmins(),
      selectedUserRole
    });
  }

  public groupsDisplayValue(): string {
    if (this.filters()?.noGroup) {
      return this.translateService.instant('task-filters.emptyValue') ?? '';
    }
    const selectedGroups = this.filters()?.group ?? [];
    if (!selectedGroups.length) return '';
    return selectedGroups.map(id => this.availableGroups().find(group => group.id === id)?.name ?? '').join(', ');
  }

  public userRoleDisplayValue(): string {
    const selectedUserRole = this.filters()?.userRole ?? [];
    if (!selectedUserRole.length) return '';
    const userById = new Map<string, User>(
      [...this.availableUsers(), ...this.availableGroupAdmins(), ...this.availableIndustryAdmins()].map(user => [
        user.id,
        user
      ])
    );
    const roleLabelKey = (role: ProjectTaskUserRole): string => {
      switch (role) {
        case ProjectTaskUserRole.USER:
          return 'task-filters.user-role-user';
        case ProjectTaskUserRole.INDUSTRY_ADMIN:
          return 'task-filters.user-role-industry-admin';
        case ProjectTaskUserRole.GROUP_ADMIN:
          return 'task-filters.user-role-group-admin';
        default:
          return role;
      }
    };
    return selectedUserRole
      .filter(
        userRoleFilter => userRoleFilter.applicationUserId !== null && userRoleFilter.applicationUserId !== undefined
      )
      .map(
        userRoleFilter =>
          `${userById.get(userRoleFilter.applicationUserId)?.fullName ?? userRoleFilter.applicationUserId} (${this.translateService.instant(roleLabelKey(userRoleFilter.role))})`
      )
      .join(', ');
  }

  public parseDateFromFilter(dateString: string | undefined): Date | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  public isDateRangeFilterActive(startDateFrom: string | undefined, startDateTo: string | undefined): boolean {
    return (
      (startDateFrom !== null && startDateFrom !== undefined) || (startDateTo !== null && startDateTo !== undefined)
    );
  }

  public toggleMyTasksFilter(): void {
    const currentUserId = this.authService.currentUser()?.id;
    const userIds = this.filters()?.user ?? [];
    if (userIds.length === 1 && userIds[0] === currentUserId) {
      this.taskFiltersState.updateFiltersField('user', []);
    } else {
      this.taskFiltersState.updateFiltersField('user', [currentUserId]);
    }
  }
}
