import { User } from '@app/shared/types/models/user/user.model';

export class TaskTimer {
  public id: string | undefined;
  public taskId: string | undefined;
  public userId: string | undefined;
  public user: User | undefined;
  public timerStartedOn: Date | undefined;
  public alreadyTrackedSeconds: number;

  public constructor(init?: Partial<TaskTimer>) {
    if (!init) return;
    const fields = { ...init };
    delete (fields as Record<string, unknown>).isStarted;
    Object.assign(this, fields);
    if (typeof init.timerStartedOn === 'string') {
      this.timerStartedOn = new Date(init.timerStartedOn as string);
    }
  }

  public get isStarted(): boolean {
    return !!this.timerStartedOn;
  }
}
