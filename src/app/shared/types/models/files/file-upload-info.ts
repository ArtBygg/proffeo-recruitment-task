import { UploadStatus } from '../../enums/file-enums';

export class FileUploadInfo {
  public id: string | undefined;
  public fileName: string | undefined;
  public progress: number | undefined;
  public error: string | undefined;
  public status: UploadStatus | undefined;
  public fileIds: string[] | undefined;

  public constructor(value: Partial<FileUploadInfo>) {
    Object.assign(this, value);
  }
}
