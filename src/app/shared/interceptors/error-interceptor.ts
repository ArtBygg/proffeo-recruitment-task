import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Params } from '@angular/router';
import { ToastService } from '@app/shared/services/shared/toast.service';
import { RefreshAccessTokenService } from '@app/shared/services/token-refresh-coordinator.service';
import { RequestError } from '@app/shared/types/enums/request-error.enum';
import { TranslateService } from '@ngx-translate/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthEndpoints } from '../services/http/auth-http.service';

interface ErrorResponse {
  Detail: string;
  ErrorCode: keyof typeof RequestError;
  StatusCode: number;
  errors: {
    name?: string[];
  };
}

export function httpErrorInterceptor(req: HttpRequest<Params>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const injector: Injector = inject(Injector);

  const requestError = RequestError;

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const isRefreshTokenRequest = req.url.includes(AuthEndpoints.REFRESH_ACCESS_TOKEN);
        if (!isRefreshTokenRequest) {
          return injector
            .get(RefreshAccessTokenService)
            .refreshOrWait()
            .pipe(
              switchMap(() => {
                console.log('refreshed token');
                return next(req);
              })
            );
        }
      }
      const message = getErrorDescription(error.error, injector, requestError);
      const toastService = injector.get(ToastService);
      if (message) {
        toastService.error(message);
      } else {
        toastService.error(injector.get(TranslateService).instant('toasts.operation-failed'));
      }
      return throwError(() => error);
    })
  );
}

function getErrorDescription(
  error: ErrorResponse,
  injector: Injector,
  requestError: typeof RequestError
): string | null {
  const translateService = injector.get(TranslateService);
  const isObjectNotEmpty = !!error && Object.keys(error).length > 0;

  if (!isObjectNotEmpty) return null;

  const errorCode = error.ErrorCode;
  //TODO 'Mapping error in requestError (there are no error codes in this arr) - no consistency with BE'
  const mappedErrorKey = requestError?.[errorCode];

  if (mappedErrorKey) {
    return translateService.instant(`request-errors.${mappedErrorKey}`);
  }

  const nameError = Array.isArray(error.errors?.name) ? error.errors.name[0] : null;

  return nameError || error.Detail || null;
}
