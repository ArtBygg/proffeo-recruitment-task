import { ChangeDetectionStrategy, Component, input, OnDestroy, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'proffeo-file-preview-list',
  templateUrl: './file-preview-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule]
})
export class FilePreviewListComponent implements OnDestroy {
  private blobUrlsMap: Map<File, string> = new Map();

  public readonly files = input.required<File[]>();
  public readonly removeFile = output<File>();

  public ngOnDestroy(): void {
    // Cleanup all blob URLs
    this.blobUrlsMap.forEach(url => URL.revokeObjectURL(url));
    this.blobUrlsMap.clear();
  }

  protected getBlobUrl(file: File): string {
    const existingUrl = this.blobUrlsMap.get(file);
    if (existingUrl) {
      return existingUrl;
    }

    const url = URL.createObjectURL(file);
    this.blobUrlsMap.set(file, url);
    return url;
  }

  protected isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  protected onRemoveFile(file: File): void {
    // Revoke blob URL for this file
    const url = this.blobUrlsMap.get(file);
    if (url) {
      URL.revokeObjectURL(url);
      this.blobUrlsMap.delete(file);
    }

    this.removeFile.emit(file);
  }
}
