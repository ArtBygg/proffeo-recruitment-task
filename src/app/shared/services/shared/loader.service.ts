import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private readonly loadingFlag: WritableSignal<boolean> = signal(false);
  private loaderInstances: number[] = [];

  public readonly loading: Signal<boolean> = computed(() => this.loadingFlag());

  public startLoading(): void {
    this.addInstance();
    this.loadingFlag.set(true);
  }

  public stopLoading(): void {
    this.removeInstance();
  }

  private addInstance(): void {
    this.loaderInstances.push(1);
  }

  private removeInstance(): void {
    this.loaderInstances.pop();
    if (this.loaderInstances.length === 0) {
      this.loadingFlag.set(false);
      return;
    }
  }
}
