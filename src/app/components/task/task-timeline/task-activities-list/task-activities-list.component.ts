import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, InputSignal, Signal } from '@angular/core';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskActivity } from '@app/shared/types/models/task-activities/task-activity';
import { TaskFileAddedActivity } from '@app/shared/types/models/task-activities/task-file-added-activity';
import { ActivityTimelineRow } from '@app/shared/types/models/timeline/activity-timeline-row';
import { TranslateModule } from '@ngx-translate/core';
import { TaskActivityComponent } from '../task-activity/task-activity.component';

@Component({
  selector: 'proffeo-task-activities-list',
  templateUrl: './task-activities-list.component.html',
  imports: [DatePipe, TranslateModule, TaskActivityComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskActivitiesListComponent {
  private readonly MILLISECONDS_PER_MINUTE: number = 60000;
  protected readonly proximityGroups: Signal<TaskActivity[][]> = computed(() =>
    this.groupActivitiesByProximity(this.activities())
  );
  protected readonly timelineRows: Signal<ActivityTimelineRow[]> = computed(() => {
    const rows: ActivityTimelineRow[] = [];
    let lastDate: Date = undefined;
    for (const activities of this.proximityGroups()) {
      const currentDate: Date = activities[0].date;
      if (lastDate === undefined || currentDate === undefined || !this.isSameCalendarDay(lastDate, currentDate)) {
        rows.push({
          type: 'date',
          date: currentDate ?? null,
          id: crypto.randomUUID()
        });
        lastDate = currentDate;
      }
      rows.push({ type: 'activity', date: currentDate, activities: activities, id: crypto.randomUUID() });
    }
    return rows;
  });
  public readonly activities: InputSignal<TaskActivity[]> = input<TaskActivity[]>([]);

  private isSameCalendarDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  private timeDiffGreaterThan(minutes: number, youngerDate: Date | undefined, olderDate: Date | undefined): boolean {
    if (!olderDate || !youngerDate) {
      return false;
    }

    const parsedYounger: number = youngerDate.getTime() / this.MILLISECONDS_PER_MINUTE;
    const parsedOlder: number = olderDate.getTime() / this.MILLISECONDS_PER_MINUTE;

    return parsedYounger - parsedOlder > minutes;
  }

  private groupActivitiesByProximity(activities: TaskActivity[]): TaskActivity[][] {
    if (activities.length === 0) {
      return [];
    }

    const groupedActivities: TaskActivity[][] = [];
    let currentGroup: TaskActivity[] = [];

    for (const activity of activities) {
      const activityUserEmail: string | undefined = activity?.user?.()?.email;

      if (!activityUserEmail) {
        if (currentGroup.length > 0) {
          groupedActivities.push(currentGroup);
          currentGroup = [];
        }
        continue;
      }

      if (currentGroup.length === 0) {
        currentGroup.push(activity);
        continue;
      }

      const previousActivity: TaskActivity = currentGroup[currentGroup.length - 1];
      const previousUserEmail: string | undefined = previousActivity?.user?.()?.email;
      const sameUserAsPrevious: boolean = activityUserEmail === previousUserEmail;
      const sameActivityTypeAsPrevious: boolean = activity.taskActivityType === previousActivity.taskActivityType;
      const withinFiveMinutes: boolean = !this.timeDiffGreaterThan(5, activity.date, previousActivity.date);

      if (sameUserAsPrevious && sameActivityTypeAsPrevious && withinFiveMinutes) {
        currentGroup.push(activity);
      } else {
        groupedActivities.push(currentGroup);
        currentGroup = [activity];
      }
    }

    if (currentGroup.length > 0) {
      groupedActivities.push(currentGroup);
    }
    return this.aggregateFileAddedActivitiesInsideGroups(groupedActivities);
  }

  private aggregateFileAddedActivitiesInsideGroups(groupedActivities: TaskActivity[][]): TaskActivity[][] {
    return groupedActivities.map(activityGroup => {
      const fileAddedActivities = activityGroup.filter(
        activity => activity.taskActivityType === TaskActivityType.TaskFileAdded
      );
      if (fileAddedActivities.length > 0) {
        const consolidatedFileAddedActivities: TaskFileAddedActivity = {
          id: fileAddedActivities[0].id,
          taskId: fileAddedActivities[0].taskId,
          date: fileAddedActivities[0].date,
          user: fileAddedActivities[0].user,
          taskActivityType: TaskActivityType.TaskFileAdded,
          data: {
            addedFilesIds: fileAddedActivities.flatMap(
              activity => (activity as TaskFileAddedActivity).data?.addedFilesIds ?? []
            )
          }
        };

        return [
          ...activityGroup.filter(activity => activity.taskActivityType !== TaskActivityType.TaskFileAdded),
          consolidatedFileAddedActivities
        ];
      } else {
        return activityGroup;
      }
    });
  }
}
