import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { AvatarComponent } from '@app/shared/components/group-avatars/avatar/proffeo-avatar.component';
import { TasksActionsService } from '@app/shared/services/actions/tasks-actions.service';
import { TaskDescriptionCommentsDataService } from '@app/shared/services/task-description-comments-data.service';
import { UsersDataService } from '@app/shared/services/users-data.service';
import { AvatarSize } from '@app/shared/types/enums/avatar-size.enum';
import { TaskDescriptionCommentAction } from '@app/shared/types/enums/task-description-comment-action.enum';
import { TaskDescriptionStatus } from '@app/shared/types/enums/task-description-status.enum';
import { Task } from '@app/shared/types/models/task/task.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import type { TaskDescriptionCommentRow } from './task-description-comment-row.types';
import {
  formatTaskDescriptionCommentRelativeTime,
  presentationForTaskDescriptionCommentAction
} from './task-description-comment.presentation';

@Component({
  selector: 'proffeo-task-description-comments',
  templateUrl: './task-description-comments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full'
  },
  imports: [
    MatExpansionModule,
    ButtonComponent,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    TranslateModule,
    AvatarComponent
  ]
})
export class TaskDescriptionCommentsComponent {
  private readonly descriptionCommentsData = inject(TaskDescriptionCommentsDataService);
  private readonly usersData = inject(UsersDataService);
  private readonly tasksActions = inject(TasksActionsService);
  private readonly translate = inject(TranslateService);
  private readonly panelExpanded = signal(false);
  private readonly rawComments = computed(() => {
    const task = this.task();
    if (!this.panelExpanded() || !task.id) {
      return [];
    }
    return this.descriptionCommentsData.getDescriptionComments(task.id)();
  });

  protected readonly AvatarSize = AvatarSize;
  protected readonly ButtonType = ButtonType;
  protected readonly TaskDescriptionCommentAction = TaskDescriptionCommentAction;
  protected readonly draftContent = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly showAccept = computed(() => {
    const task = this.task();
    const taskType = task.taskType();
    return (
      task.projectTaskDescriptionStatus === TaskDescriptionStatus.ReviewRequested &&
      taskType?.isDescriptionCommentingEnabled === true
    );
  });
  protected readonly showReject = computed(() => {
    const task = this.task();
    const taskType = task.taskType();
    const statusAllows =
      task.projectTaskDescriptionStatus === TaskDescriptionStatus.ReviewRequested ||
      task.projectTaskDescriptionStatus === TaskDescriptionStatus.Accepted;
    return statusAllows && taskType?.isDescriptionCommentingEnabled === true;
  });
  protected readonly showRequestChange = computed(() => {
    const task = this.task();
    const taskType = task.taskType();
    const statusAllows =
      task.projectTaskDescriptionStatus === TaskDescriptionStatus.ReviewRequested ||
      task.projectTaskDescriptionStatus === TaskDescriptionStatus.Accepted;
    return statusAllows && taskType?.isDescriptionCommentingEnabled === true;
  });
  protected readonly showReadyForReview = computed(() => {
    const task = this.task();
    const taskType = task.taskType();
    const statusAllows =
      task.projectTaskDescriptionStatus === TaskDescriptionStatus.InProgress ||
      task.projectTaskDescriptionStatus === TaskDescriptionStatus.Rejected;
    return statusAllows && taskType?.isDescriptionCommentingEnabled === true;
  });
  /** Fallback when no workflow action buttons apply (e.g. missing task-type allow flags). */
  protected readonly showSendReview = computed(
    () => !this.showAccept() && !this.showReject() && !this.showRequestChange() && !this.showReadyForReview()
  );

  protected readonly commentRows = computed((): TaskDescriptionCommentRow[] => {
    if (!this.panelExpanded()) {
      return [];
    }
    const lang = this.translate.currentLang;
    return this.rawComments().map(comment => ({
      comment,
      user: this.usersData.getById(comment.createdById),
      relativeTime: formatTaskDescriptionCommentRelativeTime(comment.createdAt, lang),
      ...presentationForTaskDescriptionCommentAction(comment.action)
    }));
  });

  public readonly task = input.required<Task>();

  protected onPanelOpened(): void {
    this.panelExpanded.set(true);
  }

  protected onPanelClosed(): void {
    this.panelExpanded.set(false);
  }

  protected onDraftInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.draftContent.set(value);
  }

  protected onAcceptClicked(): void {
    this.runSubmit({ action: TaskDescriptionCommentAction.Accept, content: this.optionalDraft() });
  }

  protected onRejectClicked(): void {
    this.runSubmit({ action: TaskDescriptionCommentAction.Reject, content: this.optionalDraft() });
  }

  protected onRequestChangeClicked(): void {
    this.runSubmit({
      action: TaskDescriptionCommentAction.RequestChanges,
      content: this.optionalDraft()
    });
  }

  protected onReadyForReviewClicked(): void {
    this.runSubmit({
      action: TaskDescriptionCommentAction.ReadyForReview,
      content: this.optionalDraft()
    });
  }

  protected onSendReviewClicked(): void {
    const text = this.draftContent().trim();
    this.runSubmit({
      action: TaskDescriptionCommentAction.Save,
      content: text.length > 0 ? text : undefined
    });
  }

  private optionalDraft(): string | undefined {
    const text = this.draftContent().trim();
    return text.length > 0 ? text : undefined;
  }

  private runSubmit(payload: { action: TaskDescriptionCommentAction; content?: string | null }): void {
    const task = this.task();
    if (!task.id || this.isSubmitting()) {
      return;
    }
    this.isSubmitting.set(true);

    this.tasksActions
      .submitTaskDescriptionComment(task, {
        action: payload.action,
        content: payload.content ?? undefined
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe(() => {
        this.draftContent.set('');
      });
  }
}
