import { ChangeDetectionStrategy, Component, inject, OnInit, signal, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { LabelComponent } from '@app/shared/components/label/label.component';
import { ModalComponent } from '@app/shared/components/modal/modal.component';
import { Tag } from '@app/shared/types/models/tag/tag.model';
import { TranslateModule } from '@ngx-translate/core';

export interface SelectTagsModalData {
  tags: Signal<Tag[]>;
  chosenTags: Tag[];
  onAddTag?: () => void;
  onEditTag?: (tag: Tag) => void;
}

@Component({
  selector: 'select-tags-modal',
  templateUrl: './select-tags-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    LabelComponent,
    MatSelectModule,
    MatCheckboxModule,
    ModalComponent,
    ButtonComponent
  ]
})
export class SelectTagsModalComponent implements OnInit {
  private readonly data: SelectTagsModalData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef: MatDialogRef<SelectTagsModalComponent> = inject(MatDialogRef);

  protected ButtonType = ButtonType;

  public tags: Signal<Tag[]> = signal([]);
  public chosenTags: Tag[] = [];

  public selectedTags = signal<Set<string>>(new Set());

  public ngOnInit(): void {
    this.tags = this.data.tags;
    this.chosenTags = this.data.chosenTags;
    const initialSelected = new Set<string>(this.chosenTags.map(t => t.id));
    this.selectedTags.set(initialSelected);
  }

  public isTagSelected(tagId: string): boolean {
    return this.selectedTags().has(tagId);
  }

  public onTagToggle(tagId: string, checked: boolean): void {
    const updated = new Set(this.selectedTags());
    if (checked) {
      updated.add(tagId);
    } else {
      updated.delete(tagId);
    }
    this.selectedTags.set(updated);
  }

  protected handleSaveClick(): void {
    const selected = this.tags().filter(tag => this.selectedTags().has(tag.id));
    this.dialogRef.close(selected);
  }

  protected addTag(): void {
    if (this.data.onAddTag) {
      this.data.onAddTag();
    }
  }

  protected editTag(tag: Tag): void {
    if (this.data.onEditTag) {
      this.data.onEditTag(tag);
    }
  }
}
