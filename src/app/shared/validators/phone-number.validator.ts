import { Validators } from '@angular/forms';

export const phoneNumberValidator = Validators.pattern('^\\+?[0-9]{1,4}[\\s.-]?(?:[0-9]{1,3}[\\s.-]?){1,4}[0-9]{1,4}$');
