import { Signal } from '@angular/core';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { IdBased } from '@app/shared/types/models/shared/id-based.model';
import { User } from '@app/shared/types/models/user/user.model';

export interface TaskActivity extends IdBased {
  taskActivityType: TaskActivityType;
  taskId?: string;
  user?: Signal<User>;
  date?: Date;
}
