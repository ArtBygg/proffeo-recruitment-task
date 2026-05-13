import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  output,
  Signal
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RadioComponent } from '@app/shared/components/radio/radio.component';
import { LocationsDataService } from '@app/shared/services/locations-data.service';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { Location } from '@app/shared/types/models/location/location.model';

@Component({
  selector: 'proffeo-single-location-item',
  templateUrl: './location-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, RadioComponent, MatIconModule]
})
export class LocationItemComponent {
  private readonly locationsService: LocationsDataService = inject(LocationsDataService);

  protected attachmentsVisible: boolean = false;
  protected attachments: Signal<FileInfo[]>; // Pozostaje do implementacji
  protected sublocationsVisible: boolean = false;
  protected sublocations: Signal<Location[]> = computed(() => {
    const currentLoc = this.location();
    return this.locationsService.getLocationsByParent(currentLoc.id)();
  });

  public location: InputSignal<Location> = input.required<Location>();
  public selectedLocation = input<Location>();
  public isReadonly = input<boolean>(true);
  public locationSelected = output<Location>();

  public constructor() {
    effect(() => {
      this.expandSelectedLocation();
    });
  }

  protected selectLocation(location: Location): void {
    this.locationSelected.emit(location);
  }

  protected toggleAttachments(): void {
    this.attachmentsVisible = !this.attachmentsVisible;
  }

  protected toggleSublocations(): void {
    this.sublocationsVisible = !this.sublocationsVisible;
  }

  protected isPartOfSelectedLocation(location: Location): boolean {
    if (!this.selectedLocation()) {
      return false;
    }

    let currentLocation: Location = this.selectedLocation();

    while (currentLocation) {
      if (currentLocation.id === location.id) {
        return true;
      }

      if (!currentLocation.parentLocation || typeof currentLocation.parentLocation !== 'function') {
        break;
      }

      currentLocation = currentLocation.parentLocation();
    }
    return false;
  }

  protected openDialog(_fileIndex: number): void {
    void _fileIndex;
    // this.dialog.open(CarouselDialogComponent, {
    //   width: width,
    //   maxWidth: '100vw',
    //   height: height,
    //   data: {
    //     currentIndex: fileIndex,
    //     initFiles: this.attachments$,
    //     plainFilesMode: true
    //   }
    // });
  }

  private expandSelectedLocation(): void {
    const selected = this.selectedLocation();
    const current = this.location();

    if (selected && current) {
      const locationsPath = selected.locationsPath;

      if (!locationsPath || !Array.isArray(locationsPath)) {
        return;
      }

      const currentLocationIndex: number = locationsPath.findIndex(loc => loc.id === current.id);
      const lastLocationIndex: number = locationsPath.length - 1;
      const isPartOfSelectedLocationPath: boolean = currentLocationIndex !== -1;
      this.sublocationsVisible = isPartOfSelectedLocationPath && currentLocationIndex < lastLocationIndex;
    }
  }
}
