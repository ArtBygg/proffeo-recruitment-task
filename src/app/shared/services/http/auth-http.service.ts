import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CheckConfirmEmailTokenRequestBody,
  CheckResetPasswordTokenRequestBody,
  ConfirmEmailSetPasswordRequestBody,
  ForgotPasswordRequestBody,
  LoginRequestBody,
  LoginResponse,
  RefreshAccessTokenRequestBody,
  ResetPasswordRequestBody,
  Tokens
} from '@app/shared/types/models/auth/auth.model';
import { UpdateUserDetailsRequestBody, UserDTO } from '@app/shared/types/models/user/user-dto.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export enum AuthEndpoints {
  LOGIN = 'auth/login',
  LOGOUT = 'auth/logout',
  FORGOT_PASSWORD = 'auth/forgot-password',
  CHECK_CONFIRM_EMAIL_TOKEN = 'auth/check-confirm-email-token',
  CHECK_RESET_PASSWORD_TOKEN = 'auth/check-reset-password-token',
  RESET_PASSWORD = 'auth/reset-password',
  REFRESH_ACCESS_TOKEN = 'auth/refresh-access-token',
  CONFIRM_EMAIL_SET_PASSWORD = 'auth/confirm-email-set-password',
  GET_SIGNED_IN_USER = 'auth/signed-in-user',
  UPDATE_CURRENT_USER = 'auth/update-current-user'
}

/**
 * AuthHttpService - HTTP API layer for authentication and current-user endpoints.
 *
 * Performs `auth/*` requests and `auth/update-current-user`. Uses the app {@link HttpClient} (global interceptors
 * apply: {@link authInterceptor} attaches the access token from {@link LocalStorageService} when present).
 *
 * Refresh-token calls bypass this service: {@link httpErrorInterceptor} posts to `auth/refresh-access-token` via
 * an ad hoc {@link HttpClient} backed by {@link HttpBackend} to avoid interceptor recursion.
 *
 * Scope: Global (`providedIn: 'root'`).
 *
 * Usage: {@link AuthService} only for these endpoints; views and guards use {@link AuthService}.
 *
 * Architecture:
 * - {@link AuthService}: Session orchestration and user model
 * - {@link AuthHttpService}: Typed HTTP surface for auth DTOs
 */
@Injectable({ providedIn: 'root' })
export class AuthHttpService {
  private httpClient: HttpClient = inject(HttpClient);

  public login(body: LoginRequestBody): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(`${environment.APIEndPoint}${AuthEndpoints.LOGIN}`, body);
  }

  public logout(): Observable<unknown> {
    return this.httpClient.post<unknown>(`${environment.APIEndPoint}${AuthEndpoints.LOGOUT}`, {});
  }

  public forgotPassword(body: ForgotPasswordRequestBody): Observable<unknown> {
    return this.httpClient.post<unknown>(`${environment.APIEndPoint}${AuthEndpoints.FORGOT_PASSWORD}`, body);
  }

  public checkConfirmEmailToken(body: CheckConfirmEmailTokenRequestBody): Observable<unknown> {
    return this.httpClient.post<unknown>(`${environment.APIEndPoint}${AuthEndpoints.CHECK_CONFIRM_EMAIL_TOKEN}`, body);
  }

  public checkResetPasswordToken(body: CheckResetPasswordTokenRequestBody): Observable<void> {
    return this.httpClient.post<void>(`${environment.APIEndPoint}${AuthEndpoints.CHECK_RESET_PASSWORD_TOKEN}`, body);
  }

  public resetPassword(body: ResetPasswordRequestBody): Observable<void> {
    return this.httpClient.post<void>(`${environment.APIEndPoint}${AuthEndpoints.RESET_PASSWORD}`, body);
  }

  public refreshAccessToken(body: RefreshAccessTokenRequestBody): Observable<Tokens> {
    return this.httpClient.post<Tokens>(`${environment.APIEndPoint}${AuthEndpoints.REFRESH_ACCESS_TOKEN}`, body);
  }

  public confirmEmailSetPassword(body: ConfirmEmailSetPasswordRequestBody): Observable<unknown> {
    return this.httpClient.post<unknown>(`${environment.APIEndPoint}${AuthEndpoints.CONFIRM_EMAIL_SET_PASSWORD}`, body);
  }

  public getSignedInUser(): Observable<UserDTO> {
    return this.httpClient.get<UserDTO>(`${environment.APIEndPoint}${AuthEndpoints.GET_SIGNED_IN_USER}`);
  }

  public updateCurrentUser(request: UpdateUserDetailsRequestBody): Observable<UserDTO> {
    return this.httpClient.put<UserDTO>(`${environment.APIEndPoint}${AuthEndpoints.UPDATE_CURRENT_USER}`, request);
  }
}
