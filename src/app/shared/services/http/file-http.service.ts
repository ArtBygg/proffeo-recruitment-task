import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FileMetadata } from '@app/shared/types/models/files/file-metadata';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { FileDTO } from '../dtos/file/file.dto';

/**
 * FileHttpService - HTTP API layer for file operations.
 *
 * Handles HTTP communication with the files API endpoints.
 *
 * Scope: Global (`providedIn: 'root'`).
 *
 * Usage: Used by {@link FileDataService} to perform API calls.
 *
 * Architecture:
 * - {@link FileActionsService}: User actions, mutations, side effects
 * - {@link FileDataService}: Data access, caching, store management
 * - {@link FileHttpService}: HTTP API calls
 */
@Injectable({ providedIn: 'root' })
export class FileHttpService {
  private readonly httpClient = inject(HttpClient);

  public updateFile(companyId: string, fileId: string, metadata: FileMetadata): Observable<FileDTO> {
    return this.httpClient.put<FileDTO>(`${environment.APIEndPoint}companies/${companyId}/files/${fileId}`, metadata);
  }
}
