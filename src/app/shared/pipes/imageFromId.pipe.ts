// import { ChangeDetectorRef, Inject, Pipe, PipeTransform } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { DomSanitizer } from '@angular/platform-browser';
// import { AuthService } from '@core/auth';
// import { API_BASE_ENDPOINT } from '@shared/utils/services/api-base.interceptor';

// @Pipe({

//   name: 'appImageFromId'
// })
// export class ImageFromIdPipe implements PipeTransform {
//   constructor(
//     private _http: HttpClient,
//     private _cdr: ChangeDetectorRef,
//     private _domSanitizer: DomSanitizer,
//     @Inject(API_BASE_ENDPOINT) private _apiBase: string,
//     private _authService: AuthService
//   ) {}
//   transform(id: string, type: 'full' | 'preview' = 'preview'): string {
//     if (!id) {
//       return id;
//     }

//     const params = new URLSearchParams();
//     params.append('secret', this._authService.sessionId);

//     if (type === 'preview') {
//       params.append('width', '100');
//       params.append('height', '100');

//       return this._apiBase + '/files/' + id + '/preview?' + params.toString();
//     }

//     return this._apiBase + '/files/' + id + '?' + params.toString();
//   }
// }
