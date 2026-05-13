import { AfterViewInit, DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';
import { filter, fromEvent } from 'rxjs';

import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[proffeoClickedOutside]'
})
export class ClickedOutsideDirective implements AfterViewInit {
  private readonly ignoreSelectors: string =
    '.cdk-overlay-pane, .mat-mdc-select-panel, .mat-mdc-autocomplete-panel, .cdk-overlay-backdrop';
  private readonly el: ElementRef = inject(ElementRef);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly document: Document = inject(DOCUMENT);

  public readonly clickOutside = output<void>();

  public ngAfterViewInit(): void {
    fromEvent(this.document, 'click')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(event => {
          return !this.isInside(event.target as HTMLElement, event);
        })
      )
      .subscribe(() => {
        this.clickOutside.emit();
      });
  }

  private isInside(elementToCheck: HTMLElement, event: Event): boolean {
    const host = this.el.nativeElement;
    const path = event.composedPath?.() as EventTarget[] | undefined;

    if (path ? path.includes(host) : host.contains(event.target as Node)) return true;

    const target = event.target as HTMLElement | null;
    return !!target?.closest(this.ignoreSelectors);
  }
}
