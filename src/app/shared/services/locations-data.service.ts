import { computed, Injectable, inject, Signal, signal } from '@angular/core';
import { Location } from '@app/shared/types/models/location/location.model';
import { DataStore } from '@app/store/data-store';
import { IdsCollection } from '@app/store/ids-collection';
import { EMPTY, Observable } from 'rxjs';
import { DataService } from './data-service';
import { LocationDTO } from './dtos/location/location.dto';
import { LocationFactory } from './factories/location.factory';
import { AppEvent } from '../types/models/notifications/app-event';

const MOCK_LOCATIONS: LocationDTO[] = [
  { id: '0542483f-a61d-4de9-94d2-22e9bbafcf78', name: 'Poject menu', orderNo: 6, projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, parentId: undefined, childrenCount: 0, files: [] },
  { id: '0e51a5f9-f638-4887-8030-63cba7fbf131', name: 'OSH', orderNo: 6, parentId: 'ec0f1b05-a053-4499-8f51-943c673e259b', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '2918c848-73de-4eef-aeae-80623c2f0590', name: 'Dashboard', orderNo: 2, parentId: '0542483f-a61d-4de9-94d2-22e9bbafcf78', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '297fc299-8144-4698-a967-759562f0f753', name: 'bba (Copy)', orderNo: 5, parentId: 'cae2aac5-bd02-45d6-a513-f79696ab14aa', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '2d8d82a4-6eda-4324-b1d0-3144e98c59de', name: 'Groups ', orderNo: 4, parentId: 'ec0f1b05-a053-4499-8f51-943c673e259b', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '3196349a-9532-4b55-a964-ef6c29882187', name: 'Users ', orderNo: 2, parentId: 'ec0f1b05-a053-4499-8f51-943c673e259b', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '4197b951-f6db-42b9-a3af-c3293744b9e0', name: 'Tags', orderNo: 6, parentId: '0542483f-a61d-4de9-94d2-22e9bbafcf78', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '4b8ca98d-4adb-48a2-a6aa-bd3898dded1e', name: 'Industries', orderNo: 1, parentId: 'ec0f1b05-a053-4499-8f51-943c673e259b', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '5f175cfb-aa28-4a59-9605-e638e89774f0', name: 'OSH', orderNo: 3, parentId: '0542483f-a61d-4de9-94d2-22e9bbafcf78', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '609f86fb-7753-4173-8b92-ff29591e9c79', name: 'Lista ', orderNo: 1, parentId: '799ba718-2a98-4846-bb16-3da3eb653a83', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '62a65f3f-2523-4e1c-9123-f92dda064407', name: 'Participants ', orderNo: 1, parentId: '0542483f-a61d-4de9-94d2-22e9bbafcf78', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '68d2d717-0713-49f6-b1b8-58b0850d0200', name: 'Repports ', orderNo: 1, projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, parentId: undefined, childrenCount: 0, files: [] },
  { id: '6aa3c749-8f6a-4318-bfc4-79da1c1f9610', name: 'bba (Copy)', orderNo: 2, parentId: 'b3ef1a36-ce21-4387-a0d0-c27765344298', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '6d054d4d-0903-4520-9b18-28b4dcff17f2', name: 'Frontend (Copy) (Copy)', orderNo: 6, parentId: 'cae2aac5-bd02-45d6-a513-f79696ab14aa', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '6f7a7a45-e34e-4167-a085-7ba428377ef0', name: 'Timer', orderNo: 11, parentId: '68d2d717-0713-49f6-b1b8-58b0850d0200', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '70e77380-ef7c-4afb-8b1e-d17974d05e09', name: 'Cooperations', orderNo: 5, parentId: 'ec0f1b05-a053-4499-8f51-943c673e259b', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '716399db-f100-40e9-a13d-e90789d2a17c', name: 'bbb (Copy)', orderNo: 0, parentId: '517b130c-8cf6-4c13-99cd-3e98fb44a771', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '794fa5ef-19ec-463a-b40d-248283004a21', name: 'Priviges', orderNo: 2, projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, parentId: undefined, childrenCount: 0, files: [] },
  { id: '799ba718-2a98-4846-bb16-3da3eb653a83', name: 'Tasks', orderNo: 4, parentId: '0542483f-a61d-4de9-94d2-22e9bbafcf78', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '7b51f68e-38f6-49c7-8439-a7409fe29a12', name: 'bbb (Copy) (Copy)', orderNo: 8, parentId: 'eced7ae2-d838-402a-8355-b8448958c679', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '8921caa2-cb97-4b45-b4ab-5323e0422601', name: 'bba (Copy)', orderNo: 9, parentId: 'eced7ae2-d838-402a-8355-b8448958c679', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '90a23f33-c2a7-4d2c-aecc-3ee19d08d72e', name: 'Manual', orderNo: 12, parentId: '68d2d717-0713-49f6-b1b8-58b0850d0200', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: '989bcbae-2071-4440-be7d-ab0f633ea1f5', name: 'Auth ', orderNo: 2, projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, parentId: undefined, childrenCount: 0, files: [] },
  { id: '9b6926ff-3a54-4beb-b3ef-87e073c2c123', name: 'Company select', orderNo: 7, projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, parentId: undefined, childrenCount: 0, files: [] },
  { id: 'ad771f45-e6fa-4678-8548-9f34775ae5c3', name: 'Projects', orderNo: 3, parentId: 'ec0f1b05-a053-4499-8f51-943c673e259b', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: 'ae8ef798-d6dc-44ac-8bd0-1dcd6541d3be', name: 'bbb (Copy) (Copy)', orderNo: 7, parentId: 'cae2aac5-bd02-45d6-a513-f79696ab14aa', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: 'c9a858be-5cec-435c-9e0e-6a727ca79408', name: 'Location with reporting', orderNo: 1, projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: true, parentId: undefined, childrenCount: 0, files: [] },
  { id: 'cc40d26f-de24-4fb4-8618-fbbeb6879d3b', name: 'Locations', orderNo: 5, parentId: '0542483f-a61d-4de9-94d2-22e9bbafcf78', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: 'ce2dea1b-811a-47c6-8f1e-93449b2dc676', name: 'Frontend (Copy) (Copy)', orderNo: 10, parentId: 'eced7ae2-d838-402a-8355-b8448958c679', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: 'd86fda83-5f6b-4c4c-83a3-cbada9ad77bb', name: 'Frontend (Copy)', orderNo: 1, parentId: '517b130c-8cf6-4c13-99cd-3e98fb44a771', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: 'e3a1da21-9c75-4a43-8a26-95aa3a9f5ca8', name: 'L 3', orderNo: 3, parentId: '799ba718-2a98-4846-bb16-3da3eb653a83', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: 'e544beca-33e6-4840-b45d-b9475ecfcebf', name: 'Details ', orderNo: 2, parentId: '799ba718-2a98-4846-bb16-3da3eb653a83', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: 'e86b1e47-0393-419b-af70-7c44bfb7d8a8', name: 'bba', orderNo: 2, parentId: '517b130c-8cf6-4c13-99cd-3e98fb44a771', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, childrenCount: 0, files: [] },
  { id: 'e8ec4d7f-aff1-4009-972d-3ba263dcbcbb', name: 'App menu', orderNo: 3, projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, parentId: undefined, childrenCount: 0, files: [] },
  { id: 'ec0f1b05-a053-4499-8f51-943c673e259b', name: 'Company menu', orderNo: 4, projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, parentId: undefined, childrenCount: 0, files: [] },
  { id: 'f2fd3e68-6d9a-4a61-9315-b571c894ca2e', name: 'Project select', orderNo: 5, projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', readOnly: false, parentId: undefined, childrenCount: 0, files: [] }
];

@Injectable({ providedIn: 'root' })
export class LocationsDataService extends DataService<LocationDTO, Location> {
  private readonly locations: DataStore<Location> = new DataStore<Location>();
  private readonly locationsByParent: DataStore<IdsCollection> = new DataStore<IdsCollection>();
  private readonly projectLocations: DataStore<IdsCollection> = new DataStore<IdsCollection>();
  private readonly locationFactory: LocationFactory = inject(LocationFactory);

  public constructor() {
    super();
    this.initMockData();
  }

  private initMockData(): void {
    const rootLocations = MOCK_LOCATIONS.filter(l => !l.parentId);

    this.projectLocations.upsert({
      id: '656e918f-6b5e-463e-ad4f-1146e86617e5',
      ids: rootLocations.map(l => l.id)
    });

    rootLocations.forEach(loc => this.upsertLocationsByParent(loc, MOCK_LOCATIONS));
    rootLocations.forEach(loc => this.updateLocationsByParent(loc, MOCK_LOCATIONS));
  }

  public getById(id: string): Signal<Location | undefined> {
    return computed(() => this.locations.get(id)());
  }

  public getLocationsByParent(parentId: string): Signal<Location[] | undefined> {
    if (!parentId) {
      return signal(undefined);
    }

    return computed(
      () =>
        (this.locationsByParent.get(parentId)()?.ids ?? [])
          .map(id => this.getById(id)())
          .sort((a, b) => a.orderNo - b.orderNo) || []
    );
  }

  public getAllSubLocations(parentId: string): Location[] {
    const direct = this.getLocationsByParent(parentId)() || [];
    const nested = direct.flatMap(loc => (loc?.id ? this.getAllSubLocations(loc.id) : []));
    return [...direct, ...nested];
  }

  public getProjectLocations(projectId: string): Signal<Location[] | undefined> {
    if (!projectId) {
      return signal(undefined);
    }

    return computed(
      () =>
        (this.projectLocations.get(projectId)()?.ids ?? [])
          .map(id => this.getById(id)())
          .sort((a, b) => a.orderNo - b.orderNo) || []
    );
  }

  public addLocation(
    _projectId: string,
    _name: string,
    _orderNo: number,
    _parentLocationId?: string
  ): Observable<LocationDTO> {
    return EMPTY;
  }

  public duplicateLocations(
    _projectId: string,
    _locationIds: string[],
    _newParentId: string,
    _includeAttachments: boolean = false,
    _duplicateChildren: boolean = false
  ): Observable<LocationDTO[]> {
    return EMPTY;
  }

  public updateLocation(
    _projectId: string,
    _id: string,
    _name: string,
    _orderNo: number,
    _parentLocationId?: string
  ): Observable<LocationDTO> {
    return EMPTY;
  }

  public deleteLocations(_projectId: string, _locations: Location[]): Observable<string> {
    return EMPTY;
  }

  public reorderLocations(_projectId: string, _ids: string[]): Observable<LocationDTO[]> {
    return EMPTY;
  }

  public loadProjectLocations(_projectId: string): Observable<LocationDTO[]> {
    return EMPTY;
  }

  public upsertLocalData(dto: LocationDTO): Signal<Location> {
    if (!dto) {
      return signal(undefined);
    }

    const location = this.locationFactory.produce(dto);
    location.parentLocation = computed(() => (dto.parentId ? this.getById(dto.parentId)() : undefined));
    location.childrenCount = computed(() => this.locationsByParent.get(location.id)()?.ids?.length);

    return this.locations.upsert(location);
  }

  protected override handleEvent(_event: AppEvent): void {}

  private upsertLocationsByParent(parentLocation: LocationDTO, locations: LocationDTO[]): void {
    if (!parentLocation) {
      return;
    }
    this.upsertLocalData(parentLocation);
    const children = locations.filter(l => l.parentId === parentLocation.id) ?? [];
    children.forEach(child => this.upsertLocationsByParent(child, locations));
  }

  private updateLocationsByParent(parentLocation: LocationDTO, locations: LocationDTO[]): void {
    if (!parentLocation) {
      return;
    }

    const children = locations.filter(l => l.parentId === parentLocation.id) ?? [];
    this.locationsByParent.upsert({ id: parentLocation.id, ids: children.map(l => l.id) });
    children.forEach(child => this.updateLocationsByParent(child, locations));
  }
}
