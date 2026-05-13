import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { ModalComponent } from '@app/shared/components/modal/modal.component';
import { ProjectTaskUserRole } from '@app/shared/types/enums/project-task-user-role.enum';
import { TaskUserRoleFilter } from '@app/shared/types/models/task/task-filters.model';
import { User } from '@app/shared/types/models/user/user.model';
import { TranslateModule } from '@ngx-translate/core';

export interface SelectUserRoleModalData {
  availableUsers: User[];
  availableGroupAdmins: User[];
  availableIndustryAdmins: User[];
  selectedUserRole: TaskUserRoleFilter[];
}

@Component({
  selector: 'proffeo-select-user-role-modal',
  templateUrl: './select-user-role-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, ModalComponent, ButtonComponent, MatDialogClose, MatFormFieldModule, MatSelectModule]
})
export class UserRoleFilterModalComponent implements OnInit {
  private readonly dialogRef: MatDialogRef<UserRoleFilterModalComponent, TaskUserRoleFilter[]> =
    inject<MatDialogRef<UserRoleFilterModalComponent, TaskUserRoleFilter[]>>(MatDialogRef);

  protected readonly ButtonType: typeof ButtonType = ButtonType;
  protected readonly ProjectTaskUserRole: typeof ProjectTaskUserRole = ProjectTaskUserRole;
  protected readonly data = inject<SelectUserRoleModalData>(MAT_DIALOG_DATA);

  protected selectedUserUserId: WritableSignal<string> = signal<string>(undefined);
  protected selectedIndustryAdminUserId: WritableSignal<string> = signal<string>(undefined);
  protected selectedGroupAdminUserId: WritableSignal<string> = signal<string>(undefined);

  public ngOnInit(): void {
    const initiallySelectedUserRoles = this.data.selectedUserRole ?? [];
    initiallySelectedUserRoles.forEach(filterValue => this.applyFilterValue(filterValue));
  }

  private applyFilterValue(filterValue: TaskUserRoleFilter): void {
    switch (filterValue.role) {
      case ProjectTaskUserRole.USER:
        return this.selectedUserUserId.set(filterValue.applicationUserId);
      case ProjectTaskUserRole.INDUSTRY_ADMIN:
        return this.selectedIndustryAdminUserId.set(filterValue.applicationUserId);
      case ProjectTaskUserRole.GROUP_ADMIN:
        return this.selectedGroupAdminUserId.set(filterValue.applicationUserId);
    }
  }

  protected save(): void {
    const result: TaskUserRoleFilter[] = [
      { role: ProjectTaskUserRole.USER, applicationUserId: this.selectedUserUserId() },
      { role: ProjectTaskUserRole.INDUSTRY_ADMIN, applicationUserId: this.selectedIndustryAdminUserId() },
      { role: ProjectTaskUserRole.GROUP_ADMIN, applicationUserId: this.selectedGroupAdminUserId() }
    ];
    this.dialogRef.close(result);
  }
}
