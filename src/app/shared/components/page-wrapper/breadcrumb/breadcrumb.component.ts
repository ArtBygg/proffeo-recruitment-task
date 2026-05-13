import { Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Route, Router, RouterLink } from '@angular/router';
import { CompaniesDataService } from '@app/shared/services/companies-data.service';
import { ProjectsDataService } from '@app/shared/services/projects-data.service';
import { TasksDataService } from '@app/shared/services/tasks-data.service';
import { UrlSegment } from '@app/shared/types/enums/url-segment.enum';
import { Task } from '@app/shared/types/models/task/task.model';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'proffeo-breadcrumb',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
  private readonly router: Router = inject(Router);
  private readonly projectsDataService: ProjectsDataService = inject(ProjectsDataService);
  private readonly companiesDataService: CompaniesDataService = inject(CompaniesDataService);

  private readonly tasksDataService: TasksDataService = inject(TasksDataService);
  private readonly currentUrl: WritableSignal<string> = signal(this.router.url);
  public readonly breadcrumbs: Signal<BreadcrumbItem[]> = computed(() => {
    const url: string = this.currentUrl().split('?')[0];
    const segments: string[] = url.split('/').filter(Boolean);
    return this.buildBreadcrumbs(segments);
  });

  public constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(event => {
        this.currentUrl.set(event.urlAfterRedirects);
      });
  }

  private buildBreadcrumbs(segments: string[]): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [];
    let path = '';
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      path += `/${segment}`;

      if (i + 1 < segments.length && this.isUuid(segments[i + 1])) {
        const resourceId = segments[i + 1];
        const basePath = path;
        path += `/${resourceId}`;
        i++;

        if (segment === UrlSegment.TASKS) {
          const taskBreadcrumbs = this.getTaskBreadcrumbs(resourceId, basePath);
          items.push(...taskBreadcrumbs);
        } else {
          const label = this.findLabel(segment, resourceId);
          items.push({ label, url: path });
        }
      } else {
        const label = this.getTranslationKeyForSegment(segment) || this.formatSegment(segment);
        items.push({ label, url: path });
      }
    }
    return items;
  }

  private getTaskBreadcrumbs(taskId: string, basePath: string): BreadcrumbItem[] {
    const task = this.tasksDataService.getById(taskId)();
    if (!task) {
      return [{ label: 'breadcrumb-task', url: `${basePath}/${taskId}` }];
    }

    const breadcrumbs: BreadcrumbItem[] = [];
    this.collectParentTasks(task, basePath, breadcrumbs);

    return breadcrumbs;
  }

  private collectParentTasks(task: Task, basePath: string, breadcrumbs: BreadcrumbItem[]): void {
    const parentTask = task.parentTask?.();
    if (parentTask) {
      this.collectParentTasks(parentTask, basePath, breadcrumbs);
    }
    breadcrumbs.push({
      label: task.name || 'breadcrumb-task',
      url: `${basePath}/${task.id}`
    });
  }

  private isUuid(segment: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
  }

  private findLabel(segment: string, resourceId: string): string {
    switch (segment) {
      case UrlSegment.COMPANIES:
        return this.companiesDataService.getById(resourceId)()?.name || 'breadcrumb-companies';
      case UrlSegment.PROJECTS:
        return this.projectsDataService.getById(resourceId)()?.name || 'breadcrumb-projects';
      case UrlSegment.TASKS:
        return this.tasksDataService.getById(resourceId)()?.name || 'breadcrumb-tasks';
      default:
        return `breadcrumb-${segment}`;
    }
  }

  private formatSegment(segment: string): string {
    return segment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  private getTranslationKeyForSegment(segment: string): string | null {
    let route: ActivatedRoute = this.router.routerState.root;

    while (route) {
      const routeSegment = route.snapshot.url.map(s => s.path).join('/');
      if (routeSegment === segment && route.snapshot.data['breadcrumbTranslationKey']) {
        return route.snapshot.data['breadcrumbTranslationKey'];
      }
      route = route.firstChild!;
    }

    return this.findTranslationKeyInRoutes(this.router.config, segment);
  }

  private findTranslationKeyInRoutes(routes: Route[], targetSegment: string): string | null {
    for (const route of routes) {
      if (route.path === targetSegment && route.data?.['breadcrumbTranslationKey']) {
        return route.data['breadcrumbTranslationKey'];
      }
      if (route.children) {
        const found = this.findTranslationKeyInRoutes(route.children, targetSegment);
        if (found) return found;
      }
    }
    return null;
  }
}
