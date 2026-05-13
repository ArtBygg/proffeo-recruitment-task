import { Injectable } from '@angular/core';
import { Dictionary, DictionaryDto } from '@app/shared/services/dtos/dictionary.dto';
import { AbstractFactory } from './abstract.factory';

@Injectable({ providedIn: 'root' })
export class LookupFactory extends AbstractFactory<DictionaryDto, Dictionary> {
  public produce(item: DictionaryDto): Dictionary {
    return item
      ? new Dictionary({
          companyId: item.companyId,
          id: item.id,
          type: item.type,
          value: item.value
        })
      : undefined;
  }
}
