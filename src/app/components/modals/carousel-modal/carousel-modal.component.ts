import { DIALOG_DATA } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, HostListener, inject, model, ModelSignal, Signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { FullImageCarouselComponent } from '@app/shared/components/carousel/full-image-carousel/full-image-carousel.component';
import { ThumbnailsCarouselComponent } from '@app/shared/components/carousel/thumbnails-carousel/thumbnails-carousel.component';
import { AvatarComponent } from '@app/shared/components/group-avatars/avatar/proffeo-avatar.component';
import { IntlDateTimePipe } from '@app/shared/pipes/intl-date-time.pipe';
import { AvatarSize } from '@app/shared/types/enums/avatar-size.enum';
import { FileInfo } from '@app/shared/types/models/files/file-info';

export interface CarouselModalData {
  currentIndex?: number;
  files: Signal<FileInfo[]>;
  onFilesAdded?: (files: File[]) => void;
  onFileDeleted?: (file: FileInfo) => void;
  onDescriptionChanged?: (event: { file: FileInfo; description: string }) => void;
}

@Component({
  selector: 'proffeo-carousel-modal',
  templateUrl: './carousel-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FullImageCarouselComponent, ThumbnailsCarouselComponent, MatIcon, IntlDateTimePipe, AvatarComponent]
})
export class CarouselModalComponent {
  private readonly dialogRef: MatDialogRef<CarouselModalComponent> = inject(MatDialogRef<CarouselModalComponent>);

  private data: CarouselModalData = inject(DIALOG_DATA);

  protected readonly AvatarSize = AvatarSize;
  protected files: Signal<FileInfo[]> = this.data.files;
  protected currentIndex: ModelSignal<number> = model<number>(0);
  protected modalId: string = crypto.randomUUID();

  public constructor() {
    this.currentIndex.set(this.data.currentIndex ?? 0);
  }

  @HostListener('window:keydown.ArrowRight')
  protected onRightArrowKey(): void {
    if (this.currentIndex() === this.files().length - 1) return;
    this.currentIndex.update(index => index + 1);
  }

  @HostListener('window:keydown.ArrowLeft')
  protected onLeftArrowKey(): void {
    if (this.currentIndex() === 0) return;
    this.currentIndex.update(index => index - 1);
  }

  protected closeDialog(): void {
    this.dialogRef.close();
  }

  protected onFilesAdded(files: File[]): void {
    if (this.data.onFilesAdded) {
      this.data.onFilesAdded(files);
    }
  }

  protected onFileDeleted(file: FileInfo): void {
    if (this.data.onFileDeleted) {
      this.data.onFileDeleted(file);
    }
  }

  protected onDescriptionChanged(event: { file: FileInfo; description: string }): void {
    if (this.data.onDescriptionChanged) {
      this.data.onDescriptionChanged(event);
    }
  }
}
