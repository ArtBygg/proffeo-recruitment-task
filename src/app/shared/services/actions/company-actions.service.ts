import { inject, Injectable } from '@angular/core';
import { NotificationsService } from '../notifications.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppEvent } from '@app/shared/types/models/notifications/app-event';
import { CompaniesDataService } from '../companies-data.service';
import { AuthService } from '../auth.service';
import { User } from '@app/shared/types/models/user/user.model';


@Injectable({
  providedIn: 'root',
})
export class CompanyActionsService {
  private readonly notificationsService = inject(NotificationsService);
//   private readonly companiesHttpService = inject(CompaniesHttpService);


  public constructor(){
    this.notificationsService.notifications$
    .pipe(
      takeUntilDestroyed()
    )
    .subscribe(
      {
      next: (event: AppEvent) => {
        this.handleEvent(event);
      }
    }
    );
  }

  protected handleEvent(event: AppEvent) {



  }


}
