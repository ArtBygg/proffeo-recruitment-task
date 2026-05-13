import { NgClass } from '@angular/common';
import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastConfig } from '@app/shared/types/models/shared/toastr-config.model';

@Component({
  selector: 'proffeo-custom-toast',
  templateUrl: './custom-toast.component.html',
  imports: [MatIconModule, NgClass]
})
export class CustomToastComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly dialogData: ToastConfig = inject(MAT_DIALOG_DATA);
  private readonly dialogRef: MatDialogRef<CustomToastComponent> = inject(MatDialogRef<CustomToastComponent>);
  private closeTimeout;
  private progressInterval;

  protected title: string;
  protected message: string;
  protected type: string;
  protected timeOutMs: number = 2000;
  protected progressWidth = signal(100);

  public ngOnInit(): void {
    this.message = this.dialogData.message;
    this.type = this.dialogData.type;
    this.timeOutMs = this.dialogData.timeOutMs;
    this.refreshProgress();
  }

  public ngAfterViewInit(): void {
    this.closeTimeout = setTimeout(() => {
      this.close();
    }, this.timeOutMs);
  }

  public ngOnDestroy(): void {
    clearTimeout(this.closeTimeout);
    clearInterval(this.progressInterval);
  }

  protected close(): void {
    this.dialogRef.close();
  }

  private refreshProgress(): void {
    this.progressInterval = setInterval(
      () => {
        this.progressWidth.update(width => width - 1);
      },
      Math.floor((this.timeOutMs - 300) / 100)
    );
  }
}
