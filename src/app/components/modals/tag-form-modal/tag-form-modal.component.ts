import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { ModalComponent } from '@app/shared/components/modal/modal.component';
import { TagComponent } from '@app/shared/components/tag/tag.component';
import { ModalModeEnum } from '@app/shared/types/enums/modal-mode.enum';
import { ProjectTagForm, TagFormModalData } from '@app/shared/types/models/tag/tag.model';
import { TranslateModule } from '@ngx-translate/core';

export interface TagFormModalResult {
  id: string;
  hexColor: string;
  name: string;
  description: string;
}
@Component({
  selector: 'proffeo-tag-form-modal',
  imports: [
    MatDialogModule,
    TranslateModule,
    ModalComponent,
    ReactiveFormsModule,
    TagComponent,
    MatError,
    ButtonComponent,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './tag-form-modal.component.html'
})
export class TagFormModalComponent implements OnInit {
  private readonly dialogRef: MatDialogRef<TagFormModalComponent> = inject(MatDialogRef<TagFormModalComponent>);
  private readonly dialogData: TagFormModalData = inject(MAT_DIALOG_DATA);

  protected readonly ButtonType = ButtonType;

  //TODO set the same maxlength for description and name in form fields
  protected projectTagForm: FormGroup<ProjectTagForm> = new FormGroup<ProjectTagForm>({
    description: new FormControl<string>('', [Validators.maxLength(100)]),
    id: new FormControl<string>(''),
    hexColor: new FormControl<string>('', [Validators.required]),
    name: new FormControl<string>('', [Validators.required, Validators.maxLength(50)])
  });

  protected mode = ModalModeEnum.CREATE;

  public ngOnInit(): void {
    this.mode = this.dialogData?.mode ?? ModalModeEnum.CREATE;
    const tag = this.dialogData.projectTagToEdit;
    if (tag) {
      this.projectTagForm.patchValue({
        id: tag.id,
        hexColor: tag.hexColor,
        name: tag.name,
        description: tag.description
      });
    }
  }

  protected onHexColorInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.projectTagForm.controls.hexColor.setValue(input.value);
  }

  public save(): void {
    if (this.projectTagForm.invalid) return;
    const result: TagFormModalResult = this.projectTagForm.getRawValue();
    this.dialogRef.close(result);
  }
}
