import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';

import { ValueAccessorDirective } from '../../directives/value-accessor.directive';

@Component({
  imports: [NgClass, AsyncPipe],
  selector: 'proffeo-radio',
  templateUrl: './radio.component.html',
  hostDirectives: [ValueAccessorDirective]
})
export class RadioComponent {
  private readonly control = inject(NgControl, { optional: true, self: true });
  public readonly value = input.required<string>();
  public readonly name = input.required<string>();
  public readonly checked = input<boolean>(false);

  public readonly valueAccessor = inject(ValueAccessorDirective<string>);

  public constructor() {
    if (this.control) {
      this.control.valueAccessor = this.valueAccessor;
    }
  }
}
