// Property tests: random contracts through the date logic. Rules that must hold for every input.
import test from "node:test";
import assert from "node:assert/strict";
import { parseISO, toISO, addDays, isWeekend, termEndFromStart, subtractDuration, addMonths } from "../public/js/core/dates.js";
import { computeDates, sendByFor } from "../public/js/core/brief.js";

let seed = 20261122;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (a) => a[Math.floor(rand() * a.length)];
const randomDate = (from, to) => addDays(parseISO(from), Math.floor(rand() * ((parseISO(to) - parseISO(from)) / 86400000)));

test("fuzz: deadlines are ordered, on working days, and in the right place", () => {
  const today = parseISO("2026-11-23");
  for (let i = 0; i < 5000; i += 1) {
    const unit = pick(["months", "years", "days"]);
    const initialNumber = unit === "months" ? pick([1, 3, 6, 12, 18, 24, 36]) : unit === "years" ? pick([1, 2, 3, 5]) : pick([30, 90, 180, 365]);
    const renewalUnit = pick(["months", "years"]);
    const renewalNumber = renewalUnit === "months" ? pick([1, 6, 12, 24]) : pick([1, 2]);
    const noticeUnit = pick(["days", "business_days", "months"]);
    const noticeNumber = noticeUnit === "months" ? pick([1, 2, 3]) : pick([5, 10, 30, 45, 60, 90, 120]);
    const deemedUnit = pick(["none", "days", "business_days"]);
    const deemedNumber = deemedUnit === "none" ? 0 : pick([1, 2, 3, 5]);
    const mechanism = pick(["automatic", "automatic", "one_time_extension_then_ends", "customer_must_give_notice_to_renew"]);
    const leadDays = pick([30, 45, 60, 90]);
    const start = randomDate("2015-01-01", "2026-11-01");
    const d = computeDates({ start, initialNumber, initialUnit: unit, mechanism, renewalNumber, renewalUnit, noticeNumber, noticeUnit, deemedNumber, deemedUnit, leadDays, today });
    const ctx = JSON.stringify({ start: toISO(start), initialNumber, unit, mechanism, renewalNumber, renewalUnit, noticeNumber, noticeUnit, deemedNumber, deemedUnit });

    assert.ok(d.termEnd, `no term end ${ctx}`);
    assert.ok(d.termEnd >= start, `term ends before it starts ${ctx}`);
    if (mechanism === "automatic") assert.ok(d.termEnd >= today, `automatic term not rolled forward ${ctx}`);
    if (d.finalTerm || d.expired) continue;
    assert.ok(d.cancelBy, `no cancel-by ${ctx}`);
    assert.ok(d.cancelBy < d.termEnd, `cancel-by not before term end ${ctx}`);
    assert.ok(d.sendBy <= d.cancelBy, `send-by after cancel-by ${ctx}`);
    assert.ok(!isWeekend(d.sendBy), `send-by on a weekend ${ctx}`);
    assert.ok(d.decideBy < d.sendBy, `decide-by not before send-by ${ctx}`);
    // The safety margin and deemed delivery mean the send date is never closer than 2 working days to the deadline.
    assert.ok((d.cancelBy - d.sendBy) / 86400000 >= 2, `send-by too close ${ctx}`);
    if (d.windowClosed) assert.ok(d.cancelBy < today, `window closed but deadline ahead ${ctx}`);
    else assert.ok(d.cancelBy >= today, `window open but deadline passed ${ctx}`);
    if (d.windowClosed && mechanism === "automatic") assert.ok(d.nextCancelBy > d.cancelBy, `next chance not later ${ctx}`);
  }
});

test("fuzz: a term of N months always ends the day before the same calendar day, clamped at month end", () => {
  for (let i = 0; i < 3000; i += 1) {
    const start = randomDate("2000-01-01", "2030-12-31");
    const n = 1 + Math.floor(rand() * 60);
    const end = termEndFromStart(start, n, "months");
    assert.equal(toISO(addDays(end, 1)), toISO(addMonths(start, n)), `${toISO(start)} + ${n}`);
  }
});

test("fixed cases: month ends, leap years and weekends", () => {
  // 31 Jan plus one month lands on 28 Feb (29 in a leap year). The term is taken to end the day before: the earlier, safer reading.
  assert.equal(toISO(termEndFromStart(parseISO("2026-01-31"), 1, "months")), "2026-02-27");
  assert.equal(toISO(termEndFromStart(parseISO("2028-01-31"), 1, "months")), "2028-02-28");
  // 29 Feb 2024 plus 12 months: 28 Feb 2025, so the term ends 27 Feb 2025.
  assert.equal(toISO(termEndFromStart(parseISO("2024-02-29"), 12, "months")), "2025-02-27");
  // Three months' notice before 31 May is 28 Feb, not 3 March.
  assert.equal(toISO(subtractDuration(parseISO("2027-05-31"), 3, "months")), "2027-02-28");
  // A Sunday deadline with 3 working days deemed delivery: Wed, then minus 2 working days: Mon.
  assert.equal(toISO(sendByFor(parseISO("2026-12-20"), 3, "business_days")), "2026-12-14");
});
