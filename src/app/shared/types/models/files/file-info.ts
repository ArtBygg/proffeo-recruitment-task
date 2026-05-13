import { Signal } from '@angular/core';
import { FileBase } from '@app/shared/types/models/files/file-base';
import { User } from '@app/shared/types/models/user/user.model';
import { environment } from '@env/environment';

export class FileInfo extends FileBase {
  public createdAt: Date | undefined;
  public createdBy: Signal<User> | undefined;
  public description?: string | undefined;
  public fileShortId: string | undefined;
  public id: string | undefined;
  public name: string | undefined;
  public size: number | undefined;

  public constructor(value: Partial<FileInfo>) {
    super();
    Object.assign(this, value);
  }

  public fullviewUrl(): string | undefined {
    if (!this.id || this.createdAt === undefined) {
      return undefined;
    }

    const year = new Date(this.createdAt)?.getFullYear()?.toString();
    const month = (new Date(this.createdAt)?.getMonth() + 1)?.toString()?.padStart(2, '0');

    if (this.isImage()) {
      return `${environment.ServerUrl}images/${year}/${month}/${this.fileShortId.toLowerCase()}_1280_720.jpg`;
    } else {
      return `${environment.ServerUrl}attachments/${year}/${month}/${this.fileShortId.toLowerCase()}.${this.getExtension(
        this.name
      )}`;
    }
  }

  public previewUrl(): string | undefined {
    if (!this.id || this.createdAt === undefined) {
      return undefined;
    }

    const year = new Date(this.createdAt)?.getFullYear()?.toString();
    const month = (new Date(this.createdAt)?.getMonth() + 1)?.toString()?.padStart(2, '0');

    if (this.isImage()) {
      return `${environment.ServerUrl}images/${year}/${month}/${this.fileShortId.toLowerCase()}_150_150.jpg`;
    } else {
      return `${environment.ServerUrl}attachments/${year}/${month}/${this.fileShortId.toLowerCase()}.${this.getExtension(
        this.name
      )}`;
    }
  }

  private getExtension(filename: string): string {
    const re = /(?:\.([^.]+))?$/;
    return re.exec(filename)[1];
  }
}
