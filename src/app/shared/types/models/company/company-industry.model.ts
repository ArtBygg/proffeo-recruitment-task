import { FormControl } from '@angular/forms';

export interface CreateCompanyIndustryForm {
  name: FormControl<string>;
}

export interface EditCompanyIndustryForm {
  name: FormControl<string>;
  id: FormControl<string>;
}
