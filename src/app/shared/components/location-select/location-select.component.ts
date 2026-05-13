import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Input,
  input,
  OnInit,
  output,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Location } from '@app/shared/types/models/location/location.model';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, fromEvent } from 'rxjs';

export type TaskLocationSelectMode = 'row' | 'column';

@Component({
  selector: 'proffeo-location-select',
  templateUrl: './location-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, MatTooltip, MatIconModule]
})
export class LocationSelectComponent implements OnInit, AfterViewInit {
  private static readonly SINGLE_LINE_HEIGHT_THRESHOLD: number = 30;

  @ViewChild('namePath')
  private readonly namePath: ElementRef;
  private readonly changeDetector: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private visibleLocations: Location[];
  private _location?: Location;

  public readonly minimalMode = input<boolean>(false);
  public readonly isReadonly = input<boolean>(false);
  public readonly showPlaceholder = input<boolean>(false);
  public readonly showIcon = input<boolean>(true);
  public readonly isSmallText = input<boolean>(true);
  public readonly locationClicked = output<void>();

  protected get visibleLocationsNamePath(): string {
    if (!this.visibleLocations || this.visibleLocations.length === 0) {
      return this._location?.name || '';
    }
    return this.visibleLocations.map(location => location.name).join(', ');
  }

  protected get fullLocationsNamePath(): string {
    return this._location?.locationsPath?.map(location => location.name).join(', ') || '';
  }

  public get location(): Location | undefined {
    return this._location;
  }

  @Input({ required: true })
  public set location(value: Location | undefined) {
    this._location = value;
    this.onLocationChange();
  }

  private onLocationChange(): void {
    if (!this._location?.locationsPath || this._location.locationsPath.length === 0) {
      this.visibleLocations = this._location ? [this._location] : [];
    } else {
      this.visibleLocations = [...this._location.locationsPath];
    }

    if (this.namePath?.nativeElement) {
      this.resizeNamePath();
    }
  }

  public ngOnInit(): void {
    this.visibleLocations = this.location?.locationsPath || [];
  }

  public ngAfterViewInit(): void {
    this.resizeNamePath();
    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(10))
      .subscribe(() => {
        this.resizeNamePath();
      });
  }

  private resizeNamePath(): void {
    if (!this.namePath?.nativeElement) return;

    const namePathHeight: number = this.namePath.nativeElement.offsetHeight;
    if (namePathHeight > LocationSelectComponent.SINGLE_LINE_HEIGHT_THRESHOLD) {
      this.shrinkNamePath(1);
    } else {
      this.stretchNamePath();
    }
  }

  private stretchNamePath(): void {
    if (!this.location?.locationsPath) return;

    if (this.areVisibleLocationsShorterThanAllLocations() && !this.isNamePathOver1LineHeight()) {
      this.addNextVisibleLocation();
      if (this.isNamePathOver1LineHeight()) {
        this.shrinkNamePath(this.location.locationsPath.length - this.visibleLocations.length);
      } else {
        this.stretchNamePath();
      }
    }
  }

  private addNextVisibleLocation(): void {
    if (!this.location?.locationsPath || !this.visibleLocations) return;

    if (this.visibleLocations[this.visibleLocations.length - 1].name === '...') {
      this.visibleLocations[this.visibleLocations.length - 1] =
        this.location.locationsPath[this.visibleLocations.length - 1];
    } else {
      this.visibleLocations.push(this.location.locationsPath[this.visibleLocations.length]);
    }
    this.changeDetector.detectChanges();
  }

  private areVisibleLocationsShorterThanAllLocations(): boolean {
    if (!this.visibleLocations || !this.location?.locationsPath) return false;
    return this.visibleLocations.length < this.location.locationsPath.length;
  }

  private isNamePathOver1LineHeight(): boolean {
    if (!this.namePath?.nativeElement) return false;
    return this.namePath.nativeElement.offsetHeight > LocationSelectComponent.SINGLE_LINE_HEIGHT_THRESHOLD;
  }

  private shrinkNamePath(level: number): void {
    if (!this.location?.locationsPath) {
      this.visibleLocations = [];
      return;
    }

    this.visibleLocations = [];
    const locations: Location[] = this.location.locationsPath;
    for (let i: number = 0; i < locations.length - level; i++) {
      this.visibleLocations.push(locations[i]);
    }

    if (this.visibleLocations.length > 0) {
      this.visibleLocations.push({
        name: '...'
      } as Location);
    }

    this.changeDetector.detectChanges();

    if (
      this.visibleLocations.length > 1 &&
      this.namePath?.nativeElement &&
      this.namePath.nativeElement.offsetHeight > LocationSelectComponent.SINGLE_LINE_HEIGHT_THRESHOLD
    ) {
      this.shrinkNamePath(level + 1);
    }
  }

  protected onLocationClicked(): void {
    if (this.isReadonly()) return;
    this.locationClicked.emit();
  }
}
