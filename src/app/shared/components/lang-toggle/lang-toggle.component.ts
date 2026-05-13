import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input, InputSignal, Signal, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { LanguageService } from '@app/shared/services/shared/language.service';
import { Language } from '@app/shared/types/enums/language.type';
import { AvailableLanguagesOptions } from '@app/shared/types/models/shared/available-languages-options';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-lang-toggle',
  templateUrl: './lang-toggle.component.html',
  imports: [ReactiveFormsModule, TranslateModule, MatListModule, MatButtonModule, MatMenuModule, NgOptimizedImage]
})
export class LangToggleComponent {
  private readonly languageService: LanguageService = inject(LanguageService);
  private readonly languageMenuTrigger: Signal<MatMenuTrigger> = viewChild('languageMenuTrigger');

  protected readonly AvailableLanguagesOptions = AvailableLanguagesOptions;
  protected readonly currentLanguageLabel: Signal<string> = this.languageService.currentLanguageLabel;
  protected readonly currentLanguageFlag: Signal<string> = this.languageService.currentLanguageFlag;

  public readonly expanded: InputSignal<boolean> = input<boolean>(false);

  protected onSelectLanguage(language: Language): void {
    this.languageService.setLanguage(language);
  }

  protected closeMenuAndStopPropagation($event: PointerEvent): void {
    this.languageMenuTrigger().closeMenu();
    $event.stopPropagation();
  }

  public openMenu($event: PointerEvent): void {
    this.languageMenuTrigger().openMenu();
    $event.stopPropagation();
  }
}
