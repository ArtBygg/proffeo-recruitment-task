import { HttpInterceptorFn } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';
import { throwError } from 'rxjs';

export const API_BASE_ENDPOINT = new InjectionToken<string>('Base for all API endpoints');

export const ASSETS_PREFIXES = ['/images', 'images', '/i18n', 'i18n'];

export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBase = inject(API_BASE_ENDPOINT);

  if (!apiBase) {
    console.error('API_BASE_ENDPOINT token not provided');
    return throwError(() => new Error('API_BASE_ENDPOINT token not provided'));
  }

  const isAsset = ASSETS_PREFIXES.some(prefix => req.url.startsWith(prefix));

  if (isAsset) {
    return next(req);
  }

  const isAbsoluteUrl = /^https?:\/\//i.test(req.url);
  if (isAbsoluteUrl) {
    return next(req);
  }

  const apiReq = req.clone({
    url: apiBase + req.url
  });

  return next(apiReq);
};
