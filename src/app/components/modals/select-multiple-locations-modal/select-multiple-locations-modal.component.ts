import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { ModalComponent } from '@app/shared/components/modal/modal.component';
import { SelectLocationsListComponent } from '@app/shared/components/select-locations-list/select-locations-list.component';
import { LocationsDataService } from '@app/shared/services/locations-data.service';
import { Location } from '@app/shared/types/models/location/location.model';
import { TranslateModule } from '@ngx-translate/core';

export interface SelectMultipleLocationsModalData {
  locations: Location[];
  selectedLocations: Location[];
  noLocation: boolean;
}

export interface SelectMultipleLocationsModalResult {
  selectedLocations: Location[];
  noLocation: boolean;
}

@Component({
  selector: 'proffeo-select-multiple-locations-modal',
  templateUrl: './select-multiple-locations-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, SelectLocationsListComponent, ModalComponent, ButtonComponent, MatDialogClose, MatCheckbox]
})
export class SelectMultipleLocationsModalComponent implements OnInit {
  private readonly data = inject<SelectMultipleLocationsModalData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<SelectMultipleLocationsModalComponent>);
  private readonly locationsService = inject(LocationsDataService);

  protected readonly ButtonType = ButtonType;

  protected parentLocations = signal<Location[]>([]);
  protected selectedLocations = signal<Location[]>([]);
  protected noLocation = signal<boolean>(false);
  protected collapseAll = signal<boolean>(false);

  protected allLocations = computed(() => {
    const parents = this.parentLocations() ?? [];
    const allSublocations = parents.flatMap(location =>
      location?.id ? this.locationsService.getAllSubLocations(location.id) : []
    );
    return [...parents, ...allSublocations];
  });

  protected isAllSelected = computed(() => {
    return this.allLocations().length === this.selectedLocations().length;
  });

  public ngOnInit(): void {
    this.parentLocations.set(this.data.locations ?? []);
    this.selectedLocations.set(this.data.selectedLocations ?? []);
    this.noLocation.set(this.data.noLocation ?? false);
  }

  protected save(): void {
    this.dialogRef.close({
      selectedLocations: this.selectedLocations(),
      noLocation: this.noLocation()
    } satisfies SelectMultipleLocationsModalResult);
  }

  protected onNoLocationChange(event: MatCheckboxChange): void {
    this.noLocation.set(event.checked);
    if (event.checked) {
      this.selectedLocations.set([]);
    }
  }

  private clearNoLocationIfSelecting(): void {
    if (this.noLocation()) {
      this.noLocation.set(false);
    }
  }

  protected addLocation(location: Location): void {
    this.clearNoLocationIfSelecting();
    const toAdd = this.collectWithChildren(location);

    this.selectedLocations.update(list => {
      const set = new Map(list.map(l => [l.id, l]));

      toAdd.forEach(loc => set.set(loc.id, loc));

      return Array.from(set.values());
    });

    this.autoSelectParents();
  }

  protected removeLocation(location: Location): void {
    const toRemove = this.collectWithChildren(location).map(l => l.id);

    this.selectedLocations.update(list => list.filter(l => !toRemove.includes(l.id)));

    this.autoDeselectParents(location);
  }

  protected toggleAllLocations(event: MatCheckboxChange): void {
    this.clearNoLocationIfSelecting();
    this.selectedLocations.set(event.checked ? this.allLocations() : []);
  }

  private collectWithChildren(location: Location): Location[] {
    const result: Location[] = [location];

    const children = this.locationsService.getLocationsByParent(location.id)() || [];

    for (const child of children) {
      result.push(...this.collectWithChildren(child));
    }

    return result;
  }

  private autoSelectParents(): void {
    let updated = true;

    while (updated) {
      updated = false;

      for (const parent of this.allLocations()) {
        const children = this.locationsService.getLocationsByParent(parent.id)?.() || [];

        if (!children.length) continue;

        const allChildrenSelected = children.every(child => this.selectedLocations().some(l => l.id === child.id));

        const parentSelected = this.selectedLocations().some(l => l.id === parent.id);

        if (allChildrenSelected && !parentSelected) {
          this.selectedLocations.update(list => [...list, parent]);
          updated = true;
        }
      }
    }
  }

  private autoDeselectParents(location: Location): void {
    let parentId = location.parentLocation()?.id;

    while (parentId) {
      this.selectedLocations.update(list => list.filter(l => l.id !== parentId));

      const parent = this.allLocations().find(l => l.id === parentId);
      parentId = parent?.parentLocation()?.id;
    }
  }
}
