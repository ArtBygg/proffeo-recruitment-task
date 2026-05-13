import { Signal } from '@angular/core';
import { User } from '@app/shared/types/models/user/user.model';
import { SelectMode } from '../../enums/select-mode.enum';
import { Industry } from '../industry/industry.model';

export interface SelectIndustryAdminModalData {
  preselectedUser: User;
}

export interface SelectIndustryAdminModalRequest {
  selectedAdmin: string;
  industry: ProjectIndustry;
}

export interface SelectIndustryModalData {
  industries: Signal<Industry[]>;
  selectedIndustries?: Industry[];
  title: string;
  selectMode?: SelectMode;
}

export class ProjectIndustry {
  public id: string;
  public administrator?: Signal<User>;
  public industry: Signal<Industry>;
  public projectId?: string;

  public constructor(data: ProjectIndustry) {
    Object.assign(this, data);
  }
}
