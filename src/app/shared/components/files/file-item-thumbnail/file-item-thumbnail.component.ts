import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-file-item-thumbnail',
  templateUrl: './file-item-thumbnail.component.html',
  imports: [MatIcon, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileItemThumbnailComponent {
  public readonly file = input<FileInfo>();
  public readonly isAvatar = input<boolean>(false);
}
