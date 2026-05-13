import { IdBased } from '@app/shared/types/models/shared/id-based.model';

export class IdsCollection implements IdBased {
  public id: string;
  public ids: string[];
}
