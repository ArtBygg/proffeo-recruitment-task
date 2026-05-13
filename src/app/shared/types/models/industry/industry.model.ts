import { IndustryDTO } from '@app/shared/services/dtos/company-industry/company-industry.dto';

export class Industry {
  public id: string;
  public name: string;

  public constructor(data: IndustryDTO) {
    Object.assign(this, data);
  }
}
