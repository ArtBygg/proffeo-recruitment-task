import { TaskStatus } from './task-status.enum';

/**
 * TODO: Do usunięcia są prawdopodobnie te klasy (colorClass, borderLeftClass, iconColorClass) i wykorzystanie tylko jednego atrybutu koloru który by ustawiał to wszędzie.
 */
export interface TaskStatusDisplay {
  translationKey: string;
  colorClass: string;
  borderLeftClass: string;
  iconColorClass: string;
}

export const TASK_STATUS_DISPLAY: Record<TaskStatus, TaskStatusDisplay> = {
  [TaskStatus.TO_DO]: {
    translationKey: 'task-statuses.toDo',
    colorClass: 'bg-to-do',
    borderLeftClass: 'border-l-to-do!',
    iconColorClass: 'text-slate-500'
  },
  [TaskStatus.IN_PROGRESS]: {
    translationKey: 'task-statuses.inProgress',
    colorClass: 'bg-in-progress',
    borderLeftClass: 'border-l-in-progress!',
    iconColorClass: 'text-blue-400'
  },
  [TaskStatus.DONE]: {
    translationKey: 'task-statuses.done',
    colorClass: 'bg-done',
    borderLeftClass: 'border-l-done!',
    iconColorClass: 'text-green-400'
  },
  [TaskStatus.IN_PLANNING]: {
    translationKey: 'task-statuses.inPlanning',
    colorClass: 'bg-in-planning',
    borderLeftClass: 'border-l-in-planning!',
    iconColorClass: 'text-yellow-400'
  },
  [TaskStatus.IN_REVIEW]: {
    translationKey: 'task-statuses.inReview',
    colorClass: 'bg-in-review',
    borderLeftClass: 'border-l-in-review!',
    iconColorClass: 'text-amber-700'
  },
  [TaskStatus.ACCEPTED]: {
    translationKey: 'task-statuses.accepted',
    colorClass: 'bg-accepted',
    borderLeftClass: 'border-l-accepted!',
    iconColorClass: 'text-orange-400'
  },
  [TaskStatus.REJECTED]: {
    translationKey: 'task-statuses.rejected',
    colorClass: 'bg-rejected',
    borderLeftClass: 'border-l-rejected!',
    iconColorClass: 'text-red-400'
  }
};
