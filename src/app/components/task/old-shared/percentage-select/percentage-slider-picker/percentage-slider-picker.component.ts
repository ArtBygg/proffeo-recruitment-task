import { Component, Input, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';

@Component({
  selector: 'proffeo-percentage-slider-picker',
  templateUrl: './percentage-slider-picker.component.html',
  imports: [MatSlider, FormsModule, MatSliderThumb]
})
export class PercentageSliderPickerComponent {
  private _value: number = 0;

  public readonly min = input<number>(0);
  public readonly max = input<number>(100);
  public readonly step = input<number>(1);
  public readonly showLabel = input<boolean>(false);
  public readonly showSliderValue = input<boolean>(true);
  public readonly newValue = output<number>();

  public get value(): number {
    return this._value;
  }

  @Input()
  public set value(newValue: number) {
    this._value = newValue;
  }

  protected onChange(): void {
    this.newValue.emit(this._value);
  }
}
