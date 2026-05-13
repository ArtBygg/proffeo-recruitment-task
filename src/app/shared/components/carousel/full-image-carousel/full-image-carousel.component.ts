import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  linkedSignal,
  output
} from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { TranslateModule } from '@ngx-translate/core';
import { EmblaOptionsType } from 'embla-carousel';
import { FileDescriptionComponent } from '../../files/file-description/file-description.component';
import { BaseEmblaCarouselComponent } from '../base-embla-carousel/base-embla-carousel.component';

@Component({
  selector: 'proffeo-full-image-carousel',
  templateUrl: './full-image-carousel.component.html',
  styleUrl: './full-image-carousel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [MatIconModule, MatDialogModule, TranslateModule, FileDescriptionComponent, NgClass]
})
export class FullImageCarouselComponent extends BaseEmblaCarouselComponent {
  private readonly sanitizer = inject(DomSanitizer);

  public readonly filesAdded = output<File[]>();
  public readonly fileDelete = output<FileInfo>();
  public readonly descriptionChanged = output<{ file: FileInfo; description: string }>();

  public readonly currentImage = linkedSignal(() => this.files()[this.index()]);

  protected override getEmblaOptions(): EmblaOptionsType {
    return {
      loop: false,
      align: 'center'
    };
  }

  protected toSafePdfUrl(rawUrl: string): SafeResourceUrl {
    const withParams = rawUrl.includes('#') ? rawUrl : `${rawUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(withParams);
  }

  protected onFileAdded(files: File[]): void {
    this.filesAdded.emit(files);
  }

  protected onFileDeleted(file: FileInfo): void {
    this.fileDelete.emit(file);
  }

  protected onDescriptionChange(description: string): void {
    const current = this.currentImage();
    if (!current) return;

    current.description = description;
    this.currentImage.set(current);

    this.descriptionChanged.emit({
      file: current,
      description
    });
  }
}
