// All business dates are in India Standard Time (UTC+05:30, no DST).
const IST_OFFSET_MS = 330 * 60 * 1000;

/** How far ahead customers may book. */
export const BOOKING_WINDOW_DAYS = 60;
/** Slots must be booked at least this long before they start. */
export const BOOKING_LEAD_TIME_MS = 30 * 60 * 1000;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Today's calendar date in IST as "YYYY-MM-DD". */
export function todayInIST(now = new Date()) {
  return new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** Adds whole days to a "YYYY-MM-DD" date string. */
export function addDays(date, days) {
  const d = toDbDate(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isValidDateOnly(date) {
  if (!DATE_ONLY.test(date)) return false;
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}

/** Converts "YYYY-MM-DD" to the UTC-midnight Date Prisma uses for `@db.Date`. */
export function toDbDate(date) {
  return new Date(`${date}T00:00:00.000Z`);
}

export function fromDbDate(date) {
  return date.toISOString().slice(0, 10);
}

/** The instant a slot starts, given its IST calendar date and "HH:mm" start time. */
export function slotStartInstant(date, startTime) {
  return new Date(`${date}T${startTime}:00+05:30`);
}

/** True when the date is today..today+window (IST). */
export function isWithinBookingWindow(date, now = new Date()) {
  const today = todayInIST(now);
  return date >= today && date <= addDays(today, BOOKING_WINDOW_DAYS);
}

/** True when the slot starts too soon (or already started) to be booked. */
export function isSlotClosed(date, startTime, now = new Date()) {
  return slotStartInstant(date, startTime).getTime() - now.getTime() < BOOKING_LEAD_TIME_MS;
}

/** "Sat, 31 Oct 2026" from "2026-10-31". */
export function formatDisplayDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(toDbDate(date));
}

/** "8:30 PM" from "20:30". */
export function formatTime(time) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}
