import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { CheckboxComponent } from '@app/shared/components/checkbox/checkbox.component';
import { AvatarComponent } from '@app/shared/components/group-avatars/avatar/proffeo-avatar.component';
import { InputComponent } from '@app/shared/components/input/input.component';
import { LabelComponent } from '@app/shared/components/label/label.component';
import { ModalComponent } from '@app/shared/components/modal/modal.component';
import { ProjectParticipant } from '@app/shared/types/models/project/project-participant';
import { TranslateModule } from '@ngx-translate/core';

export interface MultipleProjectParticipantsModalData {
  projectParticipants: ProjectParticipant[];
  preselectedProjectParticipants: ProjectParticipant[];
  preselectedLockedProjectParticipantsIds: string[];
  title: string;
}

export interface MultipleProjectParticipantsResultData {
  idsToAdd: string[];
  idsToRemove: string[];
}

@Component({
  selector: 'proffeo-select-multiple-project-participants-modal',
  templateUrl: './select-multiple-project-participants-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    AvatarComponent,
    LabelComponent,
    ModalComponent,
    CheckboxComponent,
    TranslateModule,
    InputComponent,
    ButtonComponent
  ]
})
export class SelectMultipleProjectParticipantsModalComponent implements OnInit {
  private readonly data = inject<MultipleProjectParticipantsModalData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<SelectMultipleProjectParticipantsModalComponent>);
  private readonly searchValue = signal('');
  private initialSelectedIds: Set<string>;

  protected readonly ButtonType = ButtonType;
  protected readonly title = this.data.title;
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly selectAllControl = new FormControl(false, { nonNullable: true });
  protected readonly projectParticipantsControls = new Map<string, FormControl<boolean>>();
  protected readonly filteredProjectParticipants = computed(() => {
    const search = this.searchValue().toLowerCase();
    if (!search) return this.projectParticipants;

    return this.projectParticipants.filter(participant => participant.user().matchesSearch(search));
  });

  protected projectParticipants: ProjectParticipant[] = [];
  protected preselectedLockedProjectParticipantsIds: string[] = [];

  private initializeControls(): void {
    const allSelectedIds = new Set([
      ...(this.data.preselectedProjectParticipants?.map(p => p.id) ?? []),
      ...(this.data.preselectedLockedProjectParticipantsIds ?? [])
    ]);

    this.projectParticipants?.forEach(participant => {
      const isSelected = allSelectedIds.has(participant.id);

      const control = new FormControl(
        {
          value: isSelected,
          disabled: this.isLockedById(participant.id)
        },
        { nonNullable: true }
      );

      this.projectParticipantsControls.set(participant.id, control);
    });

    this.selectAllControl.setValue(this.areAllSelected());
  }

  private setupControlListeners(): void {
    // Select all listener
    this.selectAllControl.valueChanges.subscribe(selectAll => {
      this.projectParticipantsControls.forEach((control, participantId) => {
        if (!this.isLockedById(participantId)) {
          control.setValue(selectAll);
        }
      });
    });

    // Search listener
    this.searchControl.valueChanges.subscribe(value => {
      this.searchValue.set(value);
    });
  }

  public ngOnInit(): void {
    this.initialSelectedIds = new Set(this.data.preselectedProjectParticipants?.map(p => p.id) ?? []);
    this.projectParticipants = this.data.projectParticipants;
    this.preselectedLockedProjectParticipantsIds = this.data.preselectedLockedProjectParticipantsIds;

    this.initializeControls();
    this.setupControlListeners();
  }

  protected areAllSelected(): boolean {
    return Array.from(this.projectParticipantsControls.values()).every(control => control.value);
  }

  protected handleSaveClick(): void {
    const currentSelectedIds = new Set(
      this.projectParticipants
        ?.filter(pp => this.projectParticipantsControls.get(pp.id)?.value)
        .filter(pp => !this.isLockedById(pp.id))
        .map(pp => pp.id)
    );

    const idsToAdd = Array.from(currentSelectedIds).filter(id => !this.initialSelectedIds.has(id));
    const idsToRemove = Array.from(this.initialSelectedIds).filter(
      id => !currentSelectedIds.has(id) && !this.isLockedById(id)
    );
    const result: MultipleProjectParticipantsResultData = {
      idsToAdd: idsToAdd,
      idsToRemove: idsToRemove
    };

    this.dialogRef.close(result);
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected isLockedById(participantId: string): boolean {
    return this.preselectedLockedProjectParticipantsIds.some(locked => locked === participantId);
  }

  protected getControl(participantId: string): FormControl<boolean> | undefined {
    return this.projectParticipantsControls.get(participantId);
  }
}
