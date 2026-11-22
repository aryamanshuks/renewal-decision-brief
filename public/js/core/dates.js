// Date arithmetic. Plain code, no model involved.
// All dates are calendar dates handled in UTC so that time zones never move a deadline.

const MS_DAY = 86400000;

export function parseISO(value) {
  if (value instanceof Date) return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  if (typeof value !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const date = new Date(Date.UTC(y, mo - 1, d));
  // Reject impossible dates such as 2026-02-31.
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
  return date;
}

export function toISO(date) {
  if (!date) return "";
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatDate(value, { weekday = false } = {}) {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!date) return "";
  const core = `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  return weekday ? `${WEEKDAYS[date.getUTCDay()]} ${core}` : core;
}

export function addDays(date, n) {
  return new Date(date.getTime() + n * MS_DAY);
}

export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_DAY);
}

// Adds calendar months. 31 Jan plus 1 month gives the last day of February.
export function addMonths(date, n) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + n;
  const d = date.getUTCDate();
  const first = new Date(Date.UTC(y, m, 1));
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  return new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), Math.min(d, lastDay)));
}

export function isWeekend(date) {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

// Steps back n working days, Monday to Friday. Public holidays are not known to this code.
export function subtractBusinessDays(date, n) {
  let current = date;
  let left = n;
  while (left > 0) {
    current = addDays(current, -1);
    if (!isWeekend(current)) left -= 1;
  }
  return current;
}

// Public holidays are not applied to any calculation. These four national holidays, and weekends,
// are only flagged when a date a person must act on lands on one.
const NATIONAL_HOLIDAYS = { "01-26": "Republic Day", "08-15": "Independence Day", "10-02": "Gandhi Jayanti", "12-25": "Christmas Day" };
export function nonWorkingNote(date) {
  if (!date) return "";
  const name = NATIONAL_HOLIDAYS[toISO(date).slice(5)];
  if (name) return name;
  if (isWeekend(date)) return date.getUTCDay() === 6 ? "a Saturday" : "a Sunday";
  return "";
}

export function previousBusinessDayOnOrBefore(date) {
  let current = date;
  while (isWeekend(current)) current = addDays(current, -1);
  return current;
}

const UNIT_ALIASES = {
  day: "days", days: "days",
  business_day: "business_days", business_days: "business_days", working_days: "business_days",
  week: "weeks", weeks: "weeks",
  month: "months", months: "months",
  year: "years", years: "years",
  none: "none", "": "none",
};

export function normalizeUnit(unit) {
  const key = String(unit || "").toLowerCase().trim().replace(/\s+/g, "_");
  return UNIT_ALIASES[key] || "none";
}

export function isUsableDuration(number, unit) {
  return Number.isFinite(number) && number > 0 && normalizeUnit(unit) !== "none";
}

// Moves forward by a duration. "start plus 24 months" returns the same calendar day 24 months later.
export function addDuration(date, number, unit) {
  const u = normalizeUnit(unit);
  if (u === "days") return addDays(date, number);
  if (u === "weeks") return addDays(date, number * 7);
  if (u === "months") return addMonths(date, number);
  if (u === "years") return addMonths(date, number * 12);
  if (u === "business_days") {
    let current = date;
    let left = number;
    while (left > 0) {
      current = addDays(current, 1);
      if (!isWeekend(current)) left -= 1;
    }
    return current;
  }
  return null;
}

// Moves back by a duration. Used for "at least N days before the end of the term".
export function subtractDuration(date, number, unit) {
  const u = normalizeUnit(unit);
  if (u === "days") return addDays(date, -number);
  if (u === "weeks") return addDays(date, -number * 7);
  if (u === "months") return addMonths(date, -number);
  if (u === "years") return addMonths(date, -number * 12);
  if (u === "business_days") return subtractBusinessDays(date, number);
  return null;
}

// Last day of a term that starts on `start` and runs for the given duration.
// Convention used here: a 24 month term from 3 Feb 2025 ends on 2 Feb 2027.
// Where a contract could be read as ending one day later, this earlier reading is the safer one for a deadline.
export function termEndFromStart(start, number, unit) {
  const next = addDuration(start, number, unit);
  if (!next) return null;
  return addDays(next, -1);
}

export function describeDuration(number, unit) {
  const u = normalizeUnit(unit);
  if (!isUsableDuration(number, u)) return "";
  const label = u === "business_days" ? "working day" : u.slice(0, -1);
  return `${number} ${label}${number === 1 ? "" : "s"}`;
}

export function maxDate(a, b) {
  if (!a) return b;
  if (!b) return a;
  return a.getTime() >= b.getTime() ? a : b;
}

export function minDate(a, b) {
  if (!a) return b;
  if (!b) return a;
  return a.getTime() <= b.getTime() ? a : b;
}
