import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { LocationItemComponent } from '@app/components/project/project-locations/location-item/location-item.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { ModalComponent } from '@app/shared/components/modal/modal.component';
import { Location, SelectSingleLocationModalData } from '@app/shared/types/models/location/location.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-select-single-location-modal',
  templateUrl: './select-single-location-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, LocationItemComponent, MatDialogClose, MatIconModule, ModalComponent, ButtonComponent]
})
export class SelectSingleLocationModalComponent implements OnInit {
  private readonly data: SelectSingleLocationModalData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef: MatDialogRef<SelectSingleLocationModalComponent> = inject(MatDialogRef);

  protected selectedLocation?: Location;
  protected locations: Location[];
  protected isReadonly: boolean;
  protected showEditButton: boolean;
  protected isEmptyOptionEnabled: boolean;
  protected title: string;
  protected ButtonType = ButtonType;

  public ngOnInit(): void {
    this.locations = this.data.locations;
    this.selectedLocation = this.data.selectedLocation;
    this.isReadonly = false;
    this.showEditButton = this.data.showEditButton;
    this.isEmptyOptionEnabled = this.data.isEmptyOptionEnabled;
    this.title = this.data.title;
  }

  protected save(): void {
    this.dialogRef.close(this.selectedLocation);
  }
}
