import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  InputSignal,
  output,
  Signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CarouselModalData } from '@app/components/modals/carousel-modal/carousel-modal.component';
import { MiniFileItemComponent } from '@app/shared/components/files/file-mini-list/mini-file-item/mini-file-item.component';
import { FileActionsService } from '@app/shared/services/actions/file-actions.service';
import { FileDataService } from '@app/shared/services/file-data.service';
import { ModalService } from '@app/shared/services/shared/modal.service';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { FileMetadata } from '@app/shared/types/models/files/file-metadata';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-file-mini-list',
  templateUrl: './file-mini-list.component.html',
  imports: [TranslateModule, MiniFileItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileMiniListComponent {
  private readonly modalService: ModalService = inject(ModalService);
  private readonly fileService: FileDataService = inject(FileDataService);
  private readonly fileActionsService: FileActionsService = inject(FileActionsService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  protected readonly viewableFiles: Signal<FileInfo[]> = computed(() =>
    (this.files() ?? []).filter(file => file.isImage() || file.isPdf() || file.isVideo())
  );

  public readonly files: InputSignal<FileInfo[] | undefined> = input<FileInfo[] | undefined>(undefined);
  public readonly canSetAsAvatar: InputSignal<boolean> = input<boolean>(false);
  public readonly avatarFileId: InputSignal<string | null> = input<string | null>(null);

  public readonly delete = output<FileInfo>();
  public readonly avatarSet = output<FileInfo>();

  protected onPreviewFile(fileId: string): void {
    const data: CarouselModalData = {
      currentIndex: this.viewableFiles().findIndex(file => file.id === fileId),
      files: this.viewableFiles,
      onDescriptionChanged: event => this.onFileDescriptionChanged(event)
    };
    this.modalService.openCarouselModal(data);
  }

  protected onDeleteFile(fileId: string): void {
    const file = this.files()?.find(item => item.id === fileId);
    if (file) {
      this.delete.emit(file);
    }
  }

  protected onDownloadFile(fileId: string): void {
    const file = this.files()?.find(item => item.id === fileId);
    if (file) {
      this.fileService.download(file);
    }
  }

  protected onSetAsAvatar(fileId: string): void {
    const file = this.files()?.find(item => item.id === fileId);
    if (file) {
      this.avatarSet.emit(file);
    }
  }

  private onFileDescriptionChanged(event: { file: FileInfo; description: string }): void {
    const metadata: FileMetadata = {
      description: event.description,
      fileTags: [],
      orderNo: event.file.orderNo
    };
    this.fileActionsService.updateFile(event.file.id, metadata).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
