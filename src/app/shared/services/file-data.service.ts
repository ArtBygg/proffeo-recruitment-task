import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { ActiveCompanyService } from '@app/shared/services/active-company.service';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { UploadData } from '@app/shared/types/models/files/upload-data.model';
import { DataStore } from '@app/store/data-store';
import { IdsCollection } from '@app/store/ids-collection';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { Observable, tap } from 'rxjs';
import { FileContext, UploadStatus } from '../types/enums/file-enums';
import { FileMetadata, FileMetadataInfo } from '../types/models/files/file-metadata';
import { FileUploadInfo } from '../types/models/files/file-upload-info';
import { DataService } from './data-service';
import { FileDTO } from './dtos/file/file.dto';
import { ProjectTaskDTO } from './dtos/project-tasks/project-task.dto';
import { FileFactory } from './factories/file.factory';
import { ProjectTaskFactory } from './factories/project-task.factory';
import { FileHttpService } from './http/file-http.service';
import { ToastService } from './shared/toast.service';

export type FileUrlParams =
  | { context: FileContext.locationFile; projectId: string; locationId: string }
  | { context: FileContext.projectDraftAvatar; projectId: string }
  | { context: FileContext.taskFile; taskId: string }
  | { context: FileContext.taskDescriptionFile; taskId: string }
  | { context: FileContext.taskCommentFile; taskId: string; taskCommentId: string }
  | { context: FileContext.timeReportFile; timeReportId: string };

/**
 * FileDataService - Cached files and uploads; company-scoped download/update when applicable.
 *
 * Uses {@link ActiveCompanyService.activeCompanyId} for company file API paths; skips or throws when no active
 * company is set.
 *
 * Scope: Global (`providedIn: 'root'`).
 *
 * Usage: File lists, uploads, and download actions across task/location/project contexts.
 *
 * Architecture:
 * - {@link FileDataService}: Store and orchestration
 * - {@link FileHttpService}: HTTP helpers where extracted
 * - {@link ActiveCompanyService}: Current company for `companies/{id}/files` routes
 */
@Injectable({
  providedIn: 'root'
})
export class FileDataService extends DataService<FileDTO, FileInfo> {
  private readonly files = new DataStore<FileInfo>();
  private readonly locationFiles = new DataStore<IdsCollection>();
  private readonly taskFiles = new DataStore<IdsCollection>();
  private readonly taskDescriptionFiles = new DataStore<IdsCollection>();
  private readonly taskCommentFiles = new DataStore<IdsCollection>();
  private readonly projectAvatarsFiles = new DataStore<IdsCollection>();
  private readonly timeReportFiles = new DataStore<IdsCollection>();

  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly fileFactory: FileFactory = inject(FileFactory);
  private readonly taskFactory: ProjectTaskFactory = inject(ProjectTaskFactory);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly fileHttpService: FileHttpService = inject(FileHttpService);

  private readonly fileStores = new Map<FileContext, DataStore<IdsCollection>>([
    [FileContext.locationFile, this.locationFiles],
    [FileContext.taskFile, this.taskFiles],
    [FileContext.taskDescriptionFile, this.taskDescriptionFiles],
    [FileContext.taskCommentFile, this.taskCommentFiles],
    [FileContext.projectDraftAvatar, this.projectAvatarsFiles],
    [FileContext.timeReportFile, this.timeReportFiles]
  ]);

  private readonly activeUploads = signal<Map<string, FileUploadInfo>>(new Map());
  private readonly activeCompanyService: ActiveCompanyService = inject(ActiveCompanyService);
  private readonly activeCompanyId: Signal<string | undefined> = this.activeCompanyService.activeCompanyId;
  public getById(id: string): Signal<FileInfo | undefined> {
    if (!this.files.hasDataForId(id)) {
      this.fetchImageById(id);
    }

    return computed(() => this.files.get(id)());
  }

  public getFiles(params: FileUrlParams): Signal<FileInfo[] | undefined> {
    if (params.context === FileContext.taskFile || params.context === FileContext.taskDescriptionFile) {
      return signal([]);
    }

    const entityId = this.getEntityId(params);

    if (!entityId) {
      return signal(undefined);
    }

    const store = this.fileStores.get(params.context);
    if (!store) {
      return signal(undefined);
    }

    if (!store.hasDataForId(entityId)) {
      this.fetchFiles(params);
    }
    return computed(() => {
      const filesIds = store.get(entityId)()?.ids || [];
      const files = filesIds.map(id => this.files.get(id)()).filter(file => file !== undefined) || [];
      return files.sort((a, b) => (a.orderNo ?? 0) - (b.orderNo ?? 0));
    });
  }

  public getActiveUploads(contextId: string): Signal<FileUploadInfo[]> {
    return computed(() => {
      const iterable = this.activeUploads().values();
      return Array.from(iterable).filter(upload => upload.id?.startsWith(contextId));
    });
  }

  public upsertLocalData(dto: FileDTO): Signal<FileInfo> {
    return dto ? this.files.upsert(this.fileFactory.produce(dto)) : signal(undefined);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public reloadTaskFiles(taskId: string): void {
  }
  //
  // **** UNIVERSAL FILES OPERATIONS METHODS ****
  //

  public uploadFile(params: FileUrlParams, uploadData: UploadData): string {
    const uploadId = `${this.getEntityId(params)}_${crypto.randomUUID()}`;
    this.activeUploads.update(uploads => {
      const newMap = new Map(uploads);
      newMap.set(
        uploadId,
        new FileUploadInfo({
          id: uploadId,
          fileName: uploadData.file.name,
          progress: 0,
          status: UploadStatus.Started
        })
      );
      return newMap;
    });

    const formData = this.createUploadFormData(uploadData);
    const uploadUrl = this.getFileUrl(params);

    this.httpClient.post<FileDTO[]>(uploadUrl, formData, { reportProgress: true, observe: 'response' }).subscribe({
      next: (event: HttpEvent<FileDTO[]>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = Math.round((100 * event.loaded) / event.total);

          this.activeUploads.update(uploads => {
            const newMap = new Map(uploads);
            const current = newMap.get(uploadId);
            if (current) {
              current.progress = progress;
              newMap.set(uploadId, current);
            }
            return newMap;
          });
        } else if (event.type === HttpEventType.Response && event.status === 200) {
          const file: FileDTO = event.body![0];
          this.upsertLocalData(file);
          this.updateDataStore(params, file.id, 'add');

          this.activeUploads.update(uploads => {
            const newMap = new Map(uploads);
            newMap.set(
              uploadId,
              new FileUploadInfo({
                id: uploadId,
                fileName: uploadData.file.name,
                progress: 100,
                status: UploadStatus.Completed,
                fileIds: [file.id]
              })
            );
            //newMap.delete(uploadId);
            return newMap;
          });

          this.toastService.success(this.translateService.instant('files.file-upload-success', { value: file.name }));
        }
      },
      error: (error: unknown) => {
        this.activeUploads.update(uploads => {
          const newMap = new Map(uploads);
          const current = newMap.get(uploadId);
          if (current) {
            current.status = UploadStatus.Failure;
            current.error = error instanceof HttpErrorResponse ? error.message : 'Unknown error';
            newMap.set(uploadId, current);
          }
          return newMap;
        });
      }
    });

    return uploadId;
  }

  public dismissUpload(uploadId: string): void {
    this.activeUploads.update(uploads => {
      const newMap = new Map(uploads);
      newMap.delete(uploadId);
      return newMap;
    });
  }

  public deleteFile(params: FileUrlParams, file: FileInfo): void {
    const fileId = file.id;
    const deleteUrl = this.getFileUrl(params, fileId);

    this.httpClient.delete<void>(deleteUrl).subscribe({
      next: () => {
        this.toastService.success(this.translateService.instant('files.file-delete-success', { value: file.name }));
        this.files.delete(fileId);
        this.updateDataStore(params, fileId, 'delete');
      }
    });
  }

  public download(file: FileInfo): void {
    const companyId = this.activeCompanyId();
    if (!companyId) {
      return;
    }
    this.httpClient
      .get(`${environment.APIEndPoint}companies/${companyId}/files/${file.fileShortId}`, {
        responseType: 'blob',
        observe: 'response'
      })
      .subscribe({
        next: response => {
          const blob = response.body;
          if (blob) {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }
        }
      });
  }

  public updateFile(fileId: string, metadata: FileMetadata): Observable<FileDTO> {
    const companyId = this.activeCompanyId();
    if (!companyId) {
      throw new Error('Active company is required to update a file');
    }
    return this.fileHttpService.updateFile(companyId, fileId, metadata).pipe(
      tap({
        next: (res: FileDTO) => {
          this.toastService.success(this.translateService.instant('files.file-update-success', { value: res.name }));
          this.upsertLocalData(res);
        },
        error: error => {
          this.toastService.error(this.translateService.instant('files.file-update-fail', { value: error.message }));
        }
      })
    );
  }

  public updateFiles(files: FileMetadataInfo[]): void {
    const companyId = this.activeCompanyId();
    if (!companyId) {
      return;
    }
    this.httpClient
      .put<FileDTO[]>(
        `${environment.APIEndPoint}companies/${companyId}/files`,
        files.map(data => ({
          ...data,
          tags: data.fileTags
        }))
      )
      .subscribe({
        next: res => {
          res.forEach(dto => this.upsertLocalData(dto));
        }
      });
  }

  //
  // **** TASKS FILES ****
  //

  public setTaskAvatar(taskId: string, fileId: string): void {
    this.httpClient
      .post<ProjectTaskDTO>(`${environment.APIEndPoint}tasks/${taskId}/files/${fileId}/set-avatar`, null)
      .subscribe({
        next: (dto: ProjectTaskDTO) => {
          if (dto) {
            this.toastService.success(
              this.translateService.instant('project-tasks.toasts.task-avatar-successfully-set')
            );
            this.notificationService.notify({
              eventType: 'TaskUpdated',
              data: this.taskFactory.produce(dto)
            });
          }
        }
      });
  }

  //
  // **** FETCHES ****
  //
  private fetchImageById(fileId: string): void {
    this.httpClient.get<FileDTO>(`${environment.APIEndPoint}files/${fileId}`).subscribe({
      next: dto => {
        this.upsertLocalData(dto);
      }
    });
  }

  private fetchFiles(params: FileUrlParams): void {
    const url = this.getFileUrl(params);
    const entityId = this.getEntityId(params);
    const store = this.fileStores.get(params.context);

    if (!store || !entityId) {
      return;
    }

    this.httpClient.get<FileDTO[]>(url).subscribe({
      next: (dto: FileDTO[]) => {
        this.files.upsertMany(dto.map(itm => this.fileFactory.produce(itm)));

        store.upsert({
          id: entityId,
          ids: dto.map(itm => itm.id)
        });
      }
    });
  }

  //
  // **** HELPERS ****
  //
  private createUploadFormData(uploadData: UploadData): FormData {
    const formData = new FormData();
    formData.append('files[0].File', uploadData.file, uploadData.file.name);

    if (uploadData.description) {
      formData.append('files[0].Description', uploadData.description);
    }

    if (uploadData.fileTags) {
      formData.append('files[0].Tags', uploadData.fileTags.join(';'));
    }

    return formData;
  }

  private updateDataStore(params: FileUrlParams, fileId: string, methodType: 'add' | 'delete'): void {
    const updateStore = (store: DataStore<IdsCollection>, id: string): void => {
      const currentFilesIds = store.get(id)()?.ids || [];
      const newFilesIds =
        methodType === 'add'
          ? currentFilesIds.concat(fileId)
          : currentFilesIds.filter(existingId => existingId !== fileId);
      store.upsert({ id, ids: newFilesIds });
    };

    switch (params.context) {
      case FileContext.locationFile:
        updateStore(this.locationFiles, params.locationId);
        return;
      case FileContext.projectDraftAvatar:
        updateStore(this.projectAvatarsFiles, params.projectId);
        return;
      case FileContext.taskFile:
        updateStore(this.taskFiles, params.taskId);
        if (methodType === 'delete') {
          updateStore(this.taskDescriptionFiles, params.taskId);
        }
        return;
      case FileContext.taskDescriptionFile:
        updateStore(this.taskDescriptionFiles, params.taskId);
        updateStore(this.taskFiles, params.taskId);
        return;
      case FileContext.taskCommentFile:
        updateStore(this.taskCommentFiles, params.taskCommentId);
        return;
      case FileContext.timeReportFile:
        updateStore(this.timeReportFiles, params.timeReportId);
        return;
      default: {
        const _exhaustiveCheck: never = params;
        throw new Error(`Unsupported file context: ${(_exhaustiveCheck as FileUrlParams).context}`);
      }
    }
  }

  private getFileUrl(params: FileUrlParams, fileId?: string): string {
    const baseUrl = this.getBaseFileUrl(params);
    return fileId ? `${baseUrl}/${fileId}` : baseUrl;
  }

  private getBaseFileUrl(params: FileUrlParams): string {
    const baseEndpoint = environment.APIEndPoint;

    switch (params.context) {
      case FileContext.locationFile:
        return `${baseEndpoint}projects/${params.projectId}/locations/${params.locationId}/files`;
      case FileContext.projectDraftAvatar:
        return `${baseEndpoint}project-drafts/avatar`;
      case FileContext.taskFile:
        return `${baseEndpoint}tasks/${params.taskId}/files`;
      case FileContext.taskDescriptionFile:
        return `${baseEndpoint}tasks/${params.taskId}/description-files`;
      case FileContext.taskCommentFile:
        return `${baseEndpoint}tasks/${params.taskId}/comments/${params.taskCommentId}/files`;
      case FileContext.timeReportFile:
        return `${baseEndpoint}time-reports/${params.timeReportId}/files`;
      default: {
        const _exhaustiveCheck: never = params;
        throw new Error(`Unsupported file context: ${(_exhaustiveCheck as FileUrlParams).context}`);
      }
    }
  }

  private getEntityId(params: FileUrlParams): string {
    switch (params.context) {
      case FileContext.locationFile:
        return params.locationId;
      case FileContext.projectDraftAvatar:
        return params.projectId;
      case FileContext.taskFile:
      case FileContext.taskDescriptionFile:
        return params.taskId;
      case FileContext.taskCommentFile:
        return params.taskCommentId;
      case FileContext.timeReportFile:
        return params.timeReportId;
      default: {
        const _exhaustiveCheck: never = params;
        throw new Error(`Unsupported file context: ${(_exhaustiveCheck as FileUrlParams).context}`);
      }
    }
  }
}
