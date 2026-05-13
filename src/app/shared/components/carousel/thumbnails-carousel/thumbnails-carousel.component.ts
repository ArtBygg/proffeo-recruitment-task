import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { TranslateModule } from '@ngx-translate/core';
import { EmblaOptionsType } from 'embla-carousel';
import { BaseEmblaCarouselComponent } from '../base-embla-carousel/base-embla-carousel.component';

@Component({
  selector: 'proffeo-thumbnails-carousel',
  templateUrl: './thumbnails-carousel.component.html',
  styleUrl: './thumbnails-carousel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [MatIconModule, TranslateModule]
})
export class ThumbnailsCarouselComponent extends BaseEmblaCarouselComponent {
  public readonly allowDelete = input<boolean>(false);
  public readonly showCurrentSlideIndicator = input<boolean>(false);

  public readonly thumbnailClick = output<number>();
  public readonly fileDelete = output<FileInfo>();

  protected override getEmblaOptions(): EmblaOptionsType {
    return {
      loop: false,
      containScroll: 'trimSnaps',
      align: 'start'
    };
  }

  /**
   * Thumbnails use `containScroll: 'trimSnaps'`, which trims scroll snaps so that
   * the last file indices may share a single snap with earlier ones. Updating the
   * model `index` from `selectedScrollSnap()` here would therefore collapse the
   * last 1-2 indices to the last valid trimmed snap and switch the user away
   * from the file they just picked. The index is driven exclusively by
   * `onThumbnailClick` and by the parent component.
   */
  protected override onEmblaSelect(): void {
    // empty by design - see comment above
  }

  protected onThumbnailClick(index: number): void {
    this.thumbnailClick.emit(index);
    this.scrollTo(index);
  }
}
