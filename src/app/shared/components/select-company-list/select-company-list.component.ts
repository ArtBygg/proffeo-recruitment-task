import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  ModelSignal,
  OnInit,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { Company } from '@app/shared/types/models/company/company.model';
import { RadioComponent } from '@app/shared/components/radio/radio.component';
import { InputComponent } from '@app/shared/components/input/input.component';

@Component({
  selector: 'proffeo-select-company-list',
  standalone: true,
  imports: [
    TranslateModule,
    MatIconModule,
    ReactiveFormsModule,
    RadioComponent,
    InputComponent,
    NgClass,
  ],
  templateUrl: './select-company-list.component.html',
})
export class SelectCompanyListComponent implements OnInit {
  readonly companies = input.required<Signal<Company[]>>();
  readonly preselectedCompanyId = input<string | undefined>(undefined);

  selectedCompanyId: ModelSignal<string | undefined> = model<string | undefined>();

  protected readonly searchControl = new FormControl<string>('', { nonNullable: true });
  protected filteredCompanies: WritableSignal<Company[]> = signal([]);

  private readonly destroyRef = inject(DestroyRef);

  private readonly companiesList = computed(() => {
    const sig = this.companies();
    return sig ? sig() : [];
  });

  constructor() {
    effect(() => {
      const list = this.companiesList();
      const search = this.searchControl.value.toLowerCase().trim();
      this.filteredCompanies.set(
        search
          ? list.filter((c) => (c.name ?? '').toLowerCase().includes(search))
          : list,
      );
      const preselected = this.preselectedCompanyId();
      if (preselected !== undefined && this.selectedCompanyId() === undefined) {
        this.selectedCompanyId.set(preselected);
      }
    });
  }

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      const search = value.toLowerCase().trim();
      const list = this.companiesList();
      this.filteredCompanies.set(
        search
          ? list.filter((c) => (c.name ?? '').toLowerCase().includes(search))
          : list,
      );
    });
  }

  protected selectCompany(company: Company): void {
    this.selectedCompanyId.set(company.id);
  }
}
