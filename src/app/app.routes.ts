import { Routes } from '@angular/router';
import { LayoutComponent } from '@app/shared/components/layout/layout.component';
import { companyRoute } from '@app/views/company/company.routing';
import { UrlSegment } from '@app/shared/types/enums/url-segment.enum';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: `${UrlSegment.COMPANIES}/:company-id`,
        loadChildren: () => companyRoute
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
