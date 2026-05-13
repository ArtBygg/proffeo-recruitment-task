import { Signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FileInfo } from '@app/shared/types/models/files/file-info';

export interface ProjectLocationEditModalData {
  projectLocationToEdit: Location;
}

export interface AddProjectLocationModalData {
  parentId: string;
  projectId: string;
}

export interface ChangeLocationParentModalData {
  location: Location;
  locations: Signal<Location[]>;
}

export interface DuplicateLocationsModalData {
  locationsToDuplicate: Location[];
  locations: Signal<Location[]>;
}

export interface EditProjectLocationForm {
  name: FormControl<string>;
  parentId: FormControl<string>;
  orderNo: FormControl<number>;
}

export interface AddProjectLocationForm {
  name: FormControl<string>;
  parentId: FormControl<string>;
  orderNo: FormControl<number>;
}

export interface AddMultipleProjectLocationsForm {
  name: FormControl<string>;
  parentId: FormControl<string>;
  amount: FormControl<number>;
  numbering: FormControl<number>;
}

export interface SelectSingleLocationModalData {
  locations: Location[];
  projectId: string;
  selectedLocation?: Location;
  isReadonly?: boolean;
  showEditButton?: boolean;
  isEmptyOptionEnabled?: boolean;
  title?: string;
}

export class Location {
  public id: string | undefined;
  public name: string | undefined;
  public parentLocation?: Signal<Location>;
  public projectId: string | undefined;
  public childrenCount: Signal<number>;
  public orderNo: number | undefined;
  public readOnly: boolean | undefined;
  public files: Signal<FileInfo[]>;

  public constructor(value: Partial<Location>) {
    Object.assign(this, value);
  }

  public get locationsPath(): Location[] {
    if (!this.parentLocation || typeof this.parentLocation !== 'function') {
      return [this];
    }

    const parent = this.parentLocation();
    if (!parent) {
      return [this];
    }

    return parent.locationsPath.concat(this);
  }
}
