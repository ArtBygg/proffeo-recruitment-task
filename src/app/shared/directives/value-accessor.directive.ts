import { Directive, forwardRef, HostListener, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

@Directive({
  selector: '[artbyggValueAccessor]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ValueAccessorDirective),
      multi: true
    }
  ]
})
export class ValueAccessorDirective<T> implements ControlValueAccessor, OnDestroy {
  private readonly _valueSubject: BehaviorSubject<T | null> = new BehaviorSubject<T | null>(null);
  private readonly _disabledSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly _value$: Observable<T | null> = this._valueSubject.asObservable();
  private readonly _disabled$: Observable<boolean> = this._disabledSubject.asObservable();

  public get value$(): Observable<T | null> {
    return this._value$;
  }

  public get disabled$(): Observable<boolean> {
    return this._disabled$;
  }

  public get currentValue(): T | null {
    return this._valueSubject.getValue();
  }

  @HostListener('focusout')
  public onBlur(): void {
    this.onTouched();
  }

  public markAsTouched(): void {
    this.onTouched();
  }

  public ngOnDestroy(): void {
    this._valueSubject.complete();
    this._disabledSubject.complete();
  }

  public valueChange(value: T): void {
    this.onChange(value);
    this._valueSubject.next(value);
  }

  public writeValue(value: T): void {
    this._valueSubject.next(value);
  }

  public registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._disabledSubject.next(isDisabled);
  }

  private onChange: (input: T) => void = () => {
    /*Empty*/
  };

  private onTouched: () => void = () => {
    /*Empty*/
  };
}
