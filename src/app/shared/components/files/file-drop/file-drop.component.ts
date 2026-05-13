import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../button/button.component';
import { IconSize } from '../../button/button.types';

export type FileDropMode = 'filedrop' | 'thumbnail' | 'icon' | 'ngContent' | 'button';

@Component({
  selector: 'proffeo-file-drop',
  templateUrl: './file-drop.component.html',
  imports: [NgClass, MatIconModule, TranslateModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileDropComponent {
  protected readonly IconSize = IconSize;
  protected dropZoneActive: boolean = false;

  public mode: InputSignal<FileDropMode> = input('filedrop');

  public filesAdded = output<File[]>();

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dropZoneActive = true;
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    if (
      event.clientX <= rect.left ||
      event.clientX >= rect.right ||
      event.clientY <= rect.top ||
      event.clientY >= rect.bottom
    ) {
      this.dropZoneActive = false;
    }
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dropZoneActive = false;

    if (event.dataTransfer && event.dataTransfer.files) {
      const files: FileList = event.dataTransfer.files;
      this.handleFiles(files);
    }
  }

  protected handleFiles(files: FileList): void {
    const filesArray: File[] = Array.from(files);
    this.filesAdded.emit(filesArray);
  }

  public cancelHandler(event: Event): void {
    event.stopPropagation();
  }

  public fileBrowseHandler(event: Event): void {
    event.stopPropagation();
    const element: HTMLInputElement = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    this.handleFiles(fileList);
  }
}
