import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByOrderNo'
})
export class SortByOrderNoPipe implements PipeTransform {
  public transform(value: { orderNo?: number }[]): { orderNo?: number }[] {
    return value.sort((a, b) => {
      if (a.orderNo === undefined && b.orderNo === undefined) {
        return 0;
      }
      if (a.orderNo === undefined) {
        return 1;
      }
      if (b.orderNo === undefined) {
        return -1;
      }
      return a.orderNo - b.orderNo;
    });
  }
}
