import { inject, Injectable } from '@angular/core';
import { FileInfo } from '@app/shared/types/models/files/file-info';
import { FileDTO } from '../dtos/file/file.dto';
import { UsersDataService } from '../users-data.service';
import { AbstractFactory } from './abstract.factory';

@Injectable({ providedIn: 'root' })
export class FileFactory extends AbstractFactory<FileDTO, FileInfo> {
  private readonly userService = inject(UsersDataService);

  public produce(item: FileDTO): FileInfo {
    if (!item) {
      return undefined;
    }

    return new FileInfo({
      createdAt: new Date(item.createdAt),
      createdBy: this.userService.getById(item.createdBy),
      description: item.description,
      fileShortId: item.fileShortId,
      id: item.id,
      name: item.name,
      size: item.size,
      type: item.type,
      orderNo: item.orderNo
    });
  }
}
