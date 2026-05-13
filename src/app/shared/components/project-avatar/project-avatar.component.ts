import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'proffeo-project-avatar',
  imports: [NgClass],
  templateUrl: './project-avatar.component.html'
})
export class ProjectAvatarComponent {
  public readonly url = input<string>(undefined);
  public readonly projectName = input<string>(undefined);
  public readonly size = input<string>('normal');
}
