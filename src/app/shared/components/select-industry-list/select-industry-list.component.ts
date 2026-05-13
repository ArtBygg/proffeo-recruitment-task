import { NgClass } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  InputSignal,
  linkedSignal,
  model,
  ModelSignal,
  OnInit,
  Signal,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { InputComponent } from '@app/shared/components/input/input.component';
import { RadioComponent } from '@app/shared/components/radio/radio.component';
import { SelectMode } from '@app/shared/types/enums/select-mode.enum';
import { Industry } from '@app/shared/types/models/industry/industry.model';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxComponent } from '../checkbox/checkbox.component';

@Component({
  selector: 'proffeo-select-industry-list',
  imports: [
    TranslateModule,
    MatIconModule,
    ReactiveFormsModule,
    RadioComponent,
    InputComponent,
    NgClass,
    CheckboxComponent,
    MatCheckbox
  ],
  templateUrl: './select-industry-list.component.html'
})
export class SelectIndustryListComponent implements OnInit {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  protected readonly searchControl: FormControl<string> = new FormControl('');
  protected readonly SelectMode = SelectMode;
  protected readonly filteredIndustries: WritableSignal<Industry[]> = linkedSignal(() => this.industries()); //TODO: można to zamienić na computed i pozbyć się obserwowania zmian na inpucie
  protected readonly isAllIndustriesSelected: Signal<boolean> = computed(() => {
    return this.industries().length === this.selectedIndustries().length;
  });
  protected readonly industriesControls: Map<string, FormControl> = new Map();

  public readonly selectMode: InputSignal<SelectMode> = input<SelectMode>(SelectMode.SINGLE);
  public readonly industries: InputSignal<Industry[]> = input.required<Industry[]>();
  public readonly selectedIndustries: ModelSignal<Industry[]> = model<Industry[]>([]);

  public ngOnInit(): void {
    this.handleSearchControl();

    this.industries()?.forEach((industry: Industry) => {
      const isSelected: boolean = this.selectedIndustries()?.includes(industry);
      this.industriesControls.set(industry.id, new FormControl(isSelected));
    });
  }

  protected selectIndustry(isSelected: boolean, industry: Industry): void {
    const currentSelected = this.selectedIndustries();

    if (this.selectMode() === 'single') {
      if (isSelected) {
        this.selectedIndustries.set([industry]);
        // remove all checks
        this.industriesControls.forEach((control, industryId) => {
          if (industryId !== industry.id) {
            control.setValue(false, { emitEvent: false });
          }
        });
      } else {
        this.selectedIndustries.set([]);
      }
    } else {
      if (isSelected) {
        this.selectedIndustries.set([...currentSelected, industry]);
      } else {
        this.selectedIndustries.set(currentSelected.filter(ind => ind.id !== industry.id));
      }
    }
  }

  protected toggleAllIndustries(event: MatCheckboxChange): void {
    this.industries()?.forEach((industry: Industry) => {
      this.industriesControls.set(industry.id, new FormControl(event.checked));
    });
    this.selectedIndustries.set(event.checked ? this.industries() : []);
  }

  private handleSearchControl(): void {
    this.searchControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (value: string): void => {
        const searchValue: string = value.toLowerCase();
        if (value) {
          this.filteredIndustries.set(
            this.industries().filter((user: Industry) => user.name.toLowerCase().includes(searchValue))
          );
        } else {
          this.filteredIndustries.set(this.industries());
        }
      }
    });
  }
}
