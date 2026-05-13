import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appFileNameTruncate'
})
export class FileNameTruncatePipe implements PipeTransform {
  public transform(value: string, limit: number = 10): string {
    const dotIndex = value.indexOf('.');

    let title = value.slice(0, dotIndex);
    const format = value.slice(dotIndex);

    title = title.substring(0, limit);

    return title + format;
  }
}
