import { Signal } from '@angular/core';
import { TaskDescriptionComment } from '@app/shared/types/models/task/task-description-comment.model';
import { User } from '@app/shared/types/models/user/user.model';

export interface TaskDescriptionCommentRow {
  comment: TaskDescriptionComment;
  user: Signal<User | undefined>;
  relativeTime: string;
  badgeKey: string;
  cardClass: string;
  badgeClass: string;
  badgeIcon: string;
  contentClass: string;
}
