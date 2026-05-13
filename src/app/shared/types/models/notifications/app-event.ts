import { AppEventType } from '../../enums/app-event-type';

export interface AppEvent {
  eventType: AppEventType;
  data: unknown;
}
