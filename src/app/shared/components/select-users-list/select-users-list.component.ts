import { NgClass } from '@angular/common';
import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CheckboxComponent } from '@app/shared/components/checkbox/checkbox.component';
import {
  AvatarBorderType,
  AvatarComponent
} from '@app/shared/components/group-avatars/avatar/proffeo-avatar.component';
import { InputComponent } from '@app/shared/components/input/input.component';
import { ModalService } from '@app/shared/services/shared/modal.service';
import { AvatarSize } from '@app/shared/types/enums/avatar-size.enum';
import { User } from '@app/shared/types/models/user/user.model';
import { disableScroll, enableScroll } from '@app/shared/utils/scroll-utils';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-select-users-list',
  imports: [
    TranslateModule,
    CheckboxComponent,
    MatMenuModule,
    MatIconModule,
    ReactiveFormsModule,
    InputComponent,
    AvatarComponent,
    NgClass
  ],
  templateUrl: './select-users-list.component.html'
})
export class SelectUsersListComponent implements OnInit {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly modalService: ModalService = inject(ModalService);

  protected readonly selectAllControl: FormControl<boolean> = new FormControl(false);
  protected readonly searchControl: FormControl<string> = new FormControl('');
  protected readonly enableScroll = enableScroll;
  protected readonly disableScroll = disableScroll;
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarBorderType = AvatarBorderType;
  protected preselectedUserIds: InputSignal<string[]> = input<string[]>();
  protected lockedUserIds: InputSignal<string[]> = input<string[]>();
  protected selectedUsers: ModelSignal<string[]> = model<string[]>();
  protected filteredUsers: WritableSignal<User[]> = signal(undefined);
  protected userControls: Map<string, FormControl> = new Map();

  public readonly originalUsers = input<User[]>(undefined);

  public constructor() {
    effect(() => {
      const allSelected = this.selectedUsers().length === this.userControls.size;

      if (this.selectAllControl.value !== allSelected) {
        this.selectAllControl.setValue(allSelected, { emitEvent: false });
      }
    });
  }

  public ngOnInit(): void {
    this.handleSearchControl();
    this.handleSelectAllControl();
    this.filteredUsers.set(this.originalUsers());
    this.originalUsers()?.forEach((user: User): void => {
      const isSelected: boolean = this.preselectedUserIds().includes(user?.id);
      const isLocked: boolean = this.lockedUserIds()?.includes(user?.id);
      this.userControls.set(
        user?.id,
        new FormControl(
          {
            value: isSelected,
            disabled: isLocked
          },
          {}
        )
      );
    });
  }

  private handleSelectAllControl(): void {
    this.selectAllControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.userControls.forEach((control: FormControl) => {
        if (control.enabled) {
          control.setValue(value);
        }
        if (value) {
          this.selectedUsers.set([
            ...new Set(
              this.originalUsers()
                .filter(user => !this.lockedUserIds()?.includes(user?.id))
                .map(user => user?.id)
            )
          ]);
        } else {
          this.selectedUsers.set([]);
        }
      });
    });
  }

  protected selectUser(value: boolean, userGroup: User): void {
    const selectedUserList = this.selectedUsers();
    if (value) {
      selectedUserList.push(userGroup.id);
      this.selectedUsers.set([...new Set(selectedUserList)]);
    } else {
      this.selectedUsers.set([...new Set(selectedUserList.filter(userId => userId !== userGroup.id))]);
    }
  }

  private handleSearchControl(): void {
    this.searchControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (value: string): void => {
        const searchValue: string = value.toLowerCase();
        if (value) {
          this.filteredUsers.set(this.originalUsers().filter((user: User) => user.matchesSearch(searchValue)));
        } else {
          this.filteredUsers.set(this.originalUsers());
        }
      }
    });
  }
}
