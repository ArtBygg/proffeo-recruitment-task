export interface DictionaryDto {
  id: string;
  companyId: string;
  type: string;
  value: string;
}

export class Dictionary {
  public id: string;
  public companyId: string;
  public type: string;
  public value: string;

  public constructor(data: Dictionary) {
    Object.assign(this, data);
  }
}

export enum LookupType {
  WorkType = 'WorkType',
  WorkPossibleThreat = 'WorkPossibleThreat',
  PossibleThreat = 'PossibleThreat',
  Remedy = 'Remedy'
}
