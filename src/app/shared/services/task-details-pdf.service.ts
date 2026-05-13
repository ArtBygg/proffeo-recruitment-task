import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { FileDataService, FileUrlParams } from '@app/shared/services/file-data.service';
import { TaskDetailsPdfHttpService } from '@app/shared/services/http/task-details-pdf-http.service';
import { TaskActivitiesDataService } from '@app/shared/services/task-activities-data.service';
import { TaskParticipantsDataService } from '@app/shared/services/task-participants-data.service';
import { FileContext } from '@app/shared/types/enums/file-enums';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { Sections } from '@app/shared/types/models/pdf/task-details/sections.model';
import { TaskDetailsPdfRequest } from '@app/shared/types/models/pdf/task-details/task-details-pdf-request.model';
import { ProjectParticipant } from '@app/shared/types/models/project/project-participant';
import { TaskActivity } from '@app/shared/types/models/task-activities/task-activity';
import { TaskParticipant } from '@app/shared/types/models/task/task-participant.model';
import { Task } from '@app/shared/types/models/task/task.model';
import { User } from '@app/shared/types/models/user/user.model';
import { FileSaverService } from 'ngx-filesaver';
import { map, Observable, tap } from 'rxjs';

/**
 * TaskDetailsPdfService – buduje request PDF szczegółów zadania i obsługuje generowanie oraz zapis pliku.
 *
 * Pobiera dane do podglądu (aktywności, uczestnicy, pliki) oraz
 * wywołuje API generowania PDF na podstawie przekazanej konfiguracji sekcji.
 *
 * Scope: Component-level – dostarczany w {@link TaskDetailsPdfModalComponent}.
 *
 * Usage: Używany przez {@link TaskDetailsPdfModalComponent} (konfiguracja i generowanie)
 * oraz przez {@link TaskDetailsPdfComponent} (odczyt sygnałów: aktywności, uczestnicy, załączniki).
 *
 * Architecture:
 * - {@link TaskDetailsPdfHttpService}: wywołania API generowania PDF
 * - {@link FileDataService}: pliki zadania (załączniki, obrazy)
 * - {@link TaskActivitiesDataService}, {@link TaskParticipantsDataService}: dane do podglądu w konfiguratorze
 */
@Injectable()
export class TaskDetailsPdfService {
  private readonly pdfHttpService: TaskDetailsPdfHttpService = inject(TaskDetailsPdfHttpService);
  private readonly fileSaverService: FileSaverService = inject(FileSaverService);
  private readonly taskParticipantsService: TaskParticipantsDataService = inject(TaskParticipantsDataService);
  private readonly taskActivitiesService: TaskActivitiesDataService = inject(TaskActivitiesDataService);
  private readonly fileDataService: FileDataService = inject(FileDataService);

  private readonly _task: WritableSignal<Task | undefined> = signal(undefined);

  public readonly taskActivities: Signal<TaskActivity[] | undefined> = computed(() => {
    const taskId = this._task()?.id;
    if (!taskId) return undefined;
    return this.taskActivitiesService.getTaskActivities(taskId)();
  });

  public readonly groupedActivities: Signal<TaskActivity[][]> = computed(() => {
    const activities = this.taskActivities();
    if (!activities) return [];
    return this.groupActivitiesByUser(activities);
  });

  public readonly projectParticipants: Signal<ProjectParticipant[] | undefined> = computed(() => {
    const taskId = this._task()?.id;
    if (!taskId) return undefined;
    return this.taskParticipantsService
      .getTaskParticipants(taskId)()
      ?.map((participant: TaskParticipant) => participant.projectParticipant());
  });

  public readonly projectUsers: Signal<User[] | undefined> = computed(() =>
    this.projectParticipants()
      ?.filter(participant => participant.role === 'None')
      ?.map((participant: ProjectParticipant) => participant.user())
  );

  public readonly imageAttachments: Signal<FileInfo[]> = computed(() => {
    const taskId = this._task()?.id;
    if (!taskId) return [];
    const fileParams: FileUrlParams = { context: FileContext.taskFile, taskId };
    const allFiles = this.fileDataService.getFiles(fileParams)();
    return (allFiles ?? []).filter(file => file.isImage());
  });

  public generate(task: Task, sections: Sections): Observable<void> {
    const request: TaskDetailsPdfRequest = {
      sections,
      fileName: `task_${task.taskNumber}_${task.name}.pdf`,
      language: 'EN'
    };

    return this.pdfHttpService.createTaskDetailsPdf(task.id, request).pipe(
      tap(response => {
        let fileName = request.fileName ?? 'task.pdf';
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const fileNameRegex = /filename[^;=\n]*=((['"])*?\2|[^;\n]*)/;
          const matches = fileNameRegex.exec(contentDisposition);
          if (matches !== null && matches[1]) {
            fileName = matches[1].replace(/['"]/g, '');
          }
        }

        const blob = new Blob([response.body!], { type: 'application/pdf' });
        this.fileSaverService.save(blob, fileName);
      }),
      map(() => void 0)
    );
  }

  public reset(task: Task): void {
    this._task.set(task);
  }

  private groupActivitiesByUser(activities: TaskActivity[]): TaskActivity[][] {
    const grouped: TaskActivity[][] = [];
    let currentGroup: TaskActivity[] = [];
    let lastEmail = '';
    let lastDate: Date | undefined;

    activities.forEach((activity: TaskActivity) => {
      const email = activity?.user()?.email;
      if (!email) return;

      if (email === lastEmail && !this.timeDiffGreaterThan(5, activity.date, lastDate)) {
        currentGroup.push(activity);
      } else {
        if (currentGroup.length > 0) grouped.push(currentGroup);
        currentGroup = [activity];
      }

      lastEmail = email;
      lastDate = activity.date;
    });

    if (currentGroup.length > 0) grouped.push(currentGroup);
    return grouped;
  }

  private timeDiffGreaterThan(minutes: number, youngerDate: Date | undefined, olderDate: Date | undefined): boolean {
    if (!olderDate || !youngerDate) return false;
    const parsedYounger = youngerDate.getTime() / 1000 / 60;
    const parsedOlder = olderDate.getTime() / 1000 / 60;
    return parsedYounger - parsedOlder > minutes;
  }
}
