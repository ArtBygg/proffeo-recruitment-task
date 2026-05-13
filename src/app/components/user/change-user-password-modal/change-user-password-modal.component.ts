import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogClose } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ButtonType } from '@app/shared/components/button/button.types';
import { ModalComponent } from '@app/shared/components/modal/modal.component';
import { passwordsMustMatchValidator, passwordValidator } from '@app/shared/validators';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-change-user-password-modal',
  imports: [ModalComponent, TranslatePipe, ReactiveFormsModule, ButtonComponent, MatIconModule, MatDialogClose],
  templateUrl: './change-user-password-modal.component.html'
})
export class ChangeUserPasswordModalComponent {
  protected readonly ButtonType: typeof ButtonType = ButtonType;
  protected readonly resetPasswordForm: FormGroup = new FormGroup(
    {
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(8), passwordValidator()]),
      confirmPassword: new FormControl('', [Validators.required])
    },
    { validators: passwordsMustMatchValidator('newPassword', 'confirmPassword') }
  );
}
