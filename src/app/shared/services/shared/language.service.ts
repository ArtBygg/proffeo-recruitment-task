import { DestroyRef, effect, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Language } from '@app/shared/types/enums/language.type';
import { AvailableLanguagesOptions } from '@app/shared/types/models/shared/available-languages-options';
import { DropdownItem } from '@app/shared/types/models/shared/dropdown-item';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '../local-storage.service';

/**
 * LanguageService - ngx-translate current language and persisted preference.
 *
 * Initializes from {@link LocalStorageService.language} (key `Proffeo_language`) and writes back on change via
 * {@link LocalStorageService.setLanguage}.
 *
 * Scope: Global (`providedIn: 'root'`).
 *
 * Usage: Language switcher in the shell and any code that reads flag/label signals for the active locale.
 *
 * Architecture:
 * - {@link LanguageService}: TranslateService wiring and UI-facing signals
 * - {@link LocalStorageService}: Persisted language code
 */
@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly _currentLanguage: WritableSignal<Language> = signal(Language.EN);
  private readonly _currentLanguageFlag: WritableSignal<string> = signal('');
  private readonly _currentLanguageLabel: WritableSignal<string> = signal('');
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);

  public constructor() {
    effect(() => {
      const currentLang: Language = this._currentLanguage();
      const langOption = AvailableLanguagesOptions.find((item: DropdownItem<string>) => item.value === currentLang);
      this._currentLanguageFlag.set(langOption?.iconName ?? 'US');
      this._currentLanguageLabel.set(langOption?.label ?? 'EN');
      this.localStorageService.setLanguage(currentLang);
      this.translateService.use(currentLang).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    });

    this._currentLanguage.set(this.localStorageService.language() || Language.EN);
  }

  public get currentLanguageFlag(): Signal<string> {
    return this._currentLanguageFlag;
  }
  public get currentLanguageLabel(): Signal<string> {
    return this._currentLanguageLabel;
  }

  public setLanguage(lang: Language): void {
    if (lang) {
      this._currentLanguage.set(lang);
    }
  }
}
