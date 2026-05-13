import { Pipe, PipeTransform } from '@angular/core';

/**
 * ShortNumber pipe transform value to properly short formatted number.
 *
 * @export
 * @class ShortNumberPipe
 * @implements {PipeTransform}
 */
@Pipe({
  name: 'appShortNumber'
})
export class ShortNumberPipe implements PipeTransform {
  /**
   * Pipe transform method
   *
   * @param value number
   * @returns
   * @memberof ShortNumberPipe
   */

  public transform(value: number | number[] | null | undefined): string | string[] | null {
    if (value == null) return '-';

    return Array.isArray(value) ? value.map(this.shortingNumber) : this.shortingNumber(value);
  }

  private shortingNumber(value: number): string {
    if (isNaN(value)) {
      return '-';
    }
    if (value === null) {
      return '-';
    }
    if (value === 0) {
      return String(value);
    }

    let abs = Math.abs(value);
    const rounder = Math.pow(10, 2);
    const isNegative = value < 0;
    let key = '';

    const shortcuts = [
      { key: 'P', value: Math.pow(10, 15) },
      { key: 'T', value: Math.pow(10, 12) },
      { key: 'G', value: Math.pow(10, 9) },
      { key: 'M', value: Math.pow(10, 6) },
      { key: 'k', value: 1000 }
    ];

    for (const shortcut of shortcuts) {
      let reduced = abs / shortcut.value;
      reduced = Math.round(reduced * rounder) / rounder;

      if (reduced >= 1) {
        abs = reduced;
        key = shortcut.key;
        break;
      }
    }

    return (isNegative ? '-' : '') + Math.round(abs * 100) / 100 + key;
  }
}
