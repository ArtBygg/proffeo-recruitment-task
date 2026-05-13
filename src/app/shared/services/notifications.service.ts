import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppEvent } from '../types/models/notifications/app-event';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly notifications = new BehaviorSubject<AppEvent>({
    eventType: 'ApplicationStarting',
    data: undefined
  });

  public notifications$ = this.notifications.asObservable();

  public notify(notification: AppEvent): void {
    this.notifications.next(notification);
  }
}
