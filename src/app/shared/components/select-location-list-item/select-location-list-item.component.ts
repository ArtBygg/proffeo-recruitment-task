import { NgClass } from '@angular/common';
import { Component, computed, inject, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RadioComponent } from '@app/shared/components/radio/radio.component';
import { LocationsDataService } from '@app/shared/services/locations-data.service';
import { Location } from '@app/shared/types/models/location/location.model';

@Component({
  selector: 'proffeo-select-location-list-item',
  imports: [NgClass, RadioComponent, MatIconModule],
  templateUrl: './select-location-list-item.component.html'
})
export class SelectLocationListItemComponent {
  private readonly locationService: LocationsDataService = inject(LocationsDataService);

  protected readonly locationChildren: Signal<Location[]> = computed(() =>
    this.locationService.getLocationsByParent(this.location()?.id)()
  );
  protected sublocationsVisible: boolean = false;

  public readonly selectedLocation: InputSignal<Location | undefined> = input<Location | undefined>(undefined);
  public readonly location: InputSignal<Location> = input.required<Location>();
  public readonly locationSelected: OutputEmitterRef<Location> = output<Location>();

  protected toggleSublocations(): void {
    this.sublocationsVisible = !this.sublocationsVisible;
  }

  protected selectLocation(location: Location): void {
    this.locationSelected.emit(location);
  }

  protected isPartOfSelectedLocation(location: Location): boolean {
    const selectedLocation = this.selectedLocation();
    if (!selectedLocation) {
      return false;
    }

    const currentLocation: Location = selectedLocation;
    if (currentLocation.id === location.id) {
      return true;
    }
    return false;
  }
}
