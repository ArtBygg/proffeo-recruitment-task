import { ChangeDetectorRef, inject, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

export abstract class AbstractSharedComponentBase<T> implements ControlValueAccessor {
  protected isDisabled = signal(false);
  protected cdr = inject(ChangeDetectorRef);
  public _value?: T;

  public get internalValue(): T {
    return this._value as T;
  }

  public set internalValue(val: T) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
    this.emitValue(val);
  }

  public writeValue(value: T | null): void {
    this._value = value as T;
    this.cdr.markForCheck();
  }

  public registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
    this.cdr.markForCheck();
  }

  protected emitValue(val: T): void {
    void val;
  }
  private onChange: (value: T) => void = () => {};
  private onTouched: () => void = () => {};
}
