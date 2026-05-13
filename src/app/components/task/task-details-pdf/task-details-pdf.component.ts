import { DatePipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  signal,
  Signal,
  WritableSignal
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { TaskActivityContentComponent } from '@app/components/task/task-timeline/task-activity-content/task-activity-content.component';
import { ActivityFilterMenuComponent } from '@app/shared/components/activity-filter-menu/activity-filter-menu.component';
import { LabelComponent } from '@app/shared/components/label/label.component';
import { IntlDurationPipe } from '@app/shared/pipes/intl-duration.pipe';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { TaskDetailsPdfService } from '@app/shared/services/task-details-pdf.service';
import { PdfContentName } from '@app/shared/types/enums/pdf/task-details/pdf-contant-name.model';
import { PdfTaskDetailMenuItem } from '@app/shared/types/enums/pdf/task-details/pdf-task-detail-menu-item.enum';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TASK_STATUS_DISPLAY } from '@app/shared/types/enums/task-status.constants';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { Sections } from '@app/shared/types/models/pdf/task-details/sections.model';
import { TaskAttachmentsDetails } from '@app/shared/types/models/pdf/task-details/task-attachments-details.model';
import { TaskDetailsItems } from '@app/shared/types/models/pdf/task-details/task-details-items.model';
import { TaskActivity } from '@app/shared/types/models/task-activities/task-activity';
import { Task } from '@app/shared/types/models/task/task.model';
import { User } from '@app/shared/types/models/user/user.model';
import { ActivityFiltersMap } from '@app/shared/utils/activity-utils';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment/moment';

function allTrue(record: Record<string, boolean>): boolean {
  const values = Object.values(record);
  return values.length > 0 && values.every(value => value);
}

function someTrue(record: Record<string, boolean>): boolean {
  const values = Object.values(record);
  return values.some(value => value) && !values.every(value => value);
}

function setAll(record: Record<string, boolean>, value: boolean): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const key of Object.keys(record)) {
    result[key] = value;
  }
  return result;
}

interface TaskTimelineRow {
  date: Date | null;
  user: User | null;
  activity: TaskActivity;
}

@Component({
  selector: 'proffeo-task-details-pdf',
  templateUrl: './task-details-pdf.component.html',
  styleUrl: './task-details-pdf.component.scss',
  providers: [IntlDurationPipe],
  imports: [
    MatIconModule,
    MatCheckboxModule,
    MatExpansionModule,
    TranslateModule,
    LabelComponent,
    NgClass,
    DatePipe,
    IntlDurationPipe,
    MatMenuModule,
    MatIconButton,
    MatTableModule,
    TaskActivityContentComponent,
    ActivityFilterMenuComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDetailsPdfComponent {
  private readonly deviceService: DeviceService = inject(DeviceService);
  private readonly pdfService: TaskDetailsPdfService = inject(TaskDetailsPdfService);
  private readonly sections = [
    PdfContentName.TASK_DETAILS,
    PdfContentName.TASK_DESCRIPTION,
    PdfContentName.TASK_TIMELINE,
    PdfContentName.TASK_ATTACHMENTS
  ];

  private intlDurationPipe: IntlDurationPipe = inject(IntlDurationPipe);

  protected readonly TaskActivityType = TaskActivityType;

  protected readonly TASK_STATUS_DISPLAY = TASK_STATUS_DISPLAY;
  protected readonly PdfContentName = PdfContentName;
  protected readonly MenuItem = PdfTaskDetailMenuItem;

  protected readonly activityFilters: WritableSignal<ActivityFiltersMap | undefined> = signal(undefined);

  protected readonly sectionChecked: WritableSignal<Record<PdfContentName, boolean>> = signal({
    [PdfContentName.TASK_DETAILS]: true,
    [PdfContentName.TASK_DESCRIPTION]: true,
    [PdfContentName.TASK_TIMELINE]: true,
    [PdfContentName.TASK_ATTACHMENTS]: true
  } as Record<PdfContentName, boolean>);

  protected readonly menuItemChecked: WritableSignal<Record<PdfTaskDetailMenuItem, boolean>> = signal(
    Object.values(PdfTaskDetailMenuItem).reduce(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {} as Record<PdfTaskDetailMenuItem, boolean>
    )
  );

  protected readonly attachmentChecked: WritableSignal<Record<string, boolean>> = signal({});

  protected readonly selectAllSectionsChecked = computed(() => allTrue(this.sectionChecked()));
  protected readonly selectAllSectionsIndeterminate = computed(() => someTrue(this.sectionChecked()));
  protected readonly selectAllTaskDetailsChecked = computed(() => allTrue(this.menuItemChecked()));
  protected readonly selectAllTaskDetailsIndeterminate = computed(() => someTrue(this.menuItemChecked()));
  protected readonly selectAllAttachmentsChecked = computed(() => allTrue(this.attachmentChecked()));
  protected readonly selectAllAttachmentsIndeterminate = computed(() => someTrue(this.attachmentChecked()));

  protected readonly isMobile: Signal<boolean> = this.deviceService.isMobile;
  protected readonly projectUsers: Signal<User[] | undefined> = this.pdfService.projectUsers;
  protected readonly imageAttachments: Signal<FileInfo[]> = this.pdfService.imageAttachments;
  protected readonly groupedActivities: Signal<TaskActivity[][]> = this.pdfService.groupedActivities;
  protected readonly filteredTaskActivities: Signal<TaskActivity[]> = computed(() => {
    const activities = this.pdfService.taskActivities() ?? [];
    const filtersMap = this.activityFilters();
    if (!filtersMap) return activities;
    const selectedActivityTypes = (Object.entries(filtersMap) as [TaskActivityType, boolean][])
      .filter(([, selected]) => selected)
      .map(([activityType]) => activityType);

    return activities.filter((activity: TaskActivity) =>
      selectedActivityTypes.some(activityType => activity.taskActivityType === activityType)
    );
  });

  protected readonly timelineRows: Signal<TaskTimelineRow[]> = computed(() =>
    this.filteredTaskActivities().map((activity: TaskActivity) => ({
      date: activity.date ?? null,
      user: activity.user ? activity.user() : null,
      activity
    }))
  );

  protected readonly displayedColumns: readonly string[] = ['date', 'user', 'timeline'] as const;

  public readonly sectionsModel: ModelSignal<Sections> = model<Sections>();

  public task: InputSignal<Task | undefined> = input<Task | undefined>(undefined);

  public constructor() {
    effect(() => {
      const images = this.imageAttachments();
      if (images.length === 0) return;
      const current = this.attachmentChecked();
      const updated = { ...current };
      let changed = false;
      images.forEach(fileInfo => {
        if (!(fileInfo.id in updated)) {
          updated[fileInfo.id] = true;
          changed = true;
        }
      });
      if (changed) {
        this.attachmentChecked.set(updated);
      }
    });

    effect(() => {
      const activities = this.pdfService.taskActivities();
      if (!activities) return;
    });

    effect(() => {
      this.sectionChecked();
      this.menuItemChecked();
      this.attachmentChecked();
      this.activityFilters();
      this.sectionsModel.set(this.buildSections());
    });
  }

  protected get visibleLocationsNamePath(): string {
    return (
      this.task()
        ?.location()
        .locationsPath.map(location => location.name)
        .join(' > ') || ''
    );
  }

  protected get getTaskTotalTrackedTime(): string {
    const taskTotalTrackedSeconds = this.task()?.taskTotalTrackedSeconds;
    if (!taskTotalTrackedSeconds) {
      return this.intlDurationPipe.transform('PT0H').toString();
    }
    const duration = moment.duration(taskTotalTrackedSeconds, 'seconds');
    return this.intlDurationPipe.transform(duration.toISOString()).toString();
  }

  private buildSections(): Sections {
    const sectionFlags = this.sectionChecked();
    return {
      taskDetails: sectionFlags[PdfContentName.TASK_DETAILS],
      taskDetailsItems: this.buildTaskDetailsItems(),
      taskDescription: sectionFlags[PdfContentName.TASK_DESCRIPTION],
      taskTimeline: sectionFlags[PdfContentName.TASK_TIMELINE],
      taskAttachments: this.buildAttachmentsDetails()
    };
  }

  private buildTaskDetailsItems(): TaskDetailsItems {
    const taskDetailsMenuFlags = this.menuItemChecked();
    return {
      taskDetailsLocation: taskDetailsMenuFlags[PdfTaskDetailMenuItem.LOCATION],
      taskDetailsTaskName: true,
      taskDetailsProgress: taskDetailsMenuFlags[PdfTaskDetailMenuItem.LEVEL],
      taskDetailsDuration: taskDetailsMenuFlags[PdfTaskDetailMenuItem.TOTAL_TIME],
      taskDetailsTimeEstimation: taskDetailsMenuFlags[PdfTaskDetailMenuItem.TIME_ESTIMATION],
      taskDetailsProject: taskDetailsMenuFlags[PdfTaskDetailMenuItem.PROJECT],
      taskDetailsFinancialEstimation: taskDetailsMenuFlags[PdfTaskDetailMenuItem.FINANCIAL_ESTIMATION],
      taskDetailsStatus: taskDetailsMenuFlags[PdfTaskDetailMenuItem.STATUS],
      taskDetailsPriority: taskDetailsMenuFlags[PdfTaskDetailMenuItem.PRIORITY],
      taskDetailsStartDate: taskDetailsMenuFlags[PdfTaskDetailMenuItem.START_DATE],
      taskDetailsEndDate: taskDetailsMenuFlags[PdfTaskDetailMenuItem.END_DATE],
      taskDetailsAdmin: taskDetailsMenuFlags[PdfTaskDetailMenuItem.ADMIN],
      taskDetailsUsers: taskDetailsMenuFlags[PdfTaskDetailMenuItem.USERS]
    };
  }

  private buildAttachmentsDetails(): TaskAttachmentsDetails {
    const attachmentFlags = this.attachmentChecked();
    const selectedAttachmentIds = Object.entries(attachmentFlags)
      .filter(([, checked]) => checked)
      .map(([id]) => id);
    return {
      includeAttachments: this.sectionChecked()[PdfContentName.TASK_ATTACHMENTS],
      attachDescriptions: true,
      attachmentsIds: selectedAttachmentIds
    };
  }

  protected formatProjectUsersNames(users: User[]): string {
    return users.map(user => user.fullName).join(', ');
  }

  protected removeHtmlTags(htmlString: string): string {
    const parser: DOMParser = new DOMParser();
    const doc: Document = parser.parseFromString(htmlString, 'text/html');
    return doc.body.textContent || '';
  }

  protected setSection(key: PdfContentName, value: boolean): void {
    this.sectionChecked.update(prev => ({ ...prev, [key]: value }));
  }

  protected setAllSections(value: boolean): void {
    this.sections.forEach(section => this.setSection(section, value));
  }

  protected setMenuItem(key: PdfTaskDetailMenuItem, value: boolean): void {
    this.menuItemChecked.update(prev => ({ ...prev, [key]: value }));
  }

  protected setAllMenuItems(value: boolean): void {
    this.menuItemChecked.update(prev => setAll(prev, value) as Record<PdfTaskDetailMenuItem, boolean>);
  }

  protected toggleAttachment(id: string): void {
    this.attachmentChecked.update(prev => ({ ...prev, [id]: !prev[id] }));
  }

  protected setAllAttachments(value: boolean): void {
    this.attachmentChecked.update(prev => setAll(prev, value));
  }
}
