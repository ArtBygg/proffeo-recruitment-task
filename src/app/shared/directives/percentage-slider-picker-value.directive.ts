import { Directive, TemplateRef, inject, input } from '@angular/core';

@Directive({
  selector: '[appPercentageSliderPickerValue]'
})
export class PercentageSliderPickerValueDirective {
  public readonly label = input<string>(undefined);
  public readonly tpl = inject(TemplateRef<unknown>);
}
