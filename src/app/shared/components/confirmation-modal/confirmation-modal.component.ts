import { Component, HostListener, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { ModalComponent } from '@app/shared/components/modal/modal.component';
import { BasicModalData } from '@app/shared/types/models/shared/confirmation-modal.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-confirmation-modal',
  imports: [ModalComponent, TranslateModule, MatDialogModule, ButtonComponent],
  templateUrl: './confirmation-modal.component.html'
})
export class ConfirmationModalComponent implements OnInit {
  private readonly dialogData: BasicModalData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef: MatDialogRef<ConfirmationModalComponent> = inject(
    MatDialogRef<ConfirmationModalComponent>
  );

  protected readonly ButtonType: typeof ButtonType = ButtonType;
  protected title: string;
  protected desc: string;

  @HostListener('window:keydown.escape', ['$event'])
  protected onEsc($event: KeyboardEvent): void {
    $event.stopPropagation();
    $event.preventDefault();
    this.close();
  }

  @HostListener('window:keydown.enter', ['$event'])
  protected onEnter($event: KeyboardEvent): void {
    $event.stopPropagation();
    $event.preventDefault();
    this.close(true);
  }

  public ngOnInit(): void {
    this.title = this.dialogData.title;
    this.desc = this.dialogData.desc;
  }

  protected close(decision?: boolean): void {
    this.dialogRef.close(decision);
  }
}
