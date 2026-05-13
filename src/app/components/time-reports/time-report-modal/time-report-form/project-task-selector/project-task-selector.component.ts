import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
  Signal,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { DropdownComponent } from '@app/shared/components/dropdown/dropdown.component';
import { AuthService } from '@app/shared/services/auth.service';
import { CompaniesDataService } from '@app/shared/services/companies-data.service';
import { LocationsDataService } from '@app/shared/services/locations-data.service';
import { ProjectsDataService } from '@app/shared/services/projects-data.service';
import { ModalService } from '@app/shared/services/shared/modal.service';
import { TasksDataService } from '@app/shared/services/tasks-data.service';
import { SortDirection } from '@app/shared/types/enums/sort-direction.enum';
import { TaskSortField } from '@app/shared/types/enums/task-sort-field';
import { Location, SelectSingleLocationModalData } from '@app/shared/types/models/location/location.model';
import { DropdownItem } from '@app/shared/types/models/shared/dropdown-item';
import { DropdownWithSearchComponent } from '@app/shared/components/dropdown-with-search/dropdown-with-search.component';
import { TranslateModule } from '@ngx-translate/core';

export interface ProjectTaskSelection {
  companyId: string | null;
  projectId: string | null;
  taskId: string | null;
  locationId: string | null;
}

export interface ProjectTaskPreselection {
  companyId?: string;
  companyName?: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
  locationId?: string;
}

@Component({
  selector: 'proffeo-project-task-selector',
  templateUrl: './project-task-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatError,
    TranslateModule,
    DropdownComponent,
    DropdownWithSearchComponent
  ]
})
export class ProjectTaskSelectorComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly modalService = inject(ModalService);
  private readonly authService = inject(AuthService);
  private readonly companiesService = inject(CompaniesDataService);
  private readonly projectsService = inject(ProjectsDataService);
  private readonly tasksService = inject(TasksDataService);
  private readonly locationsService = inject(LocationsDataService);
  private selectedCompanyId: WritableSignal<string | null> = signal(null);
  private selectedProjectId: WritableSignal<string | null> = signal(null);
  private pendingLocationId: WritableSignal<string | null> = signal(null);

  protected companyControl = new FormControl<string | null>(null, Validators.required);
  protected projectControl = new FormControl<string | null>({ value: null, disabled: true }, Validators.required);
  protected taskControl = new FormControl<string | null>({ value: null, disabled: true }, Validators.required);
  protected locationControl = new FormControl<string | null>(null);
  protected selectedLocation: WritableSignal<Location | null> = signal(null);
  protected companyItems: Signal<DropdownItem<string>[]> = computed(() => {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return [];

    const companies = this.companiesService.getUserCompanies(userId)();
    return (companies ?? []).map(c => ({ value: c.id, label: c.name }));
  });

  protected projectItems: Signal<DropdownItem<string>[]> = computed(() => {
    const companyId = this.selectedCompanyId();
    if (!companyId) return [];

    const projects = this.projectsService.getCompanyProjects(companyId)();
    return (projects ?? []).map(p => ({ value: p.id, label: p.name }));
  });

  protected taskItems: Signal<DropdownItem<string>[]> = computed(() => {
    const projectId = this.selectedProjectId();
    if (!projectId) return [];

    const tasksPage = this.tasksService.getProjectTasks(
      projectId,
      0,
      1000,
      TaskSortField.LastActivityAt,
      SortDirection.ASC,
      undefined,
      undefined
    )();

    if (!tasksPage?.content) return [];

    return tasksPage.content
      .map(sig => sig())
      .filter(Boolean)
      .map(t => ({ value: t.id, label: t.name }));
  });

  protected locationItems: Signal<Location[]> = computed(() => {
    const projectId = this.selectedProjectId();
    if (!projectId) return [];

    const locations = this.locationsService.getProjectLocations(projectId)();
    return (locations ?? []).filter(loc => !loc.readOnly);
  });

  protected hasLocations: Signal<boolean> = computed(() => {
    return this.locationItems().length > 0;
  });

  protected tasksLoading: Signal<boolean> = computed(() => {
    const projectId = this.selectedProjectId();
    if (!projectId) return false;

    const tasksPage = this.tasksService.getProjectTasks(
      projectId,
      0,
      1000,
      TaskSortField.LastActivityAt,
      SortDirection.ASC,
      undefined,
      undefined
    )();

    return tasksPage === undefined;
  });

  protected showLocationPicker: Signal<boolean> = computed(() => {
    const projectId = this.selectedProjectId();
    return !!projectId && this.hasLocations();
  });

  protected selectedLocationDisplay: Signal<string> = computed(() => {
    const location = this.selectedLocation();
    if (!location) return '';

    const path = location.locationsPath;
    return path.map(loc => loc.name).join(' / ');
  });

  public readonly readonly = input<boolean>(false);
  public readonly preselection = input<ProjectTaskPreselection>({});
  public readonly selectionChange = output<ProjectTaskSelection>();

  public constructor() {
    this.setupLocationAutoselect();
  }

  protected get preselectedCompanyName(): string {
    return this.preselection()?.companyName ?? '';
  }

  protected get preselectedProjectName(): string {
    return this.preselection()?.projectName ?? '';
  }

  protected get preselectedTaskName(): string {
    return this.preselection()?.taskName ?? '';
  }

  private setupLocationAutoselect(): void {
    effect(() => {
      const pendingId = this.pendingLocationId();
      const projectId = this.selectedProjectId();

      if (!pendingId || !projectId) return;

      const projectLocations = this.locationsService.getProjectLocations(projectId)();
      if (!projectLocations || projectLocations.length === 0) {
        return;
      }

      const location = this.locationsService.getById(pendingId)();

      if (location) {
        this.selectedLocation.set(location);
        this.locationControl.setValue(pendingId, { emitEvent: false });
        this.pendingLocationId.set(null);
      }
    });
  }

  public ngOnInit(): void {
    this.loadInitialData();
    this.applyPreselection();
    this.setupFormSubscriptions();
  }

  private loadInitialData(): void {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.companiesService.loadUserCompanies(userId);
    }

    const pre = this.preselection();
    if (pre?.companyId) {
      this.projectsService.loadCompanyProjects(pre.companyId);
    }
    if (pre?.projectId) {
      this.locationsService.loadProjectLocations(pre.projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  private applyPreselection(): void {
    const pre = this.preselection();
    if (!pre) return;

    if (pre.companyId) {
      this.companyControl.setValue(pre.companyId, { emitEvent: false });
      this.selectedCompanyId.set(pre.companyId);
      this.projectControl.enable({ emitEvent: false });
    }

    if (pre.projectId) {
      this.projectControl.setValue(pre.projectId, { emitEvent: false });
      this.selectedProjectId.set(pre.projectId);
      this.taskControl.enable({ emitEvent: false });
    }

    if (pre.taskId) {
      this.taskControl.setValue(pre.taskId, { emitEvent: false });
    }

    if (pre.locationId) {
      // location may not be loaded yet, so we set it as pending
      this.pendingLocationId.set(pre.locationId);
    }

    this.emitSelection();
  }

  private setupFormSubscriptions(): void {
    this.companyControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(companyId => {
      this.selectedCompanyId.set(companyId);
      this.selectedProjectId.set(null);

      this.projectControl.setValue(null, { emitEvent: false });
      this.taskControl.setValue(null, { emitEvent: false });
      this.locationControl.setValue(null, { emitEvent: false });

      if (companyId) {
        this.projectControl.enable({ emitEvent: false });
        this.projectsService.loadCompanyProjects(companyId);
      } else {
        this.projectControl.disable({ emitEvent: false });
      }
      this.taskControl.disable({ emitEvent: false });

      this.emitSelection();
    });

    this.projectControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(projectId => {
      this.selectedProjectId.set(projectId);

      this.taskControl.setValue(null, { emitEvent: false });
      this.locationControl.setValue(null, { emitEvent: false });

      if (projectId) {
        this.taskControl.enable({ emitEvent: false });
        this.locationsService.loadProjectLocations(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      } else {
        this.taskControl.disable({ emitEvent: false });
      }

      this.emitSelection();
    });

    this.taskControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.locationControl.setValue(null, { emitEvent: false });
      this.emitSelection();
    });

    this.locationControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.emitSelection();
    });
  }

  private emitSelection(): void {
    this.selectionChange.emit({
      companyId: this.companyControl.value,
      projectId: this.projectControl.value,
      taskId: this.taskControl.value,
      locationId: this.locationControl.value
    });
  }

  public getSelection(): ProjectTaskSelection {
    return {
      companyId: this.companyControl.value,
      projectId: this.projectControl.value,
      taskId: this.taskControl.value,
      locationId: this.locationControl.value
    };
  }

  public isValid(): boolean {
    return this.companyControl.valid && this.projectControl.valid && this.taskControl.valid;
  }

  public markAllAsTouched(): void {
    this.companyControl.markAsTouched();
    this.projectControl.markAsTouched();
    this.taskControl.markAsTouched();
    this.locationControl.markAsTouched();
  }

  protected openLocationModal(): void {
    const projectId = this.selectedProjectId();
    if (!projectId) return;

    const data: SelectSingleLocationModalData = {
      locations: this.locationItems(),
      projectId: projectId,
      selectedLocation: this.selectedLocation() ?? undefined,
      isReadonly: false,
      showEditButton: false,
      isEmptyOptionEnabled: true,
      title: 'select-location'
    };

    this.modalService
      .openSelectSingleLocationModal(data)
      .afterClosed()
      .subscribe((result: Location | undefined) => {
        if (result !== undefined) {
          this.selectedLocation.set(result ?? null);
          this.locationControl.setValue(result?.id ?? null);
          this.emitSelection();
        }
      });
  }

  protected clearLocation(): void {
    this.selectedLocation.set(null);
    this.locationControl.setValue(null);
    this.emitSelection();
  }
}
