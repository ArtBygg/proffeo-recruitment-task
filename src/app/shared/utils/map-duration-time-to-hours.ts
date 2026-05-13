import { parse, toSeconds } from 'iso8601-duration';

export const mapDurationTimeToHours = (duration: string): number => {
  if (!duration) {
    return 0;
  }
  try {
    return toSeconds(parse(duration)) > 0 ? toSeconds(parse(duration)) / 3600 : 0;
  } catch {
    return 0;
  }
};
