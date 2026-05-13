import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectsHttpService } from '@app/shared/services/http/projects-http.service';
import { Company } from '@app/shared/types/models/company/company.model';
import { AppEvent } from '@app/shared/types/models/notifications/app-event';
import { Project } from '@app/shared/types/models/project/project.model';
import { Observable } from 'rxjs';
import { ActiveCompanyService } from '../active-company.service';
import { ImportTasksResultDTO } from '../dtos/imports/import-tasks-result.dto';
import { NotificationsService } from '../notifications.service';
import { ProjectsDataService } from '../projects-data.service';

/**
 * ProjectActionsService - Facade for shared project mutation / action operations.
 *
 * Centralizes user-triggered actions that involve project-related API calls or side effects.
 *
 * Architecture:
 * - {@link ProjectActionsService}: User actions, side effects (e.g. file download)
 * - {@link ProjectsDataService}: Data access, queries, store management
 * - {@link ProjectsHttpService}: HTTP API calls
 */
@Injectable({ providedIn: 'root' })
export class ProjectActionsService {
  private readonly notificationsService = inject(NotificationsService);
  private readonly projectsHttpService = inject(ProjectsHttpService);

  private readonly activeCompanyService = inject(ActiveCompanyService);
  private readonly projectsDataService = inject(ProjectsDataService);

  public constructor() {
    this.notificationsService.notifications$.pipe(takeUntilDestroyed()).subscribe({
      next: (event: AppEvent) => {
        this.handleEvent(event);
      }
    });
  }

  protected handleEvent(event: AppEvent): void {
    if (event.eventType === 'ActiveCompanySet') {
      this.projectsDataService.loadCompanyProjects((event.data as Company).id);
      this.projectsDataService.loadCompanyArchivedProjects((event.data as Company).id);
      this.projectsDataService.loadCompanyDraftProjects((event.data as Company).id);
    }

    if (
      event.eventType == 'CooperationAccepted' ||
      event.eventType == 'CooperationRejected' ||
      event.eventType == 'CooperationDeactivated'
    ) {
      const activeCompany = this.activeCompanyService.activeCompany();
      if (activeCompany) {
        this.projectsDataService.reloadCompanyProjects(activeCompany.id);
      }
    }
  }

  public exportTaskImportTemplate(project: Project): void {
    if (!project?.id) return;

    this.projectsHttpService.getImportTasksTemplate(project.id).subscribe({
      next: response => {
        const blob = response.body;
        if (!blob) return;

        let fileName = 'task-import-template.xlsx';
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const fileNameRegex = /filename[^;=\n]*=((['"])*?\2|[^;\n]*)/;
          const matches = fileNameRegex.exec(contentDisposition);
          if (matches != null && matches[1]) {
            fileName = matches[1].replace(/['"]/g, '');
          }
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    });
  }

  public importTasks(projectId: string, file: File): Observable<ImportTasksResultDTO> {
    return this.projectsHttpService.importTasks(projectId, file);
  }
}
