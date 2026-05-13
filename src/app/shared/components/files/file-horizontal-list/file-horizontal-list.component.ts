import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  linkedSignal,
  output,
  Signal,
  WritableSignal
} from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CarouselModalData } from '@app/components/modals/carousel-modal/carousel-modal.component';
import { HorizontalFileItemComponent } from '@app/shared/components/files/file-horizontal-list/horizontal-file-item/horizontal-file-item.component';
import { FileDataService } from '@app/shared/services/file-data.service';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { ModalService } from '@app/shared/services/shared/modal.service';
import { UploadStatus } from '@app/shared/types/enums/file-enums';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { FileUploadInfo } from '@app/shared/types/models/files/file-upload-info';
import { ALLOWED_FILES_TYPES } from '@app/shared/utils/allowed-files-types';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { isFileViewable } from '../file.utils';

@Component({
  selector: 'proffeo-file-horizontal-list',
  templateUrl: './file-horizontal-list.component.html',
  styleUrl: './file-horizontal-list.component.scss',
  providers: [TranslateService],
  imports: [TranslateModule, MatExpansionModule, MatIconModule, HorizontalFileItemComponent, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileHorizontalListComponent {
  private readonly modalService: ModalService = inject(ModalService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly deviceService: DeviceService = inject(DeviceService);
  private readonly fileService = inject(FileDataService);

  protected readonly isMobile: Signal<boolean> = this.deviceService.isMobile;
  protected readonly UploadStatus = UploadStatus;
  protected localFiles: WritableSignal<FileInfo[]> = linkedSignal(() => this.files());
  protected viewableFiles: Signal<FileInfo[]> = computed(() => this.localFiles().filter(f => isFileViewable(f)));

  public readonly delete = output<FileInfo>();
  public readonly avatarSet = output<FileInfo>();
  public allowedFilesTypes: InputSignal<string[]> = input(ALLOWED_FILES_TYPES);
  public files: InputSignal<FileInfo[]> = input([]);
  public uploadingFiles: InputSignal<FileUploadInfo[]> = input([]);
  public canSetAsAvatar: InputSignal<boolean> = input(false);
  public avatarFileId: InputSignal<string | null> = input(null);

  protected onDeleteFile(fileId: string): void {
    const file = this.localFiles().find(f => f.id === fileId);
    if (!file) {
      return;
    }
    this.delete.emit(file);
  }

  protected onDownloadFile(fileId: string): void {
    const file = this.localFiles().find(f => f.id === fileId);
    this.fileService.download(file);
  }

  protected onPreviewFile(fileId: string): void {
    const data: CarouselModalData = {
      files: this.viewableFiles,
      currentIndex: this.viewableFiles().findIndex(f => f.id === fileId)
    };
    this.modalService.openCarouselModal(data);
  }

  protected onSetAsAvatar(fileId: string): void {
    const file = this.localFiles().find(f => f.id === fileId);
    this.avatarSet.emit(file);
  }

  protected dismissUpload(fileId: string): void {
    this.fileService.dismissUpload(fileId);
  }
}
