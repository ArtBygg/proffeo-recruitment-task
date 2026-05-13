import { Route } from '@angular/router';
import { UrlSegment } from '@app/shared/types/enums/url-segment.enum';
import { tasksRoutes } from '@app/views/company/projects/tasks/project-tasks.routing';
import { ProjectsComponent } from './projects.component';

export const projectsRoutes: Route[] = [
  {
    path: '',
    component: ProjectsComponent,
    children: [
      {
        path: ':project-id',
        children: [
          {
            path: '',
            redirectTo: UrlSegment.TASKS,
            pathMatch: 'full'
          },
          {
            path: UrlSegment.TASKS,
            loadChildren: () => tasksRoutes
          },
          {
            path: UrlSegment.MY_TASKS,
            loadChildren: () => tasksRoutes
          }
        ]
      }
    ]
  }
];
