import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { Language } from '../types/enums/language.type';
import { Tokens } from '../types/models/auth/auth.model';

export const AUTH_ACCESS_TOKEN_STORAGE_KEY = 'Proffeo_accessToken';
export const AUTH_REFRESH_TOKEN_STORAGE_KEY = 'Proffeo_refreshToken';
export const ACTIVE_COMPANY_ID_STORAGE_KEY = 'Proffeo_activeCompany';
export const ACTIVE_PROJECT_ID_STORAGE_KEY = 'Proffeo_activeProjectId';
export const LANGUAGE_STORAGE_KEY = 'Proffeo_language';

/**
 * LocalStorageService - Persists session and shell context in `localStorage` and exposes reactive signals.
 *
 * Holds auth tokens, UI language, active company id, and active project id so context survives refresh
 * and aligns with {@link ActiveCompanyService} / {@link ActiveProjectService}.
 *
 * Scope: Global (`providedIn: 'root'`).
 *
 * Usage: {@link AuthService}, {@link authInterceptor}, {@link LanguageService}, and active context services;
 * {@link httpErrorInterceptor} uses {@link LocalStorageService.clearLocalStorage} on auth failure.
 *
 * Architecture:
 * - {@link LocalStorageService}: Keyed persistence (`Proffeo_*` keys) and in-memory mirrors
 * - {@link AuthService}: Tokens and bootstrap user load
 * - {@link ActiveCompanyService} / {@link ActiveProjectService}: Read/write active ids
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private readonly _tokens: WritableSignal<Tokens> = signal(undefined);
  private readonly _language: WritableSignal<Language> = signal(undefined);
  private readonly _activeCompanyId: WritableSignal<string> = signal(undefined);
  private readonly _activeProjectId: WritableSignal<string> = signal(undefined);
  public readonly tokens: Signal<Tokens> = this._tokens.asReadonly();
  public readonly language: Signal<Language> = this._language.asReadonly();
  public readonly activeCompanyId: Signal<string> = this._activeCompanyId.asReadonly();
  public readonly activeProjectId: Signal<string> = this._activeProjectId.asReadonly();

  public constructor() {
    this.loadFromStorage();
  }

  public setActiveProjectId(id: string): void {
    this._activeProjectId.set(id);
    localStorage.setItem(ACTIVE_PROJECT_ID_STORAGE_KEY, id);
  }

  public setActiveCompanyId(id: string): void {
    this._activeCompanyId.set(id);
    localStorage.setItem(ACTIVE_COMPANY_ID_STORAGE_KEY, id);
  }

  public setTokens(data: Tokens): void {
    this._tokens.set(data);
    localStorage.setItem(AUTH_ACCESS_TOKEN_STORAGE_KEY, data.accessToken);
    localStorage.setItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, data.refreshToken);
  }

  public clearLocalStorage(): void {
    this.clearTokens();
    this._activeCompanyId.set(undefined);
    this._activeProjectId.set(undefined);

    localStorage.removeItem(ACTIVE_COMPANY_ID_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_PROJECT_ID_STORAGE_KEY);
  }

  public clearTokens(): void {
    this._tokens.set(undefined);
    localStorage.removeItem(AUTH_ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
  }

  /**
   * Re-reads persisted keys from `localStorage` into in-memory signals (tokens, language, active company/project).
   */
  public loadFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    const accessToken = window.localStorage.getItem(AUTH_ACCESS_TOKEN_STORAGE_KEY);
    const refreshToken = window.localStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
    const language = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const activeCompany = window.localStorage.getItem(ACTIVE_COMPANY_ID_STORAGE_KEY);
    const activeProject = window.localStorage.getItem(ACTIVE_PROJECT_ID_STORAGE_KEY);

    if (language) {
      this._language.set(language as Language);
    }
    if (activeCompany) {
      this._activeCompanyId.set(activeCompany);
    }
    if (activeProject) {
      this._activeProjectId.set(activeProject);
    }
    if (accessToken && refreshToken) {
      this._tokens.set({ accessToken, refreshToken });
    }
  }

  public setLanguage(language: Language): void {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
}
