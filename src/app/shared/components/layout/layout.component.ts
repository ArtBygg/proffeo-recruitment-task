import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  model,
  ModelSignal,
  OnDestroy,
  OnInit,
  signal,
  Signal,
  WritableSignal
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { GlobalLoaderComponent } from '@app/shared/components/global-loader/global-loader.component';
import { LangToggleComponent } from '@app/shared/components/lang-toggle/lang-toggle.component';
import { ActiveCompanyService } from '@app/shared/services/active-company.service';
import { ActiveProjectService } from '@app/shared/services/active-project.service';
import { AuthService } from '@app/shared/services/auth.service';
import { CompaniesDataService } from '@app/shared/services/companies-data.service';
import { ProjectsDataService } from '@app/shared/services/projects-data.service';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { ModalService } from '@app/shared/services/shared/modal.service';
import { UrlSegment } from '@app/shared/types/enums/url-segment.enum';
import { Company } from '@app/shared/types/models/company/company.model';
import { Project } from '@app/shared/types/models/project/project.model';
import { MenuItem } from '@app/shared/types/models/shared/menu-item';
import { User } from '@app/shared/types/models/user/user.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  imports: [
    NgClass,
    CdkScrollable,
    MatIconModule,
    MatSelectModule,
    RouterModule,
    TranslateModule,
    MatMenuModule,
    GlobalLoaderComponent,
    MatTooltip,
    LangToggleComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent implements OnInit, OnDestroy {
  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);
  private readonly companyService: CompaniesDataService = inject(CompaniesDataService);
  private readonly deviceService: DeviceService = inject(DeviceService);
  private readonly projectService: ProjectsDataService = inject(ProjectsDataService);
  private readonly modalService: ModalService = inject(ModalService);
  private readonly activeProjectService: ActiveProjectService = inject(ActiveProjectService);
  private readonly activeCompanyService: ActiveCompanyService = inject(ActiveCompanyService);
  private menuAutocloseTimeout: ReturnType<typeof setTimeout> | null = null;

  protected expanded: WritableSignal<boolean> = signal(!this.deviceService.isMobile());
  protected currentUser: Signal<User> = this.authService.currentUser;
  protected companies: Signal<Company[] | undefined> = computed(() =>
    this.currentUser() === null || this.currentUser() === undefined
      ? undefined
      : this.companyService.getUserCompanies(this.currentUser()?.id)()
  );
  protected projects: Signal<Project[] | undefined> = computed(() =>
    this.activeCompany() === null || this.activeCompany() === undefined
      ? undefined
      : this.projectService.getCompanyProjects(this.activeCompany()?.id)()
  );
  protected activeCompany: Signal<Company | undefined> = this.activeCompanyService.activeCompany;
  protected activeProject: Signal<Project | undefined> = this.activeProjectService.activeProject;
  protected isMobile: Signal<boolean> = this.deviceService.isMobile;

  protected dashboardMenuItems: Signal<MenuItem | undefined> = signal(undefined);
  protected activeProjectMenuItems: Signal<MenuItem | undefined> = computed(() =>
    this.activeProject()?.id ? this.getProjectMenuItems(this.activeProject()!) : undefined
  );
  protected activeCompanyMenuItems: Signal<MenuItem | undefined> = signal(undefined);

  public timerVisible: ModelSignal<boolean> = model(false);

  @HostListener('window:keydown.m', ['$event']) public onKeyDownEvent = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    if (!isInputField) {
      this.toggleMenu();
    }
  };

  public ngOnInit(): void {
    if (this.isMobile()) {
      this.expanded.set(false);
    }
  }

  protected openChangePasswordModal(): void {
    this.modalService.openChangePasswordModal();
  }

  protected handleNavigationClick(): void {
    if (this.isMobile()) {
      this.expanded.set(false);
    }
  }

  protected compareCompanies = (c1: Company, c2: Company): boolean => {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  };

  protected compareProjects = (p1: Project, p2: Project): boolean => {
    return p1 && p2 ? p1.id === p2.id : p1 === p2;
  };

  protected onCompanySelected(company: Company): void {
    if (this.isMobile()) {
      this.expanded.set(false);
    }
    this.activeCompanyService.setActiveCompany(company);
  }

  protected onProjectSelected(project: Project): void {
    if (this.isMobile()) {
      this.expanded.set(false);
    }
    this.activeProjectService.setActiveProject(project);
  }

  protected isMenuItemActive(link: string): boolean {
    return this.router.isActive(link, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  protected getProjectMenuItems(project?: Project): MenuItem | undefined {
    if (!project) {
      return undefined;
    }

    return new MenuItem({
      id: 'project',
      type: 'group',
      titleTranslationKey: 'menu-section-project',
      exactMatch: true,
      children: [
        new MenuItem({
          id: 'tasks-list',
          type: 'basic',
          icon: 'task',
          link: `${UrlSegment.COMPANIES}/${this.activeCompany()?.id}/${UrlSegment.PROJECTS}/${project.id}/${UrlSegment.TASKS}`,
          titleTranslationKey: 'menu-item-title-tasks',
          subtitleTranslationKey: 'menu-item-subtitle-project-task-list',
          exactMatch: true
        })
      ]
    });
  }

  protected toggleMenu(): void {
    this.expanded.set(!this.expanded());
  }

  public ngOnDestroy(): void {
    clearTimeout(this.menuAutocloseTimeout);
  }

  protected turnOffMenuAutoclose(): void {
    clearTimeout(this.menuAutocloseTimeout);
    this.expanded.set(true);
  }

  protected triggerMenuAutoclose(): void {
    this.menuAutocloseTimeout = setTimeout(() => {
      this.expanded.set(false);
      this.menuAutocloseTimeout = null;
    }, 2000);
  }
}
