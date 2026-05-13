import { IdBased } from '@app/shared/types/models/shared/id-based.model';

export class Company implements IdBased {
  public id: string;
  public name?: string;
  public description?: string;
  public directUserCompany: boolean;

  public constructor(data: Partial<Company>) {
    Object.assign(this, data);
  }

  public get url(): string {
    return `/companies/${this.id}`;
  }
}
