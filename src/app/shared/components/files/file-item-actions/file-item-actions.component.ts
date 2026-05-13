import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType, IconSize } from '@app/shared/components/button/button.types';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { TranslateModule } from '@ngx-translate/core';
import { isFileViewable } from '../file.utils';

@Component({
  selector: 'proffeo-file-item-actions',
  templateUrl: './file-item-actions.component.html',
  imports: [TranslateModule, MatTooltipModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileItemActionsComponent {
  protected readonly ButtonType: typeof ButtonType = ButtonType;
  protected readonly IconSize: typeof IconSize = IconSize;
  protected readonly isFileViewable = isFileViewable;

  public readonly file = input.required<FileInfo>();
  public readonly canSetAsAvatar = input<boolean>(false);
  public readonly isAvatar = input<boolean>(false);
  public readonly preview = output<void>();
  public readonly delete = output<void>();
  public readonly download = output<void>();
  public readonly setAsAvatar = output<void>();

  public onPreview(event: Event): void {
    event.stopPropagation();
    this.preview.emit();
  }

  public onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit();
  }

  public onDownload(event: Event): void {
    event.stopPropagation();
    this.download.emit();
  }

  public onSetAsAvatar(event: Event): void {
    event.stopPropagation();
    this.setAsAvatar.emit();
  }
}
