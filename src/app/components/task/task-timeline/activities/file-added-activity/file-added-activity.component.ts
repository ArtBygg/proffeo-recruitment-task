import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { ThumbnailsCarouselComponent } from '@app/shared/components/carousel/thumbnails-carousel/thumbnails-carousel.component';
import { FileDataService } from '@app/shared/services/file-data.service';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { ModalService } from '@app/shared/services/shared/modal.service';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { TaskFileAddedActivity } from '@app/shared/types/models/task-activities/task-file-added-activity';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-file-added-activity',
  templateUrl: './file-added-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, ThumbnailsCarouselComponent]
})
export class FileAddedActivityComponent {
  private readonly fileDataService: FileDataService = inject(FileDataService);
  private readonly modalService: ModalService = inject(ModalService);
  private readonly deviceService: DeviceService = inject(DeviceService);

  protected readonly isMobile: Signal<boolean> = this.deviceService.isMobile;
  protected files: Signal<FileInfo[]> = computed(() => {
    const addedFilesIds = this.activity().data?.addedFilesIds || [];
    return addedFilesIds
      .map(id => this.fileDataService.getById(id)())
      .filter((file): file is FileInfo => file !== undefined);
  });

  public readonly activity = input.required<TaskFileAddedActivity>();

  protected onThumbnailClick(index: number): void {
    this.modalService.openCarouselModal({
      currentIndex: index,
      files: this.files
    });
  }
}
