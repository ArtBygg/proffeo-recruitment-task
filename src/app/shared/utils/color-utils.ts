import { inRange } from 'lodash';

export const COLOR_SLATE_700 = '#314158';
const COLOR_GREEN = '-green-500';
const COLOR_RED = '-red-600';
const COLOR_YELLOW = '-amber-500';

export const getValueColorTw = (value: number): string => {
  if (inRange(value, 1, 30)) {
    return COLOR_GREEN;
  }

  if (inRange(value, 31, 70)) {
    return COLOR_YELLOW;
  }

  if (inRange(value, 71, 100)) {
    return COLOR_RED;
  }

  return COLOR_RED;
};

export const getPlusMinusColorTw = (value: number): string => {
  if (value > 0) {
    return COLOR_YELLOW;
  }

  if (value === 0) {
    return COLOR_GREEN;
  }

  if (value < 0) {
    return COLOR_RED;
  }
};
