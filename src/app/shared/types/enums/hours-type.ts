export type HoursType = 'Auto' | 'OrdinaryHours' | 'BankPlus' | 'BankMinus' | 'Overtime50' | 'Overtime100';

const hoursTypeValues: HoursType[] = ['Auto', 'OrdinaryHours', 'BankPlus', 'BankMinus', 'Overtime50', 'Overtime100'];

export function isHoursType(value: string): value is HoursType {
  return hoursTypeValues.includes(value as HoursType);
}
