import { DestroyRef, Directive, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';

const BADGE_CLASSES =
  'absolute -top-2 -right-2 w-5 h-5 z-10 flex items-center justify-center rounded-full bg-accent text-white text-sm font-medium';

@Directive({
  selector: '[proffeoFilterCountBadge]',
  host: {
    class: 'relative'
  }
})
export class FilterCountBadgeDirective {
  private readonly hostElement = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private badge: HTMLElement | null = null;

  public readonly proffeoFilterCountBadge = input<number | null | undefined>(0);

  public constructor() {
    this.badge = this.renderer.createElement('span');
    this.badge.className = `${BADGE_CLASSES}`;
    this.renderer.appendChild(this.hostElement.nativeElement, this.badge);

    effect(() => {
      const value = this.proffeoFilterCountBadge();
      if (!this.badge) return;
      const hasCount = value != null && value > 0;
      const visibilityClass = hasCount ? 'flex' : 'hidden';
      this.badge.className = `${BADGE_CLASSES} ${visibilityClass}`;
      this.badge!.textContent = hasCount ? String(value) : '';
    });

    this.destroyRef.onDestroy(() => {
      if (this.badge?.parentNode) {
        this.renderer.removeChild(this.hostElement.nativeElement, this.badge);
      }
      this.badge = null;
    });
  }
}
