import { Route } from '@angular/router';

import { TasksActionsService } from '@app/shared/services/actions/tasks-actions.service';
import { ActiveTaskService } from './active-task.service';
import { ProjectTasksComponent } from './project-tasks.component';
import { ProjectTasksViewComponent } from './tasks-list/project-tasks-view.component';

export const tasksRoutes: Route[] = [
  {
    path: '',
    component: ProjectTasksComponent,
    providers: [TasksActionsService, ActiveTaskService],
    children: [
      {
        path: ':task-id',
        component: ProjectTasksViewComponent,
        data: {
          breadcrumbTranslationKey: 'breadcrumb-tasks'
        }
      },
      {
        path: '',
        component: ProjectTasksViewComponent,
        data: {
          breadcrumbTranslationKey: 'breadcrumb-tasks'
        }
      }
    ]
  }
];
