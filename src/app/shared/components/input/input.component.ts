import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { AbstractSharedComponentBase } from '@app/shared/types/models/shared/abstract-shared-component-base';
import { provideValueAccessorForSharedHelper } from '@app/shared/utils/provide-value-accessor-for-shared.helper';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'proffeo-input',
  templateUrl: './input.component.html',
  imports: [FormsModule, MatIconModule, NgClass, MatAutocompleteModule],
  providers: [provideValueAccessorForSharedHelper(InputComponent)]
})
export class InputComponent<T> extends AbstractSharedComponentBase<T> implements AfterViewInit {
  @ViewChild('input') private readonly element: ElementRef<HTMLInputElement>;
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  protected readonly isDisabledFinal = computed(() => this.disabled() || this.isDisabled());

  public readonly focusLost = output<void>();
  public readonly matIconTwClasses = input<string>('text-font-500 text-[20px] min-w-[20px] max-w-[20px]');
  public readonly inputTwClasses = input<string>('pl-2 pr-2 py-2 h-full border border-slate-200 w-full ');
  public readonly roundedTwClass = input<string>('rounded-md');
  public readonly ngContentTwClasses = input<string>('max-w-1/3 min-w-1/3');
  public readonly placeholder = input<string>('');
  public readonly matIconName = input<string | undefined>(undefined);
  public readonly type = input<'text' | 'password' | 'email' | 'number' | 'tel' | 'file' | 'color'>('text');
  public readonly matAutocomplete = input<MatAutocomplete | undefined>(undefined);
  public readonly debounceDelay = input<number | undefined>(undefined);
  public readonly enableNgContent = input<boolean>(false);
  public readonly invalid = input<boolean>(false);
  public readonly readonly = input<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly valueInput = input<T | undefined>(undefined, { alias: 'value' });
  public readonly valueChange = output<T>();
  public readonly inputChangeWithDebounce = output<string>();

  public constructor() {
    super();
    effect(() => {
      this._value = this.valueInput();
    });
  }

  public ngAfterViewInit(): void {
    const eventType = this.type() !== 'color' ? 'keyup' : 'input';
    const debounce = this.type() !== 'color' ? (this.debounceDelay() ?? 200) : (this.debounceDelay() ?? 0);

    fromEvent(this.element.nativeElement, eventType)
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(debounce))
      .subscribe((event: Event) => {
        const newValue = (event.target as HTMLInputElement)?.value;
        this.valueChange.emit(newValue as T);
        if (this.debounceDelay()) {
          this.inputChangeWithDebounce.emit(newValue as string);
        }
        this.internalValue = newValue as T;
      });
  }
}
