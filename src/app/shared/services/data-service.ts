import { inject, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppEvent } from '../types/models/notifications/app-event';
import { NotificationsService } from './notifications.service';

export abstract class DataService<D, R> {
  protected readonly notificationService: NotificationsService = inject(NotificationsService);

  public constructor() {
    this.notificationService.notifications$.pipe(takeUntilDestroyed()).subscribe({
      next: (event: AppEvent) => {
        this.handleEvent(event);
      }
    });
  }

  protected handleEvent(event: AppEvent): void {
    void event;
  }

  public abstract getById(id: string): Signal<R>;
  public abstract upsertLocalData(dto: D): Signal<R>;
}
