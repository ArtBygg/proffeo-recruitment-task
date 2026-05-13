import {
  AfterViewInit,
  Directive,
  ElementRef,
  ModelSignal,
  OnDestroy,
  Signal,
  ViewChild,
  WritableSignal,
  computed,
  effect,
  input,
  model,
  signal
} from '@angular/core';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import EmblaCarousel, { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';

@Directive()
export abstract class BaseEmblaCarouselComponent implements AfterViewInit, OnDestroy {
  @ViewChild('emblaRoot', { static: true }) protected emblaRoot!: ElementRef<HTMLElement>;
  private emblaApi!: EmblaCarouselType;

  protected canScrollNext: Signal<boolean> = computed(() => this._canScrollNext());
  protected canScrollPrev: Signal<boolean> = computed(() => this._canScrollPrev());
  protected selectedFile: Signal<FileInfo | undefined> = computed(() => this.files()[this.index()]);
  protected _canScrollNext: WritableSignal<boolean> = signal(true);
  protected _canScrollPrev: WritableSignal<boolean> = signal(false);

  public readonly files = input<FileInfo[]>([]);
  public readonly emblaId = input<string>(`embla-${crypto.randomUUID()}`);
  public readonly index: ModelSignal<number> = model<number>(0);

  public constructor() {
    effect(() => {
      this.scrollTo(this.index());
    });
  }

  public ngAfterViewInit(): void {
    const emblaNode: HTMLElement = this.emblaRoot.nativeElement;
    const options = this.getEmblaOptions();
    this.emblaApi = EmblaCarousel(emblaNode, options);

    this.emblaApi.on('scroll', () => {
      this.setCanScroll();
    });

    this.emblaApi.on('select', () => {
      this.onEmblaSelect();
    });

    this.emblaApi.scrollTo(this.index());
    this.setCanScroll();

    setTimeout(() => {
      this.emblaApi.reInit();
      this.emblaApi.scrollTo(this.index());
      this.setCanScroll();
    }, 0);
  }

  public ngOnDestroy(): void {
    if (this.emblaApi) {
      this.emblaApi.destroy();
    }
  }

  public slideRight(): void {
    if (!this.canScrollNext()) return;
    this.emblaApi.scrollNext();
  }

  public slideLeft(): void {
    if (!this.canScrollPrev()) return;
    this.emblaApi.scrollPrev();
  }

  public scrollTo(index: number): void {
    this.emblaApi?.scrollTo(index);
    this.index.set(index);
  }

  protected setCanScroll(): void {
    this._canScrollPrev.set(this.emblaApi.canScrollPrev());
    this._canScrollNext.set(this.emblaApi.canScrollNext());
  }

  /**
   * Called when Embla fires the internal 'select' event (e.g. after user drag/swipe).
   * Default: sync the model `index` with Embla's currently selected snap.
   *
   * Override in child components when the internal scroll snap does not map 1:1
   * to the file index (e.g. thumbnails with `containScroll: 'trimSnaps'` where
   * multiple file indices may collapse into a single trimmed snap and overwrite
   * the model index with a wrong value).
   */
  protected onEmblaSelect(): void {
    this.index.set(this.emblaApi.selectedScrollSnap());
  }

  /**
   * Override this method in child components to provide custom Embla options
   */
  protected abstract getEmblaOptions(): EmblaOptionsType;
}
