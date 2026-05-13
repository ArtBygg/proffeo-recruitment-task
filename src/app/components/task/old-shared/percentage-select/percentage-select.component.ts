import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  Input,
  input,
  InputSignal,
  output,
  ViewChild
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PercentageSliderPickerValueDirective } from '@app/shared/directives/percentage-slider-picker-value.directive';
import { disableScroll, enableScroll } from '@app/shared/utils/scroll-utils';
import { PercentageSliderPickerComponent } from './percentage-slider-picker/percentage-slider-picker.component';

export enum PercentageSelectMode {
  FULL = 'full',
  COMPACT = 'compact'
}

export enum PercentageDisplayMode {
  ICON_WITH_TEXT = 'icon-with-text',
  PROGRESS_BAR = 'progress-bar',
  MINIMAL_BAR = 'minimal-bar'
}

@Component({
  selector: 'proffeo-percentage-select',
  templateUrl: './percentage-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatMenuModule, PercentageSliderPickerComponent, NgTemplateOutlet, MatIconModule]
})
export class PercentageSelectComponent implements AfterViewInit {
  @ContentChild(PercentageSliderPickerValueDirective)
  protected percentageSliderPickerValueTpl: PercentageSliderPickerValueDirective;

  @ViewChild('percentageBar') public percentageBar?: ElementRef;

  private _value: number = 0;

  protected readonly percentageSelectMode: typeof PercentageSelectMode = PercentageSelectMode;
  protected readonly percentageDisplayMode: typeof PercentageDisplayMode = PercentageDisplayMode;
  protected readonly disableScroll: () => void = disableScroll;
  protected readonly enableScroll: () => void = enableScroll;

  public readonly newPercentageValue = output<number>();

  public min: InputSignal<number> = input<number>();
  public max: InputSignal<number> = input<number>();
  public step: InputSignal<number> = input<number>(5);
  public showLabel: InputSignal<boolean> = input<boolean>(true);
  public showSliderValue: InputSignal<boolean> = input<boolean>(true);
  public mode: InputSignal<PercentageSelectMode> = input<PercentageSelectMode>(PercentageSelectMode.FULL);
  public isReadonly: InputSignal<boolean> = input<boolean>(false);
  public minimalMode: InputSignal<boolean> = input<boolean>(false);

  public displayMode: InputSignal<PercentageDisplayMode> = input<PercentageDisplayMode>(
    PercentageDisplayMode.MINIMAL_BAR
  );
  public iconType: InputSignal<string> = input<string>('clock_loader_60');
  public progressBarWidth: InputSignal<string> = input<string>('140px');
  public progressBarHeight: InputSignal<string> = input<string>('18px');

  public get value(): number {
    return this._value;
  }

  @Input() public set value(value: number) {
    this._value = value;
    this.setHeightAndColorToPercentageBar();
  }

  public ngAfterViewInit(): void {
    this.setHeightAndColorToPercentageBar();
  }

  protected onValueChange(value: number): void {
    if (this.isReadonly()) {
      return;
    }
    this.newPercentageValue.emit(value);
    this.value = value;
    this.setHeightAndColorToPercentageBar();
  }

  protected setHeightAndColorToPercentageBar(): void {
    if (this.percentageBar == undefined) return;

    const nativeElement: HTMLDivElement = this.percentageBar.nativeElement;

    if (this.value <= 33) {
      nativeElement.style.backgroundColor = '#7B7B7B';
    }

    if (this.value > 33 && this.value <= 66) {
      nativeElement.style.backgroundColor = '#EC690E';
    }

    if (this.value > 66 && this.value <= 100) {
      nativeElement.style.backgroundColor = '#7DB64F';
    }

    nativeElement.style.minHeight = this.value + '%';
  }
}
