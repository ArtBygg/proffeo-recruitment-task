import { FileBase } from '@app/shared/types/models/files/file-base';

export function sortArray<T extends FileBase>(filesArray: T[]): T[] {
  return filesArray.sort((a, b) => {
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
