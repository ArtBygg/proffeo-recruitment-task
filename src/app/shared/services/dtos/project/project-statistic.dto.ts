import { MoneyDTO } from '../money.dto';

export interface ProjectStatisticDTO {
  hours: number;
  tasksDonePercentage: number;
  financial: MoneyDTO;
}
