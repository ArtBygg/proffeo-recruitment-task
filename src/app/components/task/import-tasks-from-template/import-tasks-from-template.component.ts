import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  InputSignal,
  signal,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { FileDropComponent } from '@app/shared/components/files/file-drop/file-drop.component';
import { ProjectActionsService } from '@app/shared/services/actions/project-actions.service';
import { TaskImportValidationErrorDTO } from '@app/shared/services/dtos/imports/task-import-validation-error.dto';
import { Project } from '@app/shared/types/models/project/project.model';
import { TranslateModule } from '@ngx-translate/core';

export type ImportFileStatus = 'invalid' | 'uploading' | 'processed' | 'failed';

export interface ImportFileItem {
  id: string;
  fileName: string;
  status: ImportFileStatus;
  importedCount?: number;
  errors?: TaskImportValidationErrorDTO[];
}

@Component({
  selector: 'proffeo-import-tasks-from-template',
  standalone: true,
  templateUrl: './import-tasks-from-template.component.html',
  styleUrl: './import-tasks-from-template.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, FileDropComponent, ButtonComponent]
})
export class ImportTasksFromTemplateComponent {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly projectActionsService = inject(ProjectActionsService);

  protected readonly fileList: WritableSignal<ImportFileItem[]> = signal([]);
  protected readonly expandedErrorsForId: WritableSignal<string | null> = signal(null);

  public readonly project: InputSignal<Project | undefined> = input<Project | undefined>(undefined);

  protected onFilesAdded(files: File[]): void {
    const proj = this.project();
    if (!proj?.id) return;

    const newItems: ImportFileItem[] = files.map((file, index) => {
      const isXlsx =
        file.name.toLowerCase().endsWith('.xlsx') ||
        file.name.toLowerCase().endsWith('.xls') ||
        file.name.toLowerCase().endsWith('.csv');
      const id = `${file.name}-${Date.now()}-${index}`;
      const item: ImportFileItem = {
        id,
        fileName: file.name,
        status: isXlsx ? 'uploading' : 'invalid'
      };
      return item;
    });

    this.fileList.update(list => [...list, ...newItems]);

    newItems.forEach((item, index) => {
      if (item.status !== 'uploading') return;
      const file = files[index];
      this.projectActionsService
        .importTasks(proj.id, file)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: result => {
            this.updateItem(item.id, {
              status: 'processed',
              importedCount: result.createdTasks?.length ?? 0,
              errors: result.errors ?? []
            });
          },
          error: () => {
            this.updateItem(item.id, { status: 'failed' });
          }
        });
    });
  }

  private updateItem(id: string, patch: Partial<Pick<ImportFileItem, 'status' | 'importedCount' | 'errors'>>): void {
    this.fileList.update(list => list.map(it => (it.id === id ? { ...it, ...patch } : it)));
  }

  protected onExportTaskImportTemplate(): void {
    const proj = this.project();
    if (!proj) return;
    this.projectActionsService.exportTaskImportTemplate(proj);
  }

  protected toggleErrors(id: string): void {
    this.expandedErrorsForId.update(current => (current === id ? null : id));
  }

  protected getStatusKey(status: ImportFileStatus): string {
    const keys: Record<ImportFileStatus, string> = {
      invalid: 'project-tasks.import-from-template.status-not-valid-type',
      uploading: 'project-tasks.import-from-template.status-uploading',
      processed: 'project-tasks.import-from-template.status-processed',
      failed: 'project-tasks.import-from-template.status-failed'
    };
    return keys[status];
  }
}
