import { Component, input } from '@angular/core';

@Component({
  selector: 'proffeo-loader',
  imports: [],
  templateUrl: './loader.component.html'
})
export class LoaderComponent {
  public readonly loading = input.required<boolean>();
}
