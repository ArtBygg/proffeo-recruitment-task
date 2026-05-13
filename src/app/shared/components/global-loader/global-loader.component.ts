import { Component, inject, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoaderService } from '@app/shared/services/shared/loader.service';

@Component({
  selector: 'proffeo-global-loader',
  templateUrl: './global-loader.component.html',
  imports: [RouterModule]
})
export class GlobalLoaderComponent {
  private readonly loaderService: LoaderService = inject(LoaderService);
  private readonly _loading: Signal<boolean> = this.loaderService.loading;

  protected get loading(): Signal<boolean> {
    return this._loading;
  }
}
