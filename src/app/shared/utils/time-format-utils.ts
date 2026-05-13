export function formatTime(seconds: number | undefined): string {
  if (!seconds) return '0h 0min';

  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let result = '';
  if (hours > 0) {
    result += `${hours}h `;
  }
  if (minutes > 0 || hours === 0) {
    result += `${minutes}min`;
  }

  return result.trim();
}
