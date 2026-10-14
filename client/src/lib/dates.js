// Dates arrive in UTC and are always shown in EAT (Africa/Nairobi, UTC+3, no daylight saving).
const TZ = 'Africa/Nairobi';
const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

const format = (iso, options) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, ...options }).format(new Date(iso));

/** "Sat, 28 Oct" */
export const formatDay = (iso) => format(iso, { weekday: 'short', day: '2-digit', month: 'short' });
/** "15:00 EAT" */
export const formatTime = (iso) => `${format(iso, { hour: '2-digit', minute: '2-digit', hour12: false })} EAT`;
/** "14 Oct 2026" */
export const formatDate = (iso) => format(iso, { day: 'numeric', month: 'short', year: 'numeric' });
/** "OCT 24 • 14:30" */
export const formatShortDateTime = (iso) =>
  `${format(iso, { month: 'short', day: '2-digit' }).toUpperCase()} • ${format(iso, { hour: '2-digit', minute: '2-digit', hour12: false })}`;
/** "2026-10" → "October 2026" */
export const formatMonth = (month) => format(`${month}-15T12:00:00Z`, { month: 'long', year: 'numeric' });

/** UTC ISO → value for <input type="datetime-local">, in EAT. */
export const toEatInput = (iso) => new Date(new Date(iso).getTime() + EAT_OFFSET_MS).toISOString().slice(0, 16);
/** <input type="datetime-local"> value (EAT) → UTC ISO. */
export const fromEatInput = (value) => new Date(new Date(`${value}:00Z`).getTime() - EAT_OFFSET_MS).toISOString();

/** Months (YYYY-MM, in EAT) from one date to another, for the schedule's month filter. */
export function monthsBetween(startIso, endIso) {
  const last = toEatInput(endIso).slice(0, 7);
  let [year, month] = toEatInput(startIso).slice(0, 7).split('-').map(Number);
  const months = [];
  for (;;) {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    if (key > last) return months;
    months.push(key);
    [year, month] = month === 12 ? [year + 1, 1] : [year, month + 1];
  }
}
