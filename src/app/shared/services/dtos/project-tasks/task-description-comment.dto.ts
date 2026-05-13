import { TaskDescriptionCommentAction } from '@app/shared/types/enums/task-description-comment-action.enum';

export interface TaskDescriptionCommentDTO {
  id: string;
  projectTaskDescriptionId: string;
  action: TaskDescriptionCommentAction;
  content?: string | null;
  createdAt: string;
  createdById: string;
  updatedAt?: string | null;
}

export interface CreateTaskDescriptionCommentDTO {
  content?: string | null;
  action: TaskDescriptionCommentAction;
}

export interface UpdateTaskDescriptionCommentDTO {
  content?: string | null;
  action: TaskDescriptionCommentAction;
}
