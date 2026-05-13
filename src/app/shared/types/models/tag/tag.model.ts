import { FormControl } from '@angular/forms';
import { ModalModeEnum } from '@app/shared/types/enums/modal-mode.enum';

export interface UpdateProjectTagRequestBody {
  id: string;
  name: string;
  hexColor: string;
  description: string;
}

export interface CreateProjectTagRequestBody {
  name: string;
  hexColor: string;
  description: string;
  projectId: string;
}

export interface TagFormModalData {
  projectTagToEdit?: Tag;
  mode?: ModalModeEnum;
}

export interface ProjectTagForm {
  id: FormControl<string>;
  hexColor: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
}

export class Tag {
  public description: string | undefined;
  public hexColor: string;
  public id: string;
  public name: string;
  public projectId: string;

  public constructor(value: Partial<Tag>) {
    Object.assign(this, value);
  }
}
