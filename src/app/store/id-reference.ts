import { IdBased } from '@app/shared/types/models/shared/id-based.model';

export class IdReference implements IdBased {
  public id: string;
  public referenceId: string;
}
