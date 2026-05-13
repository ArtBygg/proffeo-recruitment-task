import { NgClass } from '@angular/common';
import { Component, DestroyRef, inject, input, InputSignal, model, ModelSignal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from '@app/shared/components/checkbox/checkbox.component';
import { UserRole } from '@app/shared/types/models/user-role/user.role';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-select-user-roles-list',
  imports: [TranslateModule, CheckboxComponent, ReactiveFormsModule, NgClass],
  templateUrl: './select-user-roles-list.component.html'
})
export class SelectUserRolesListComponent implements OnInit {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  protected readonly selectAllControl: FormControl<boolean> = new FormControl(false);

  public readonly originalUsersRoles = input<UserRole[]>(undefined);
  public readonly preselectedRoles: InputSignal<UserRole[]> = input<UserRole[]>();
  public selectedRoles: ModelSignal<UserRole[]> = model<UserRole[]>();
  public roleControls: Map<string, FormControl> = new Map();

  public ngOnInit(): void {
    this.handleSelectAllControl();
    this.originalUsersRoles()?.forEach((role: UserRole): void => {
      const isSelected: boolean = this.preselectedRoles().includes(role);
      this.roleControls.set(role?.id, new FormControl(isSelected));
    });

    if (this.areAllSelected()) {
      this.selectAllControl.setValue(true);
    }
  }

  protected areAllSelected(): boolean {
    return Array.from(this.roleControls.values()).every((control: FormControl) => control.value);
  }

  private handleSelectAllControl(): void {
    this.selectAllControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.roleControls.forEach((control: FormControl) => {
        if (control.enabled) {
          control.setValue(value);
        }
        if (value) {
          this.selectedRoles.set([...new Set(this.originalUsersRoles())]);
        } else {
          this.selectedRoles.set([]);
        }
      });
    });
  }

  protected selectRole(value: boolean, userRole: UserRole): void {
    const selectedUserList = this.selectedRoles();
    if (value) {
      selectedUserList.push(userRole);
      this.selectedRoles.set([...new Set(selectedUserList)]);
    } else {
      this.selectedRoles.set([...new Set(selectedUserList.filter(role => role.roleId !== userRole.roleId))]);
    }
  }
}
