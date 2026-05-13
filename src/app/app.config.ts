import { DatePipe } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MAT_RIPPLE_GLOBAL_OPTIONS,
  RippleGlobalOptions
} from '@angular/material/core';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideRouter } from '@angular/router';
import { routes } from '@app/app.routes';
import { CustomDateAdapter } from '@app/shared/configs/custom-date-adapter';
import { environment } from '@env/environment';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { API_BASE_ENDPOINT, apiBaseInterceptor } from './shared/interceptors/api-base.interceptor';
import { authInterceptor } from './shared/interceptors/auth-interceptor';
import { httpErrorInterceptor } from './shared/interceptors/error-interceptor';
import { I18nMatPaginatorIntl } from './shared/utils/i18n-mat-paginator-intl';

const MAT_FORM_FIELD_OPTIONS = {
  appearance: 'outline',
  color: 'primary',
  subscriptSizing: 'dynamic'
};

const DEFAULT_DATE_FORMATS = {
  parse: {
    dateInput: 'DD MMM YYYY'
  },
  display: {
    dateInput: 'DD MMM YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD MMMM YYYY',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

const globalRippleConfig: RippleGlobalOptions = {
  disabled: true,
  animation: {
    enterDuration: 350,
    exitDuration: 0
  },
  terminateOnPointerUp: false
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([httpErrorInterceptor, authInterceptor, apiBaseInterceptor])),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: 'i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en-US',
      lang: 'en-US'
    }),
    provideRouter(routes /* , withDebugTracing() */),
    { provide: MatPaginatorIntl, useClass: I18nMatPaginatorIntl },
    { provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: globalRippleConfig },
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: DEFAULT_DATE_FORMATS },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: MAT_FORM_FIELD_OPTIONS },
    { provide: MAT_DATE_LOCALE, useFactory: (): string => navigator.language },
    { provide: API_BASE_ENDPOINT, useValue: environment.APIEndPoint },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: { autoFocus: 'dialog' }
    },
    DatePipe
  ]
};
