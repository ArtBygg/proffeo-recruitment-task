import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnChanges,
  output,
  Signal,
  SimpleChanges
} from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { LocationsDataService } from '@app/shared/services/locations-data.service';
import { Location } from '@app/shared/types/models/location/location.model';

@Component({
  selector: 'proffeo-select-locations-list',
  templateUrl: './select-locations-list.component.html',
  styleUrls: ['./select-locations-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIcon, MatCheckbox]
})
export class SelectLocationsListComponent implements OnChanges {
  private readonly locationsService: LocationsDataService = inject(LocationsDataService);

  protected sublocationsVisible: { [key: string]: boolean } = {};
  protected sublocations$: { [key: string]: Signal<Location[]> } = {};
  protected checkedLocationsMap = computed(() => {
    const map = new Map<string, boolean>();
    for (const location of this.selectedLocations()) {
      if (location?.id) {
        map.set(location.id, true);
      }
    }
    return map;
  });

  public readonly locations = input.required<Location[]>();
  public readonly level = input<number>(0);
  public readonly selectedLocations = input<Location[]>([]);
  public readonly collapseAll = input<boolean>(false);
  public readonly locationSelected = output<Location>();
  public readonly locationRemoved = output<Location>();

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['collapseAll'] && changes['collapseAll'].currentValue) {
      this.sublocationsVisible = {};
    }
  }

  protected toggleSublocationsVisibility(location: Location): void {
    this.sublocationsVisible[location.id] = !this.sublocationsVisible[location.id];
    const isVisible = this.sublocationsVisible[location.id];
    if (isVisible && !this.sublocations$[location.id]) {
      this.sublocations$[location.id] = this.locationsService.getLocationsByParent(location.id);
    }
  }

  protected selectLocation(checkboxEvent: MatCheckboxChange, location: Location): void {
    if (checkboxEvent.checked) {
      this.locationSelected.emit(location);
    } else {
      this.locationRemoved.emit(location);
    }
  }

  protected onLocationSelected($event: Location): void {
    this.locationSelected.emit($event);
  }

  protected onLocationRemoved($event: Location): void {
    this.locationRemoved.emit($event);
  }
}
