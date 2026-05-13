import { computed, Signal, WritableSignal } from '@angular/core';
import { Currency } from '@app/shared/types/enums/currency.enum';
import { Company } from '@app/shared/types/models/company/company.model';
import { DropdownItem } from '@app/shared/types/models/shared/dropdown-item';
import { IdBased } from '@app/shared/types/models/shared/id-based.model';
import { User } from '@app/shared/types/models/user/user.model';
import { environment } from '@env/environment';
import { ProjectEstimation } from './project-estimation';
import { ProjectStatistic } from './project-statistic';

export const Currencies: DropdownItem<string>[] = [
  { value: 'Pln', label: 'PLN' },
  { value: 'Eur', label: 'EUR' },
  { value: 'Usd', label: 'USD' }
];

export interface Money {
  amount: number;
  currency: Currency;
}

export interface ProjectEditModalData {
  projectToEdit: Project;
  isDraftList: boolean;
}

export interface SelectProjectSupervisorModalData {
  preselectedUser: User;
  selectedUser: WritableSignal<User>;
}

// export interface ProjectParticipant {
//   group: Group;
//   id: string;
//   projectId: string;
//   role: GroupRole;
//   user: User;
// }

// export class ProjectLocation {
//   public hasChildren: boolean;
//   public id: string;
//   public name?: string;
//   public orderNo: number;
//   public parentId?: string;
//   public parentLocation?: ProjectLocation;
//   public projectId: string;
//   public readOnly: boolean;

//   public get locationsPath(): ProjectLocation[] {
//     return this.parentLocation ? this.parentLocation.locationsPath.concat(this) : [this];
//   }

//   public constructor(data: Partial<ProjectLocation>, contextData: ContextData) {
//     Object.assign(this, data);

//     // if (!isNil(this.parentId)) {
//     //   const foundParentLocation: ProjectLocation = contextData.locations.find(
//     //     (location: ProjectLocation) => location.id === this.parentId
//     //   );
//     //   this.parentLocation = new ProjectLocation(foundParentLocation, contextData);
//     // }
//   }
// }

export class Project implements IdBased {
  public id: string;
  public name?: string;
  public description?: string;
  public avatarId?: string;
  public company: Signal<Company>;
  public startDate?: Date;
  public endDate?: Date;
  public address?: string;
  public supervisor: Signal<User>;
  public client: Signal<User>;
  public estimation: ProjectEstimation;
  public statistic: ProjectStatistic;

  public constructor(data: Partial<Project>) {
    Object.assign(this, data);
  }

  public get url(): Signal<string> {
    return computed(() => `${this.company()?.url}/projects/${this.id}`);
  }

  public get avatarUrl(): string {
    return this.avatarId
      ? `${environment.ServerUrl}avatars/Projects/${this.avatarId}.jpg`
      : `${environment.ServerUrl}avatars/Projects/defaultProjectAvatar.jpg`;
  }

  public getProjectTasksViewUrl(): string {
    return `companies/${this.company().id}/projects/${this.id}/tasks`;
  }
}
