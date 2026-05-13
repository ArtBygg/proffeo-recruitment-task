import { IdBased } from '../shared/id-based.model';

export class TaskType implements IdBased {
  public id: string | undefined;
  public code: string | undefined;
  public name: string | undefined;
  public isDescriptionCommentingEnabled: boolean | undefined;
  // public allowAccept: boolean | undefined;
  // public allowReject: boolean | undefined;
  // public allowRequestChanges: boolean | undefined;
  // public allowReadyForReview: boolean | undefined;

  public constructor(data: Partial<TaskType>) {
    Object.assign(this, data);
  }
}
