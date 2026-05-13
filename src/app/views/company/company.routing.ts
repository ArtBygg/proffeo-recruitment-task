import { Route } from '@angular/router';
import { UrlSegment } from '@app/shared/types/enums/url-segment.enum';
import { projectsRoutes } from '@app/views/company/projects/projects.routing';

export const companyRoute: Route[] = [
  {
    path: UrlSegment.PROJECTS,
    loadChildren: () => projectsRoutes
  }
];
