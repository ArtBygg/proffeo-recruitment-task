import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private readonly MOBILE_BREAKPOINT = '(max-width: 960px)';
  private readonly _isMobile: WritableSignal<boolean> = signal(false);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  public readonly isMobile: Signal<boolean> = this._isMobile.asReadonly();

  public constructor() {
    this.breakpointObserver
      .observe(this.MOBILE_BREAKPOINT)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: breakpoint => this._isMobile.set(breakpoint.matches),
        error: (error: unknown) => console.error('Error observing breakpoint', error)
      });
  }
}
