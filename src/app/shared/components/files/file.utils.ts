import { FileInfo } from '@app/shared/types/models/files/file-info';

export function isFileViewable(file: FileInfo): boolean {
  return file.isImage() || file.isPdf() || file.isVideo();
}
