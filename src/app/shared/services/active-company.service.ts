import { computed, effect, inject, Injectable, linkedSignal, Signal, signal, WritableSignal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LookupType } from '@app/shared/services/dtos/dictionary.dto';
import { UrlSegment as ProffeoUrlSegment } from '@app/shared/types/enums/url-segment.enum';
import { Company } from '@app/shared/types/models/company/company.model';
import { parseShellCompanyId } from '@app/shared/utils/shell-route-url.util';
import { filter } from 'rxjs';
import { AuthService } from './auth.service';
import { CompaniesDataService } from './companies-data.service';
import { LocalStorageService } from './local-storage.service';

/**
 * ActiveCompanyService - Application-wide active company context (single source of truth).
 *
 * Resolves the current {@link Company} from {@link CompaniesDataService} using the company id from the URL when the
 * user is signed in (takes precedence), otherwise the id from {@link LocalStorageService}, so deep links override
 * persisted shell context.
 *
 * Usage: Layout and features that need the company selected in the shell (not transient UI picks like dropdown rows).
 *
 * Architecture:
 * - {@link ActiveCompanyService}: Active company resolution, `activeCompanyId` persistence, OSH dictionary preload
 * - {@link CompaniesDataService}: Company store and user company lists
 * - {@link LocalStorageService}: `activeCompanyId` read/write across refresh
 */
@Injectable({ providedIn: 'root' })
export class ActiveCompanyService {
  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);
  private readonly companiesDataService: CompaniesDataService = inject(CompaniesDataService);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);

  private readonly shellUrl = signal(this.router.url);

  private readonly _activeCompany: WritableSignal<Company | undefined> = linkedSignal(() => {
    const user = this.authService.currentUser();
    const companyIdFromUrl = user ? parseShellCompanyId(this.shellUrl()) : null;
    const candidateId = companyIdFromUrl ?? this.localStorageService.activeCompanyId();
    if (!candidateId) {
      return undefined;
    }
    return this.companiesDataService.getById(candidateId)();
  });

  public readonly activeCompany: Signal<Company | undefined> = this._activeCompany.asReadonly();
  public readonly activeCompanyId: Signal<string | undefined> = computed(() => this.activeCompany()?.id);

  public constructor() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.shellUrl.set(this.router.url);
    });

    effect(() => {
      const companyId = this.activeCompanyId();
      if (!companyId) {
        return;
      }
      this.localStorageService.setActiveCompanyId(companyId);
    });
  }

  public setActiveCompany(company: Company | undefined): void {
    if (!company) {
      return;
    }
    this._activeCompany.set(company);
    this.navigateToCompany(company.id);
    this.localStorageService.setActiveProjectId(undefined);
  }

  private navigateToCompany(companyId: string): void {
    const newUrl = [
      '/',
      ProffeoUrlSegment.COMPANIES,
      companyId,
      ProffeoUrlSegment.PROJECTS_LIST,
      ProffeoUrlSegment.ACTIVE
    ];
    const currentQuery = this.router.parseUrl(this.router.url).queryParams;
    const tree = this.router.createUrlTree(newUrl, { queryParams: currentQuery });
    void this.router.navigateByUrl(tree, { replaceUrl: true });
  }
}
