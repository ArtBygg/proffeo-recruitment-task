import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, finalize, Observable, shareReplay, take, tap, throwError } from 'rxjs';
import { UrlSegment } from '../types/enums/url-segment.enum';
import { Tokens } from '../types/models/auth/auth.model';
import { AuthHttpService } from './http/auth-http.service';
import { LocalStorageService } from './local-storage.service';
import { ToastService } from './shared/toast.service';

/**
 * RefreshAccessTokenService - Coordinates access-token refresh flow for concurrent 401 responses.
 *
 * Runs a single in-flight `auth/refresh-access-token` request (single-flight) and shares its result
 * with all waiting callers to prevent race conditions caused by parallel refresh attempts.
 *
 * Usage: Called from {@link httpErrorInterceptor} whenever a protected API call returns HTTP 401.
 *
 * Architecture:
 * - {@link AuthHttpService}: Executes `auth/refresh-access-token`
 * - {@link LocalStorageService}: Persists refreshed tokens and clears session on refresh failure
 * - {@link Router}, {@link TranslateService}, {@link ToastService}: Handles redirect and logout toast when refresh fails
 */
@Injectable({ providedIn: 'root' })
export class RefreshAccessTokenService {
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly authHttpService: AuthHttpService = inject(AuthHttpService);
  private readonly router: Router = inject(Router);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly toastService: ToastService = inject(ToastService);
  private inFlightRefreshRequest$: Observable<Tokens> | null = null;

  public refreshOrWait(): Observable<Tokens> {
    if (this.inFlightRefreshRequest$) {
      return this.inFlightRefreshRequest$;
    }

    const refreshToken = this.localStorageService.tokens()?.refreshToken;
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token found'));
    }

    this.inFlightRefreshRequest$ = this.authHttpService.refreshAccessToken({ refreshToken }).pipe(
      tap((tokens: Tokens) => this.localStorageService.setTokens(tokens)),
      finalize(() => (this.inFlightRefreshRequest$ = null)),
      catchError(error => {
        this.localStorageService.clearTokens();
        const redirectUrl = this.router.routerState.snapshot.url;
        const alreadyOnSignInPage = redirectUrl.includes(UrlSegment.SIGN_IN);
        if (!alreadyOnSignInPage) {
          void this.router
            .navigate([UrlSegment.SIGN_IN], {
              queryParams: { redirectUrl }
            })
            .then(navigated => {
              if (navigated) {
                this.translateService
                  .use(this.localStorageService.language())
                  .pipe(take(1))
                  .subscribe(translations => {
                    this.toastService.error(translations['toasts.logged-out'] as string);
                  });
              }
            });
        }
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.inFlightRefreshRequest$;
  }
}
