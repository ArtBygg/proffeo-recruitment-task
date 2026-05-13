import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'as'
})
export class AsPipe implements PipeTransform {
  public transform<T>(value: unknown, type?: (new (...args: never[]) => T) | T): T {
    void type;
    return value as T;
  }
}
