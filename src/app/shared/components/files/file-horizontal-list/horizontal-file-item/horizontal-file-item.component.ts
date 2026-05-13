import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileDescriptionComponent } from '@app/shared/components/files/file-description/file-description.component';
import { FileItemActionsComponent } from '@app/shared/components/files/file-item-actions/file-item-actions.component';
import { FileItemThumbnailComponent } from '@app/shared/components/files/file-item-thumbnail/file-item-thumbnail.component';
import { AvatarComponent } from '@app/shared/components/group-avatars/avatar/proffeo-avatar.component';
import { ClickedOutsideDirective } from '@app/shared/directives/clicked-outside.directive';
import { FileActionsService } from '@app/shared/services/actions/file-actions.service';
import { AvatarSize } from '@app/shared/types/enums/avatar-size.enum';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-horizontal-file-item',
  templateUrl: './horizontal-file-item.component.html',
  imports: [
    DatePipe,
    FileDescriptionComponent,
    MatIcon,
    AvatarComponent,
    TranslateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    FileItemActionsComponent,
    FileItemThumbnailComponent,
    ClickedOutsideDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HorizontalFileItemComponent {
  private readonly fileActionsService: FileActionsService = inject(FileActionsService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  protected readonly avatarSize = AvatarSize.MINI;
  protected readonly showTitle = computed<boolean>(() => !this.isDescriptionView() || !this.file()?.description);
  protected expandedButtonsPanel: WritableSignal<boolean> = signal(false);
  protected showOverlay: WritableSignal<boolean> = signal(false);

  public file = input<FileInfo>();
  public canSetAsAvatar = input<boolean>(false);
  public isAvatar = input<boolean>(false);
  public showButtons = input<boolean>(false);
  public isDescriptionView = input<boolean>(false);

  public preview = output<string>();
  public delete = output<string>();
  public download = output<string>();
  public setAsAvatar = output<string>();
  public descriptionChange = output<{ fileId: string; description: string }>();

  public getTruncatedDescription(desc: string, maxLength: number = 100): string {
    if (!desc) {
      return '';
    }
    if (desc.length <= maxLength) {
      return desc;
    }
    return desc.substring(0, maxLength) + '...';
  }

  public onPreview(event?: Event): void {
    event?.stopPropagation();
    this.preview.emit(this.file().id);
  }

  public onDelete(): void {
    this.delete.emit(this.file().id);
  }

  public onDownload(): void {
    this.download.emit(this.file().id);
  }

  public onSetAsAvatar(): void {
    this.setAsAvatar.emit(this.file().id);
  }

  public onDescriptionChange(event: string): void {
    const f = this.file();
    this.fileActionsService
      .updateFile(f.id, {
        description: event,
        fileTags: [],
        orderNo: f.orderNo ?? 0
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  public expandButtons(): void {
    this.expandedButtonsPanel.set(!this.expandedButtonsPanel());
  }
}
