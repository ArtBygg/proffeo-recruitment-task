import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  ElementRef,
  inject,
  input,
  OnChanges,
  output,
  signal,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DeviceService } from '@app/shared/services/shared/device.service';

export type SwipeDirection = 'left' | 'right';
export type SwipeMode = 'vertical' | 'horizontal';
export type PanelState = 'collapsed' | 'expanded';

const SWIPE_THRESHOLD = 50;
const HORIZONTAL_SWIPE_THRESHOLD = 100;
const SWIPE_DETECTION_THRESHOLD = 10;
const ANIMATION_DURATION = 300;

interface TouchPosition {
  x: number;
  y: number;
}

interface SwipeState {
  mode: SwipeMode | null;
  startPosition: TouchPosition;
  startTranslateY: number;
  isDragging: boolean;
  isSwipingHorizontally: boolean;
  currentTranslateX: number;
  currentTranslateY: number;
  direction: SwipeDirection | null;
}

@Component({
  selector: 'proffeo-slide-panel',
  templateUrl: './slide-panel.component.html',

  imports: [MatIconModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlidePanelComponent implements OnChanges {
  @ContentChild('header') public headerTemplate!: TemplateRef<unknown>;
  @ContentChild('content') public contentTemplate!: TemplateRef<unknown>;
  @ViewChild('scrollable', { static: false }) public scrollable!: ElementRef;

  private readonly deviceService = inject(DeviceService);

  protected readonly panelState = signal<PanelState>('collapsed');
  protected readonly swipeState = signal<SwipeState>({
    mode: null,
    startPosition: { x: 0, y: 0 },
    startTranslateY: 0,
    isDragging: false,
    isSwipingHorizontally: false,
    currentTranslateX: 0,
    currentTranslateY: 0,
    direction: null
  });

  protected readonly isMobile = computed(() => this.deviceService.isMobile());
  protected readonly isDragging = computed(() => this.swipeState().isDragging);
  protected readonly isSwipingHorizontally = computed(() => this.swipeState().isSwipingHorizontally);
  protected readonly currentTranslateX = computed(() => this.swipeState().currentTranslateX);
  protected readonly currentTranslateY = computed(() => this.swipeState().currentTranslateY);
  protected readonly swipeDirection = computed(() => this.swipeState().direction);
  protected readonly Math = Math;

  public readonly isOpen = input<boolean>(false);
  public readonly mobileCollapsedHeight = input<number>(200);
  public readonly showBackdrop = input<boolean>(true);
  public readonly closed = output<void>();
  public readonly swipeHorizontal = output<SwipeDirection>();

  public ngOnChanges(): void {
    if (this.isOpen() && this.isMobile()) {
      this.collapsePanel();
    }
  }

  public onTouchStart(event: TouchEvent): void {
    if (!this.isMobile()) return;

    const target = event.target as HTMLElement;
    if (this.shouldIgnoreSwipe(target)) {
      return;
    }

    const touch = event.touches[0];
    this.updateSwipeState({
      startPosition: { x: touch.clientX, y: touch.clientY },
      startTranslateY: this.currentTranslateY(),
      mode: null
    });
  }

  public onTouchMove(event: TouchEvent): void {
    if (!this.isMobile()) return;

    const target = event.target as HTMLElement;
    if (this.shouldIgnoreSwipe(target)) {
      return;
    }

    const touch = event.touches[0];
    const delta = this.calculateDelta(touch);

    if (!this.swipeState().mode) {
      this.detectSwipeMode(delta);
    }

    const currentMode = this.swipeState().mode;

    if (currentMode === 'horizontal') {
      this.handleHorizontalSwipe(delta, event);
    } else if (currentMode === 'vertical') {
      this.handleVerticalSwipe(delta, event);
    }
  }

  public onTouchEnd(): void {
    if (!this.isMobile()) return;

    const state = this.swipeState();

    if (state.isSwipingHorizontally) {
      this.completeHorizontalSwipe();
    } else if (state.isDragging) {
      this.completeVerticalSwipe();
    }

    this.resetSwipeState();
  }

  public closePanel(): void {
    this.closed.emit();
  }

  private calculateDelta(touch: Touch): TouchPosition {
    const state = this.swipeState();
    return {
      x: touch.clientX - state.startPosition.x,
      y: touch.clientY - state.startPosition.y
    };
  }

  private detectSwipeMode(delta: TouchPosition): void {
    const absX = Math.abs(delta.x);
    const absY = Math.abs(delta.y);

    if (absX > absY && absX > SWIPE_DETECTION_THRESHOLD) {
      this.updateSwipeState({ mode: 'horizontal' });
    } else if (absY > absX && absY > SWIPE_DETECTION_THRESHOLD) {
      this.updateSwipeState({ mode: 'vertical' });
    }
  }

  private handleHorizontalSwipe(delta: TouchPosition, event: TouchEvent): void {
    if (this.panelState() !== 'expanded') return;

    this.updateSwipeState({
      isSwipingHorizontally: true,
      currentTranslateX: delta.x,
      direction: delta.x > 0 ? 'right' : 'left'
    });

    if (Math.abs(delta.x) > HORIZONTAL_SWIPE_THRESHOLD && event.cancelable) {
      event.preventDefault();
    }
  }

  private handleVerticalSwipe(delta: TouchPosition, event: TouchEvent): void {
    const canScroll = this.canElementScroll(event, delta.y);

    if (!canScroll) {
      if (this.panelState() === 'collapsed' && delta.y > 0) {
        return; // Ignore downward swipe when collapsed
      }

      this.updateSwipeState({
        isDragging: true,
        currentTranslateY: Math.max(0, this.swipeState().startTranslateY + delta.y)
      });
    }
  }

  private canElementScroll(event: TouchEvent, deltaY: number): boolean {
    let target = event.target as HTMLElement;

    while (target && target !== event.currentTarget) {
      const { overflowY } = window.getComputedStyle(target);
      const isScrollable = overflowY === 'auto' || overflowY === 'scroll';
      const hasScrollContent = target.scrollHeight > target.clientHeight;
      const canScrollDown = deltaY > 0 && target.scrollTop > 0;

      if (isScrollable && hasScrollContent && canScrollDown && this.panelState() === 'expanded') {
        return true;
      }

      target = target.parentElement as HTMLElement;
    }

    return false;
  }

  private completeHorizontalSwipe(): void {
    const deltaX = this.currentTranslateX();

    if (Math.abs(deltaX) > HORIZONTAL_SWIPE_THRESHOLD) {
      const direction = deltaX > 0 ? 'right' : 'left';
      this.swipeHorizontal.emit(direction);
      this.animateSwipeOut(direction);
    } else {
      this.updateSwipeState({ currentTranslateX: 0 });
    }
  }

  private completeVerticalSwipe(): void {
    const state = this.swipeState();
    const deltaY = state.currentTranslateY - state.startTranslateY;

    if (this.panelState() === 'collapsed') {
      if (-deltaY > SWIPE_THRESHOLD) {
        this.expandPanel();
      } else {
        this.collapsePanel();
      }
    } else {
      if (deltaY > SWIPE_THRESHOLD) {
        this.collapsePanel();
      } else {
        this.expandPanel();
      }
    }
  }

  private animateSwipeOut(direction: SwipeDirection): void {
    const targetX = direction === 'right' ? window.innerWidth : -window.innerWidth;
    this.updateSwipeState({ currentTranslateX: targetX });

    setTimeout(() => {
      this.updateSwipeState({ currentTranslateX: 0 });
    }, ANIMATION_DURATION);
  }

  private expandPanel(): void {
    this.panelState.set('expanded');
    this.updateSwipeState({ currentTranslateY: 0 });
  }

  private collapsePanel(): void {
    this.panelState.set('collapsed');
    const collapsedY = window.innerHeight - this.mobileCollapsedHeight();
    this.updateSwipeState({ currentTranslateY: collapsedY });
  }

  private updateSwipeState(updates: Partial<SwipeState>): void {
    this.swipeState.update(state => ({ ...state, ...updates }));
  }

  private resetSwipeState(): void {
    this.updateSwipeState({
      mode: null,
      isSwipingHorizontally: false,
      isDragging: false,
      direction: null
    });
  }

  // to prevent activating swipe gestures on editable elements
  private shouldIgnoreSwipe(target: HTMLElement): boolean {
    let element: HTMLElement | null = target;
    while (element) {
      if (element.classList.contains('no-swipe') || element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }
}
