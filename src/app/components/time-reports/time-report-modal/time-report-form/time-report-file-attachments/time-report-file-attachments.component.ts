import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TimeReportModalService } from '@app/components/time-reports/time-report-modal/time-report-modal.service';
import { FileDropComponent } from '@app/shared/components/files/file-drop/file-drop.component';
import { FileHorizontalListComponent } from '@app/shared/components/files/file-horizontal-list/file-horizontal-list.component';
import { FilePreviewListComponent } from '@app/shared/components/files/file-preview-list/file-preview-list.component';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-time-report-file-attachments',
  templateUrl: './time-report-file-attachments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    FilePreviewListComponent,
    FileDropComponent,
    FileHorizontalListComponent
  ]
})
export class TimeReportFileAttachmentsComponent {
  private readonly timeReportModalService: TimeReportModalService = inject(TimeReportModalService);
  protected readonly isAddingNewReport: Signal<boolean> = this.timeReportModalService.isAddingNewReport;
  protected readonly previewFiles: Signal<File[]> = this.timeReportModalService.previewFiles;
  protected readonly files: Signal<FileInfo[]> = this.timeReportModalService.files;

  protected onAddPreviewFiles(files: File[]): void {
    this.timeReportModalService.addPreviewFiles(files);
  }

  protected onRemovePreviewFile(fileToRemove: File): void {
    this.timeReportModalService.removePreviewFile(fileToRemove);
  }

  protected onDeleteFile(file: FileInfo): void {
    this.timeReportModalService.deleteFile(file);
  }

  protected onUploadFiles(files: File[]): void {
    this.timeReportModalService.uploadFiles(files);
  }
}
