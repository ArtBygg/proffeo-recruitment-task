import { computed, effect, inject, Injectable, linkedSignal, Signal, signal, WritableSignal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ProjectsDataService } from '@app/shared/services/projects-data.service';
import { UrlSegment as ProffeoUrlSegment } from '@app/shared/types/enums/url-segment.enum';
import { Project } from '@app/shared/types/models/project/project.model';
import { parseShellCompanyId, parseShellProjectId } from '@app/shared/utils/shell-route-url.util';
import { filter } from 'rxjs';
import { AuthService } from './auth.service';
import { LocalStorageService } from './local-storage.service';

/**
 * ActiveProjectService - Application-wide active project context (single source of truth).
 *
 * Resolves the current {@link Project} from {@link ProjectsDataService} using the project id from the URL when the
 * user is signed in (takes precedence), otherwise the id from {@link LocalStorageService}, and writes the resolved id
 * back when it changes so context survives refresh.
 *
 * Usage: Task routes and any feature that needs the project selected in the shell without injecting
 * {@link ProjectsDataService} for “active project” only.
 *
 * Architecture:
 * - {@link ActiveProjectService}: Active project entity + `activeProjectId` persistence
 * - {@link ProjectsDataService}: Project store and company project lists
 * - {@link LocalStorageService}: `activeProjectId` read/write across refresh
 */
@Injectable({ providedIn: 'root' })
export class ActiveProjectService {
  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);
  private readonly projectsDataService: ProjectsDataService = inject(ProjectsDataService);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);

  private readonly shellUrl = signal(this.router.url);

  private readonly _activeProject: WritableSignal<Project | undefined> = linkedSignal(() => {
    const user = this.authService.currentUser();
    const projectIdFromUrl = user ? parseShellProjectId(this.shellUrl()) : null;
    const candidateId = projectIdFromUrl ?? this.localStorageService.activeProjectId();
    if (!candidateId) {
      return undefined;
    }
    return this.projectsDataService.getById(candidateId)();
  });

  public readonly activeProject: Signal<Project | undefined> = this._activeProject.asReadonly();
  public readonly activeProjectId: Signal<string | undefined> = computed(() => this.activeProject()?.id);
  public readonly activeProjectName: Signal<string | undefined> = computed(() => this.activeProject()?.name);

  public constructor() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.shellUrl.set(this.router.url);
    });

    effect(() => {
      const project = this.activeProject();
      if (!project) {
        return;
      }
      this.localStorageService.setActiveProjectId(project.id);
    });
  }

  public clearActiveProject(): void {
    this._activeProject.set(undefined);
    this.localStorageService.setActiveProjectId(undefined);
  }

  public setActiveProject(project: Project | undefined): void {
    if (!project) {
      return;
    }
    this._activeProject.set(project);
    this.navigateToProject(project.id);
  }

  private navigateToProject(projectId: string): void {
    const parsed = this.router.parseUrl(this.router.url);
    const primary = parsed.root.children['primary'];
    const pathSegments = primary?.segments.map(segment => segment.path) ?? [];

    const projectsIndex = pathSegments.findIndex(segment => segment === ProffeoUrlSegment.PROJECTS);
    const projectIdSegmentIndex = projectsIndex + 1;
    const isProjectShell =
      projectsIndex >= 0 &&
      projectIdSegmentIndex < pathSegments.length &&
      pathSegments[projectIdSegmentIndex] !== ProffeoUrlSegment.CREATE;

    let commands: (string | number)[];
    if (isProjectShell) {
      commands = [
        '/',
        ...pathSegments.slice(0, projectIdSegmentIndex),
        projectId,
        ...pathSegments.slice(projectIdSegmentIndex + 1)
      ];
    } else {
      const companyId = parseShellCompanyId(this.router.url) ?? this.localStorageService.activeCompanyId();
      if (!companyId) {
        return;
      }
      commands = ['/', ProffeoUrlSegment.COMPANIES, companyId, ProffeoUrlSegment.PROJECTS, projectId];
    }

    void this.router.navigate(commands, {
      queryParams: parsed.queryParams,
      fragment: parsed.fragment ?? undefined,
      replaceUrl: true
    });
  }
}
