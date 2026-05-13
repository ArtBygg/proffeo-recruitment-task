import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { ThumbnailsCarouselComponent } from '@app/shared/components/carousel/thumbnails-carousel/thumbnails-carousel.component';
import { FileDataService } from '@app/shared/services/file-data.service';
import { ModalService } from '@app/shared/services/shared/modal.service';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { TaskMessageAddedActivity } from '@app/shared/types/models/task-activities/task-message-added-activity';

@Component({
  selector: 'proffeo-message-added-activity',
  templateUrl: './message-added-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ThumbnailsCarouselComponent]
})
export class MessageAddedActivityComponent {
  private readonly fileDataService: FileDataService = inject(FileDataService);
  private readonly modalService: ModalService = inject(ModalService);

  protected readonly files: Signal<FileInfo[]> = computed(() => {
    const filesIds = this.activity().data?.filesIds || [];
    return filesIds
      .map(id => this.fileDataService.getById(id)())
      .filter((file): file is FileInfo => file !== undefined);
  });

  public readonly activity = input.required<TaskMessageAddedActivity>();

  protected onThumbnailClick(index: number): void {
    this.modalService.openCarouselModal({
      currentIndex: index,
      files: this.files
    });
  }
}
