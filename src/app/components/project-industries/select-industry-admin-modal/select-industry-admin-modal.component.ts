import { Component, inject, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { ModalComponent } from '@app/shared/components/modal/modal.component';
import { SelectUserListComponent } from '@app/shared/components/select-user-list/select-user-list.component';
import { ActiveCompanyService } from '@app/shared/services/active-company.service';
import { UsersDataService } from '@app/shared/services/users-data.service';
import { Company } from '@app/shared/types/models/company/company.model';
import { SelectIndustryAdminModalData } from '@app/shared/types/models/project-industry/project-industry.model';
import { User } from '@app/shared/types/models/user/user.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-select-industry-admin-modal',
  imports: [MatDialogModule, TranslateModule, ModalComponent, SelectUserListComponent, ButtonComponent],
  templateUrl: './select-industry-admin-modal.component.html'
})
export class SelectIndustryAdminModalComponent implements OnInit {
  private readonly activeCompanyService: ActiveCompanyService = inject(ActiveCompanyService);
  private readonly usersDataService: UsersDataService = inject(UsersDataService);
  private readonly dialogRef: MatDialogRef<SelectIndustryAdminModalComponent> = inject(
    MatDialogRef<SelectIndustryAdminModalComponent>
  );
  private readonly dialogData: SelectIndustryAdminModalData = inject(MAT_DIALOG_DATA);

  protected readonly ButtonType = ButtonType;
  protected readonly selectedUser: WritableSignal<string> = signal<string>(undefined);
  protected readonly preselectedUser: WritableSignal<string> = signal<string>(undefined);
  protected readonly activeCompany: Signal<Company | undefined> = this.activeCompanyService.activeCompany;
  protected readonly companyUsers: Signal<User[]> = this.usersDataService.getCompanyUsers(this.activeCompany()?.id);

  public constructor() {
    this.preselectedUser.set(this.dialogData.preselectedUser?.id);
  }

  public ngOnInit(): void {
    this.selectedUser.set(this.preselectedUser());
  }

  protected save(): void {
    this.dialogRef.close({
      selectedAdmin: this.selectedUser()
    });
  }
}
