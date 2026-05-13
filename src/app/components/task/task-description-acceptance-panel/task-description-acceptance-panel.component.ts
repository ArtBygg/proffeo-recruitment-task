import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { TaskDescriptionAcceptancesActionsService } from '@app/shared/services/actions/task-description-acceptances-actions.service';
import { AuthService } from '@app/shared/services/auth.service';
import { ToastService } from '@app/shared/services/shared/toast.service';
import { TaskDescriptionAcceptancesDataService } from '@app/shared/services/task-description-acceptances-data.service';
import { TaskDescriptionAcceptance } from '@app/shared/types/models/task/task-description-acceptance.model';
import { TaskParticipant } from '@app/shared/types/models/task/task-participant.model';
import { Task } from '@app/shared/types/models/task/task.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';

export interface TaskDescriptionAcceptanceParticipantRow {
  readonly rowId: string;
  readonly displayName: string;
  readonly hasAccepted: boolean;
  readonly showAcceptButton: boolean;
  readonly showPendingLabel: boolean;
}

export interface TaskDescriptionAcceptanceSummary {
  readonly acceptedCount: number;
  readonly requiredCount: number;
}

/**
 * Collapsible panel listing task participants and their description-acceptance status.
 */
@Component({
  selector: 'proffeo-task-description-acceptance-panel',
  templateUrl: './task-description-acceptance-panel.component.html',
  styleUrl: './task-description-acceptance-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full'
  },
  imports: [MatButtonToggleModule, MatExpansionModule, MatIconModule, TranslateModule]
})
export class TaskDescriptionAcceptancePanelComponent {
  private readonly acceptancesData = inject(TaskDescriptionAcceptancesDataService);
  private readonly acceptancesActions = inject(TaskDescriptionAcceptancesActionsService);
  private readonly authService = inject(AuthService);
  private readonly translate = inject(TranslateService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isAcceptSubmitting = signal(false);

  protected readonly participantRows = computed((): TaskDescriptionAcceptanceParticipantRow[] => {
    const taskId = this.task().id;
    const acceptances = this.acceptancesData.getAcceptances(taskId)();
    const acceptedUserIds = new Set(acceptances.map(a => a.createdById));
    const currentUserId = this.authService.currentUser()?.id;
    const seenUserIds = new Set<string>();
    const rows: TaskDescriptionAcceptanceParticipantRow[] = [];
    const participants = this.taskParticipants();

    for (let index = 0; index < participants.length; index++) {
      const participant = participants[index];
      const projectParticipant = participant.projectParticipant?.();
      const user = projectParticipant?.user?.();
      const userId = user?.id ?? '';
      if (userId !== '') {
        if (seenUserIds.has(userId)) {
          continue;
        }
        seenUserIds.add(userId);
      }

      const displayName = user?.fullName?.trim() || this.translate.instant('task-description-comments.unknown-user');
      const stableParticipantKey = participant.id ?? projectParticipant?.id ?? '';
      const rowId = userId !== '' ? userId : stableParticipantKey || `participant-${index}`;
      const hasAccepted = userId !== '' && acceptedUserIds.has(userId);
      const isSelf = currentUserId != null && userId !== '' && userId === currentUserId;

      rows.push({
        rowId,
        displayName,
        hasAccepted,
        showAcceptButton: !hasAccepted && isSelf,
        showPendingLabel: !hasAccepted && !isSelf
      });
    }

    return [...rows].sort((a, b) => a.displayName.localeCompare(b.displayName));
  });

  protected readonly acceptanceSummary = computed((): TaskDescriptionAcceptanceSummary => {
    const rows = this.participantRows();

    return {
      acceptedCount: rows.filter(row => row.hasAccepted).length,
      requiredCount: rows.length
    };
  });

  public readonly task = input.required<Task>();
  public readonly taskParticipants = input.required<TaskParticipant[]>();
  public readonly descriptionAccepted = output<TaskDescriptionAcceptance>();

  protected onAcceptDescription(): void {
    if (this.isAcceptSubmitting()) {
      return;
    }
    this.isAcceptSubmitting.set(true);
    this.acceptancesActions
      .createAcceptance(this.task().id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isAcceptSubmitting.set(false))
      )
      .subscribe({
        next: acceptance => this.descriptionAccepted.emit(acceptance),
        error: () => this.toastService.error(this.translate.instant('task-description-acceptance-panel.toast-error'))
      });
  }
}
