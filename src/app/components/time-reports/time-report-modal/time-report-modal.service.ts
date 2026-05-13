import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { FileDataService, FileUrlParams } from '@app/shared/services/file-data.service';
import { FileContext } from '@app/shared/types/enums/file-enums';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { UploadData } from '@app/shared/types/models/files/upload-data.model';
import { WorkTimeReport } from '@app/shared/types/models/reports/work-time-report';

@Injectable()
export class TimeReportModalService {
  private readonly fileService: FileDataService = inject(FileDataService);
  private readonly _previewFiles: WritableSignal<File[]> = signal([]);
  private readonly timeReportId: WritableSignal<string> = signal('');

  public readonly isAddingNewReport: WritableSignal<boolean> = signal(true);
  public readonly files: Signal<FileInfo[]> = computed(() =>
    this.fileService.getFiles({
      context: FileContext.timeReportFile,
      timeReportId: this.timeReportId()
    })()
  );

  public get previewFiles(): Signal<File[]> {
    return computed(() => this._previewFiles());
  }

  public addPreviewFiles(newFiles: File[]): void {
    this._previewFiles.update(files => [...files, ...newFiles]);
  }

  public removePreviewFile(fileToRemove: File): void {
    this._previewFiles.update(files => files.filter(file => file !== fileToRemove));
  }

  public uploadFiles(newFiles: File[]): void {
    const uploadParams: FileUrlParams = {
      context: FileContext.timeReportFile,
      timeReportId: this.timeReportId()
    };

    newFiles.forEach(file => {
      const uploadData: UploadData = {
        file: file,
        description: '',
        fileTags: [],
        orderNo: 0
      };
      this.fileService.uploadFile(uploadParams, uploadData);
    });
  }

  public deleteFile(file: FileInfo): void {
    this.fileService.deleteFile({ context: FileContext.timeReportFile, timeReportId: this.timeReportId() }, file);
  }

  public initializeFiles(timeReport: WorkTimeReport): void {
    if (!timeReport) {
      this.isAddingNewReport.set(true);
    } else {
      this.isAddingNewReport.set(false);
      this.timeReportId.set(timeReport.id);
    }
  }
}
