import { Component, inject, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { ModalComponent } from '@app/shared/components/modal/modal.component';
import { SelectIndustryListComponent } from '@app/shared/components/select-industry-list/select-industry-list.component';
import { SelectMode } from '@app/shared/types/enums/select-mode.enum';
import { Industry } from '@app/shared/types/models/industry/industry.model';
import { SelectIndustryModalData } from '@app/shared/types/models/project-industry/project-industry.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-select-industry-modal',
  imports: [SelectIndustryListComponent, MatDialogModule, TranslateModule, ModalComponent, ButtonComponent],
  templateUrl: './select-industry-modal.component.html'
})
export class SelectIndustryModalComponent implements OnInit {
  private readonly dialogRef: MatDialogRef<SelectIndustryModalComponent> = inject(
    MatDialogRef<SelectIndustryModalComponent>
  );

  protected readonly dialogData: SelectIndustryModalData = inject(MAT_DIALOG_DATA);
  protected readonly ButtonType = ButtonType;
  protected selectedIndustries: WritableSignal<Industry[]> = signal<Industry[]>([]);
  protected industries: Signal<Industry[]> = signal([]);
  protected selectMode: SelectMode = SelectMode.SINGLE;

  public ngOnInit(): void {
    this.industries = this.dialogData.industries;
    if (this.dialogData.selectMode) {
      this.selectMode = this.dialogData.selectMode;
    }
    const preSelectedIndustries = this.dialogData.selectedIndustries;
    if (preSelectedIndustries?.length > 0) {
      this.selectedIndustries.set(preSelectedIndustries);
    }
  }

  public save(): void {
    if (this.selectMode === SelectMode.SINGLE) {
      this.dialogRef.close(this.selectedIndustries()[0]);
    } else {
      this.dialogRef.close(this.selectedIndustries());
    }
  }
}
