import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'proffeo-timeline-content',
  templateUrl: './timeline-content.component.html',
  styleUrls: ['./timeline-content.component.scss'],
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineContentComponent {
  public readonly contentClass = input<string>('');
}
