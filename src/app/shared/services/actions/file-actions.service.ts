import { inject, Injectable } from '@angular/core';
import { FileDataService } from '@app/shared/services/file-data.service';
import { FileMetadata } from '@app/shared/types/models/files/file-metadata';
import { Observable } from 'rxjs';
import { FileDTO } from '../dtos/file/file.dto';

/**
 * FileActionsService - Facade for shared file mutation operations.
 *
 * Centralizes user-triggered actions that involve file-related API calls or side effects.
 *
 * Scope: Global (`providedIn: 'root'`).
 *
 * Usage: Used by components that need to update file metadata (e.g. description, tags, order).
 *
 * Architecture:
 * - {@link FileActionsService}: User actions, mutations, side effects
 * - {@link FileDataService}: Data access, caching, store management
 * - {@link FileHttpService}: HTTP API calls
 */
@Injectable({ providedIn: 'root' })
export class FileActionsService {
  private readonly fileDataService = inject(FileDataService);

  public updateFile(fileId: string, metadata: FileMetadata): Observable<FileDTO> {
    return this.fileDataService.updateFile(fileId, metadata);
  }
}
