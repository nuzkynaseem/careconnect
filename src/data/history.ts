import { routines } from './medications';

export const dosesPerDay = routines.reduce((sum, r) => sum + r.medications.length, 0);

/** How many days of sample history exist before today. */
const HISTORY_DAYS = 45;

export type DayRecord = { taken: number; total: number };

function dayIndex(date: Date) {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
}

export function isSameDay(a: Date, b: Date) {
  return dayIndex(a) === dayIndex(b);
}

/**
 * Sample history for past days until doses are saved on the device. A fixed
 * pattern keeps the calendar stable between visits: roughly one day in six has
 * a missed dose.
 */
export function getPastDay(date: Date, today: Date): DayRecord | null {
  const diff = dayIndex(today) - dayIndex(date);
  if (diff <= 0 || diff > HISTORY_DAYS) return null;
  const missed = (dayIndex(date) * 7919) % 6 === 0 ? 1 : 0;
  return { taken: dosesPerDay - missed, total: dosesPerDay };
}
