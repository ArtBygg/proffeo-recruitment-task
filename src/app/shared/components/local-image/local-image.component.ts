import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  WritableSignal
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'proffeo-local-image',
  templateUrl: './local-image.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, MatIconModule]
})
export class LocalImageComponent implements AfterViewInit {
  protected srcUrl: WritableSignal<string> = signal('');

  public readonly file = input.required<File>();
  public readonly miniMode = input<boolean>(false);
  public readonly openGallery = input<boolean>(false);
  public readonly removeFileEvent = output<File>();

  public ngAfterViewInit(): void {
    const reader: FileReader = new FileReader();

    reader.onloadend = (): void => {
      this.srcUrl.set(reader.result as string);
    };

    reader.readAsDataURL(this.file());
  }

  protected isImage(): boolean {
    const supportedImageTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
    return supportedImageTypes.includes(this.file().type);
  }

  protected isPdf(): boolean {
    return this.file().type === 'application/pdf';
  }

  protected isVideo(): boolean {
    return ['video/quicktime', 'video/mp4'].includes(this.file().type);
  }
}
