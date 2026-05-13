import { IdBased } from '../shared/id-based.model';

export class TaskDescriptionAcceptance implements IdBased {
  public id: string;
  public createdAt: Date | undefined;
  public createdById: string;
  public updatedAt: Date | undefined;

  public constructor(value: Partial<TaskDescriptionAcceptance>) {
    Object.assign(this, value);
  }
}
