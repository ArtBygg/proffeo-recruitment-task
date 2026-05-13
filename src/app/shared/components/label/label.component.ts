import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'proffeo-label',
  templateUrl: './label.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelComponent {
  public readonly required = input<boolean>(false);
  public readonly isPlaceholder = input<boolean>(false);
  public readonly textBold = input<boolean>(false);
}
