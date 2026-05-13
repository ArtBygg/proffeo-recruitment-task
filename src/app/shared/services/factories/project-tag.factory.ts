import { Injectable } from '@angular/core';
import { TagDTO } from '@app/shared/services/dtos/project-tag/tag.dto';
import { Tag } from '@app/shared/types/models/tag/tag.model';
import { AbstractFactory } from './abstract.factory';

@Injectable({ providedIn: 'root' })
export class ProjectTagFactory extends AbstractFactory<TagDTO, Tag> {
  public produce(item: TagDTO): Tag {
    return item
      ? new Tag({
          id: item.id,
          projectId: item.projectId,
          name: item.name,
          description: item.description,
          hexColor: item.hexColor
        })
      : undefined;
  }
}
