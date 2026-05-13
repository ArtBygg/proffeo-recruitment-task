import { HttpEvent, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../services/local-storage.service';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>
) => {
  const tokenService: LocalStorageService = inject(LocalStorageService);

  // Add header with token
  request = addAuthHeader(request, tokenService.tokens()?.accessToken);

  // Logout does not require error handling
  if (request.url.includes('auth/logout')) {
    return next(request);
  }

  // Default error handling
  return next(request);
};

// Helpers
function addAuthHeader(request: HttpRequest<unknown>, accessToken: string | undefined): HttpRequest<unknown> {
  if (!accessToken) {
    return request;
  }
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}
