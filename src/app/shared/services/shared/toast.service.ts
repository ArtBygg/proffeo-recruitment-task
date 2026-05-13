import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CustomToastComponent } from '@app/shared/components/toast/custom-toast.component';
import { ToastConfig } from '@app/shared/types/models/shared/toastr-config.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly matDialog: MatDialog = inject(MatDialog);
  private openToasts: MatDialogRef<CustomToastComponent>[] = [];

  public timeOutMs: number = 2000;

  public success(message?: string, timeOutMs: number = this.timeOutMs): void {
    const toastConfig: ToastConfig = {
      timeOutMs,
      message,
      type: 'success'
    };

    this.openToast(toastConfig);
  }

  public error(message?: string, timeOutMs: number = this.timeOutMs): void {
    const toastConfig: ToastConfig = {
      timeOutMs,
      message,
      type: 'error'
    };

    this.openToast(toastConfig);
  }

  public warning(message?: string, timeOutMs: number = this.timeOutMs): void {
    const toastConfig: ToastConfig = {
      timeOutMs,
      message,
      type: 'warning'
    };

    this.openToast(toastConfig);
  }

  public info(message?: string, timeOutMs: number = this.timeOutMs): void {
    const toastConfig: ToastConfig = {
      timeOutMs,
      message,
      type: 'info'
    };

    this.openToast(toastConfig);
  }

  private openToast(toastConfig: ToastConfig): void {
    const verticalOffset = 10 + this.openToasts.length * 66; // 70px wysokość toasta + odstęp

    const dialogRef = this.matDialog.open(CustomToastComponent, {
      data: toastConfig,
      hasBackdrop: false,
      disableClose: true,
      closeOnNavigation: false,
      height: 'auto',
      width: 'auto',
      minHeight: 'auto',
      minWidth: 'auto',
      panelClass: 'custom-toast-panel',
      position: {
        top: `${verticalOffset}px`,
        right: '10px'
      }
    });

    this.openToasts.push(dialogRef);

    dialogRef.afterClosed().subscribe(() => {
      const index = this.openToasts.indexOf(dialogRef);
      if (index >= 0) {
        this.openToasts.splice(index, 1);
      }
      this.repositionToasts();
    });

    setTimeout(() => dialogRef.close(), toastConfig.timeOutMs);
  }

  private repositionToasts(): void {
    this.openToasts.forEach((dialogRef, index) => {
      const newTop = 10 + index * 66;
      dialogRef.updatePosition({ top: `${newTop}px`, right: '10px' });
    });
  }
}
