import { computed, inject, Injectable, Injector, signal } from '@angular/core';
import { Location } from '@app/shared/types/models/location/location.model';
import { LocationDTO } from '../dtos/location/location.dto';
import { AbstractFactory } from './abstract.factory';
import { FileFactory } from './file.factory';

@Injectable({ providedIn: 'root' })
export class LocationFactory extends AbstractFactory<LocationDTO, Location> {
  private readonly injector: Injector = inject(Injector);

  private readonly fileFactory: FileFactory = this.injector.get<FileFactory>(FileFactory);

  public constructor() {
    super();
  }

  public produce(item: LocationDTO): Location {
    if (!item) {
      return undefined;
    }

    return new Location({
      id: item.id,
      name: item.name,
      projectId: item.projectId,
      orderNo: item.orderNo,
      readOnly: item.readOnly,
      files: (item.files?.length ?? 0) ? computed(() => item.files.map(u => this.fileFactory.produce(u))) : signal([])
    }); /*TODO ZK-118-082 do zbadania co to w ogóle ma robić i czy nie lepiej podpiąć sygnał ze store'a??*/
  }
}
