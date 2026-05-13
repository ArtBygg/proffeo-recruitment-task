import { NgClass } from '@angular/common';
import {
  Component,
  DestroyRef,
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
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  AvatarBorderType,
  AvatarComponent
} from '@app/shared/components/group-avatars/avatar/proffeo-avatar.component';
import { InputComponent } from '@app/shared/components/input/input.component';
import { RadioComponent } from '@app/shared/components/radio/radio.component';
import { AvatarSize } from '@app/shared/types/enums/avatar-size.enum';
import { User } from '@app/shared/types/models/user/user.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-select-user-list',
  imports: [
    TranslateModule,
    MatIconModule,
    ReactiveFormsModule,
    RadioComponent,
    AvatarComponent,
    InputComponent,
    NgClass
  ],
  templateUrl: './select-user-list.component.html'
})
export class SelectUserListComponent implements OnInit {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  protected readonly userFormControl: FormControl<string> = new FormControl<string>(null, {
    validators: Validators.required
  });
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarBorderType = AvatarBorderType;
  protected readonly searchControl: FormControl<string> = new FormControl('');
  protected filteredUsers: WritableSignal<User[]> = signal<User[]>([]);

  public readonly originalUsers = input<User[]>(undefined);
  public preselectedUserId: InputSignal<string> = input<string>();
  public selectedUser: ModelSignal<string> = model<string>();

  public ngOnInit(): void {
    this.handleSearchControl();
    this.userFormControl.setValue(this.preselectedUserId() ?? null);
    this.filteredUsers.set(this.originalUsers());
  }

  protected selectUser(userGroup: User): void {
    this.selectedUser.set(userGroup.id);
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
