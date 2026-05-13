import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TaskFiltersHelperService } from '@app/components/task/task-list-toolbar/task-filters-helper.service';
import { TaskFiltersService } from '@app/components/task/task-list-toolbar/task-filters.service';
import { IntlCurrencyPipe } from '@app/shared/pipes/intl-currency.pipe';
import { IntlDurationPipe } from '@app/shared/pipes/intl-duration.pipe';
import { ActiveTaskService } from './active-task.service';
import { TasksListActionsService } from './tasks-list-actions.service';

@Component({
  selector: 'proffeo-tasks',
  template: '<router-outlet></router-outlet>',
  imports: [RouterModule],
  providers: [
    IntlDurationPipe,
    TaskFiltersService,
    TaskFiltersHelperService,
    IntlCurrencyPipe,
    ActiveTaskService,
    DatePipe,
    TasksListActionsService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectTasksComponent {}
