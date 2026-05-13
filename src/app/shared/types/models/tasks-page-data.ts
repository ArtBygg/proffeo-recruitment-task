import { Signal } from '@angular/core';
import { TaskFilters } from '@app/shared/types/models/task/task-filters.model';
import { PageData } from '@app/store/page-data';
import { Task } from './task/task.model';

export interface TasksPageData extends PageData {
  content?: Signal<Task>[];
  filtersId?: string;
  filters?: TaskFilters;
}
