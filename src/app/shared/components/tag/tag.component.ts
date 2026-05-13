import { Component, input, InputSignal } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Tag } from '@app/shared/types/models/tag/tag.model';

@Component({
  selector: 'proffeo-tag',
  templateUrl: './tag.component.html',
  imports: [MatTooltipModule]
})
export class TagComponent {
  public readonly tag: InputSignal<Tag> = input.required<Tag>();

  protected get getTagBackgroundColor(): string {
    return `${this.tag().hexColor}65`;
  }
}
