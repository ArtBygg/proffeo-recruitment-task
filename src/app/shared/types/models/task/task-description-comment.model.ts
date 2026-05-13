import { TaskDescriptionCommentAction } from '@app/shared/types/enums/task-description-comment-action.enum';
import { IdBased } from '../shared/id-based.model';

export class TaskDescriptionComment implements IdBased {
  public id: string;
  public projectTaskDescriptionId: string;
  public action: TaskDescriptionCommentAction;
  public content: string | undefined;
  public createdAt: Date | undefined;
  public createdById: string;
  public updatedAt: Date | undefined;

  public constructor(value: Partial<TaskDescriptionComment>) {
    Object.assign(this, value);
  }
}
