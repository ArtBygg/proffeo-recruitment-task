import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  InputSignal,
  OnInit,
  Signal,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TaskActivitiesListComponent } from '@app/components/task/task-timeline/task-activities-list/task-activities-list.component';
import { ActivityFilterMenuComponent } from '@app/shared/components/activity-filter-menu/activity-filter-menu.component';
import { FileDropComponent } from '@app/shared/components/files/file-drop/file-drop.component';
import { FilePreviewListComponent } from '@app/shared/components/files/file-preview-list/file-preview-list.component';
import { LabelComponent } from '@app/shared/components/label/label.component';
import { AuthService } from '@app/shared/services/auth.service';
import { TaskCommentsDataService } from '@app/shared/services/task-comments-data.service';
import { TaskActivityType } from '@app/shared/types/enums/task-activity-type';
import { TaskActivity } from '@app/shared/types/models/task-activities/task-activity';
import { Task } from '@app/shared/types/models/task/task.model';
import { User } from '@app/shared/types/models/user/user.model';
import { ActivityFiltersMap } from '@app/shared/utils/activity-utils';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-task-timeline',
  templateUrl: './task-timeline.component.html',
  imports: [
    ReactiveFormsModule,
    LabelComponent,
    TranslateModule,
    MatMenuModule,
    TaskActivitiesListComponent,
    MatIconModule,
    MatButtonModule,
    ActivityFilterMenuComponent,
    FileDropComponent,
    FilePreviewListComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskTimelineComponent implements OnInit {
  @ViewChild('activitiesContainer') public activitiesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('commentInput') public commentInput: ElementRef<HTMLTextAreaElement>;
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly authService: AuthService = inject(AuthService);
  private readonly taskCommentsService: TaskCommentsDataService = inject(TaskCommentsDataService);

  protected readonly filters: WritableSignal<ActivityFiltersMap | undefined> = signal(undefined);

  protected filteredActivities: Signal<TaskActivity[]> = computed(() => {
    const activities = this.taskActivities();
    const filtersMap = this.filters();
    if (!filtersMap) return activities;
    const selectedKeys = (Object.entries(filtersMap) as [TaskActivityType, boolean][])
      .filter(([, selected]) => selected)
      .map(([key]) => key);

    return activities.filter((activity: TaskActivity) => selectedKeys.some(key => activity.taskActivityType === key));
  });

  protected selectedFiltersCount: Signal<number> = computed(() => {
    const filtersMap = this.filters();
    return filtersMap ? Object.values(filtersMap).filter(Boolean).length : 0;
  });

  protected commentForm: FormGroup;
  protected activeUser: Signal<User | null> = signal(null);
  protected files: WritableSignal<File[]> = signal<File[]>([]);

  public task: InputSignal<Task> = input.required<Task>();
  public taskActivities: InputSignal<TaskActivity[]> = input.required<TaskActivity[]>();

  public ngOnInit(): void {
    this.activeUser = this.authService.currentUser;

    this.commentForm = this.fb.group({
      commentText: ['']
    });
  }

  protected updateCommentInputHeight(): void {
    const textArea: HTMLTextAreaElement = this.commentInput.nativeElement;

    textArea.style.height = '23px';

    if (textArea.scrollHeight > 23) {
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  }

  protected onRemoveFile(file: File): void {
    const files: File[] = this.files().filter((value: File) => value !== file);
    this.files.set(files);
  }

  protected onFilesAdded(files: File[]): void {
    const allFiles: File[] = [...this.files(), ...files];
    this.files.set(allFiles);
  }

  protected onSendComment(): void {
    const commentText: string = this.commentForm.get('commentText')?.value;
    const filesToUpload: File[] = this.files();
    this.taskCommentsService.addCommentToTask(this.task()?.id, commentText, filesToUpload);

    this.commentForm.reset();
    this.files.set([]);
    this.scrollToBottom();
    this.updateCommentInputHeight();
  }

  private scrollToBottom(): void {
    this.activitiesContainer.nativeElement.scrollTop = this.activitiesContainer.nativeElement.scrollHeight;
  }
}
