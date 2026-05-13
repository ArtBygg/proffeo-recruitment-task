import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LocationDTO } from '@app/shared/services/dtos/location/location.dto';
import { Location } from '@app/shared/types/models/location/location.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

/**
 * LocationsHttpService - HTTP API layer for location operations.
 *
 * This service handles all HTTP communication with the backend API for locations.
 * It provides raw API calls without side effects like toasts or store updates.
 *
 * Usage: Used by LocationsDataService to perform HTTP operations.
 *
 * Architecture:
 * - {@link LocationsActionsService}: User actions, mutations, side effects (toasts, modals)
 * - {@link LocationsDataService}: Data access, queries, getters, store management
 * - {@link LocationsHttpService}: HTTP API calls
 */
@Injectable({ providedIn: 'root' })
export class LocationsHttpService {
  private httpClient: HttpClient = inject(HttpClient);

  public duplicateLocations(
    projectId: string,
    locationsIds: string[],
    parentId: string,
    includeAttachments: boolean,
    duplicateChildren: boolean
  ): Observable<LocationDTO[]> {
    return this.httpClient.post<LocationDTO[]>(
      `${environment.APIV3EndPoint}projects/${projectId}/locations/duplicate`,
      { locationsIds, parentId, includeAttachments, duplicateChildren }
    );
  }

  public addLocation(
    projectId: string,
    name: string,
    orderNo: number,
    parentLocationId: string
  ): Observable<LocationDTO> {
    return this.httpClient.post<LocationDTO>(`${environment.APIV3EndPoint}projects/${projectId}/locations`, {
      name: name,
      parentId: parentLocationId,
      orderNo: orderNo
    });
  }

  public updateLocation(
    projectId: string,
    id: string,
    name: string,
    orderNo: number,
    parentLocationId: string
  ): Observable<LocationDTO> {
    return this.httpClient.put<LocationDTO>(`${environment.APIV3EndPoint}projects/${projectId}/locations/${id}`, {
      name: name,
      parentId: parentLocationId,
      orderNo: orderNo
    });
  }

  public deleteLocations(projectId: string, locations: Location[]): Observable<string> {
    const ids: string = locations.map(location => location.id).join('&ids=');
    return this.httpClient.delete<string>(`${environment.APIV3EndPoint}projects/${projectId}/locations/?ids=${ids}`);
  }

  public reorderLocations(projectId: string, ids: string[]): Observable<LocationDTO[]> {
    return this.httpClient.put<LocationDTO[]>(`${environment.APIEndPoint}projects/${projectId}/locations/reorder`, {
      ids
    });
  }

  public getProjectLocations(projectId: string): Observable<LocationDTO[]> {
    return this.httpClient.get<LocationDTO[]>(`${environment.APIV3EndPoint}projects/${projectId}/locations`);
  }
}
