import { IdBased } from '@app/shared/types/models/shared/id-based.model';

export class PageData implements IdBased {
  public id: string;
  public ids?: string[];
  public total: number;
  public limit: number;
  public page: number;
}
