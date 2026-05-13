import { Component, HostListener, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ButtonType } from '@app/shared/components/button/button.types';
import { ModalComponent } from '@app/shared/components/modal/modal.component';
import { BasicModalData } from '@app/shared/types/models/shared/confirmation-modal.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-confirmation-modal',
  imports: [ModalComponent, TranslateModule, MatDialogModule],
  templateUrl: './information-modal.component.html'
})
export class InformationModalComponent implements OnInit {
  private readonly dialogData: BasicModalData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef: MatDialogRef<InformationModalComponent> = inject(MatDialogRef<InformationModalComponent>);

  protected readonly ButtonType = ButtonType;
  protected title: string;
  protected desc: string;

  @HostListener('keydown.esc', ['$event'])
  @HostListener('keydown.enter', ['$event'])
  protected onEsc($event: KeyboardEvent): void {
    $event.stopPropagation();
    this.close();
  }

  public ngOnInit(): void {
    this.title = this.dialogData.title;
    this.desc = this.dialogData.desc;
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
