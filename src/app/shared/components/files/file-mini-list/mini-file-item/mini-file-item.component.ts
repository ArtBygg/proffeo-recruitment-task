import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, output, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileDescriptionComponent } from '@app/shared/components/files/file-description/file-description.component';
import { FileItemActionsComponent } from '@app/shared/components/files/file-item-actions/file-item-actions.component';
import { FileItemThumbnailComponent } from '@app/shared/components/files/file-item-thumbnail/file-item-thumbnail.component';
import { AvatarComponent } from '@app/shared/components/group-avatars/avatar/proffeo-avatar.component';
import { FileActionsService } from '@app/shared/services/actions/file-actions.service';
import { AvatarSize } from '@app/shared/types/enums/avatar-size.enum';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-mini-file-item',
  templateUrl: './mini-file-item.component.html',
  imports: [
    DatePipe,
    MatIcon,
    MatMenuModule,
    MatTooltipModule,
    TranslateModule,
    AvatarComponent,
    FileDescriptionComponent,
    FileItemActionsComponent,
    FileItemThumbnailComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MiniFileItemComponent {
  private readonly fileActionsService: FileActionsService = inject(FileActionsService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  protected readonly avatarSize = AvatarSize.MINI;
  protected readonly displayLabel: Signal<string> = computed(() => {
    const file = this.file();
    return file?.description?.trim() || file?.name || '';
  });

  public readonly file = input<FileInfo>();
  public readonly canSetAsAvatar = input<boolean>(false);
  public readonly isAvatar = input<boolean>(false);

  public readonly preview = output<string>();
  public readonly delete = output<string>();
  public readonly download = output<string>();
  public readonly setAsAvatar = output<string>();

  public onDescriptionChange(description: string): void {
    const file = this.file();
    this.fileActionsService
      .updateFile(file.id, {
        description,
        fileTags: [],
        orderNo: file.orderNo ?? 0
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
