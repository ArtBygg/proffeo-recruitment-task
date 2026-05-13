import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModalComponent } from '@app/shared/components/modal/modal.component';
import { TaskDetailsPdfService } from '@app/shared/services/task-details-pdf.service';
import { Sections } from '@app/shared/types/models/pdf/task-details/sections.model';
import { Task } from '@app/shared/types/models/task/task.model';
import { TranslateModule } from '@ngx-translate/core';
import { TaskDetailsPdfComponent } from '../task-details-pdf/task-details-pdf.component';

export interface ModalData {
  task: Task;
}

@Component({
  selector: 'proffeo-task-details-pdf-modal',
  templateUrl: './task-details-pdf-modal.component.html',
  styleUrls: ['./task-details-pdf-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TaskDetailsPdfService],
  imports: [
    ModalComponent,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogClose,
    TranslateModule,
    TaskDetailsPdfComponent
  ]
})
export class TaskDetailsPdfModalComponent implements OnInit {
  private readonly modalData: ModalData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef: MatDialogRef<TaskDetailsPdfModalComponent> = inject(MatDialogRef);
  private readonly pdfService: TaskDetailsPdfService = inject(TaskDetailsPdfService);

  protected task: Task;
  protected isLoading = signal(false);
  protected sections: Sections | null = null;

  public ngOnInit(): void {
    this.task = this.modalData.task;
    this.pdfService.reset(this.task);
  }

  protected onPdfGenerate(): void {
    if (!this.sections) {
      return;
    }

    this.isLoading.set(true);
    this.dialogRef.disableClose = true;

    this.pdfService.generate(this.task, this.sections).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.dialogRef.disableClose = false;
        this.dialogRef.close();
      },
      error: () => {
        this.isLoading.set(false);
        this.dialogRef.disableClose = false;
      }
    });
  }
}
