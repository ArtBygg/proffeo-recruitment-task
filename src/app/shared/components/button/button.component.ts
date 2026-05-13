import { Component, input, InputSignal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ButtonType, IconSize, IconType } from '@app/shared/components/button/button.types';

import { NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { MaterialSymbol } from 'material-symbols';

@Component({
  selector: 'proffeo-button',
  imports: [MatIconModule, TranslatePipe, NgClass, MatTooltip],
  host: {
    '[class.pointer-events-none]': 'disabled()'
  },
  templateUrl: './button.component.html'
})
export class ButtonComponent {
  protected readonly ButtonType = ButtonType;
  protected readonly IconType = IconType;

  public type: InputSignal<ButtonType> = input(ButtonType.PRIMARY);
  public cta: InputSignal<boolean> = input(false);
  public disabled: InputSignal<boolean> = input(false);
  public fontIcon: InputSignal<MaterialSymbol> = input();
  public iconType: InputSignal<IconType> = input(IconType.OUTLINED);
  public iconSize: InputSignal<IconSize> = input(IconSize.BASE);
  public text: InputSignal<string> = input();
  public tooltip: InputSignal<string> = input();
}
