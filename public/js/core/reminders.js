// Reminders keyed to the safe send date, not the end date, and a calendar file for them. Plain code.
import { addDays, subtractBusinessDays, isNonWorkingDay, formatDate, toISO } from "./dates.js";

function nextBusinessDay(date) {
  let d = addDays(date, 1);
  while (isNonWorkingDay(d)) d = addDays(d, 1);
  return d;
}

const RENEWS_UNLESS_ACTED = new Set(["automatic", "one_time_extension_then_ends", "customer_must_give_notice_to_renew"]);

// Returns { items, stopped, endDateCheck } or null when there is no confirmed date to remind about.
export function reminderPlan({ brief, flow, record = {}, supplier, people, today }) {
  if (!brief || !brief.dates) return null;
  if (brief.outcome !== "confirmed" && brief.outcome !== "ends") return null;
  const d = brief.dates;
  const name = supplier.short || supplier.name || "this supplier";
  const owner = record.ownerOverride || supplier.owner || "the budget owner";
  const proc = people.procurement.name;
  const head = people.escalation.name;

  if (flow?.stage === "done") return { items: [], stopped: `Stopped: ${flow.label.toLowerCase()}.`, endDateCheck: null };
  if (d.windowClosed && d.nextCancelBy && !d.expired) {
    return { items: [], stopped: `Stopped for this term: the window closed on ${formatDate(d.cancelBy)}. The calendar file holds the next window instead: decide by ${formatDate(d.nextDecideBy)}, send by ${formatDate(d.nextSendBy)}, notice must arrive by ${formatDate(d.nextCancelBy)}.`, endDateCheck: null, next: true };
  }
  if (d.expired || d.windowClosed || flow?.stage === "window_closed") return { items: [], stopped: "Stopped: the notice window has closed.", endDateCheck: null };

  const items = [];
  const push = (on, to, what) => { if (on) items.push({ on, to, what, past: on < today }); };
  const decided = Boolean(record.decision?.choice);
  if (d.decideBy && !decided) {
    push(subtractBusinessDays(d.decideBy, 10), owner, `Decision on ${name} due in two weeks`);
    push(d.decideBy, owner, `Decision on ${name} due today`);
    push(nextBusinessDay(d.decideBy), head, `Escalation, if ${owner} has not decided`);
  }
  if (d.sendBy) {
    push(subtractBusinessDays(d.sendBy, 5), proc, `Prepare the notice to ${name}, if the decision needs one`);
    push(d.sendBy, proc, `Last safe day to send notice to ${name}`);
  }
  if (d.cancelBy) push(d.cancelBy, `${proc} and ${head}`, `Notice to ${name} must have arrived. Check the proof of delivery`);
  if (brief.outcome === "ends" && d.termEnd) push(d.termEnd, `${owner} and ${proc}`, `${name} contract ends. Work after today is outside the contract`);
  items.sort((a, b) => a.on - b.on);

  // What a common schedule would do instead: reminders 90, 60 and 30 days before the end date.
  let endDateCheck = null;
  if (RENEWS_UNLESS_ACTED.has(brief.mechanism) && d.termEnd && d.sendBy) {
    const usual = [90, 60, 30].map((n) => addDays(d.termEnd, -n));
    const late = usual.filter((x) => x > d.sendBy).length;
    endDateCheck = { late, of: usual.length, text: late
      ? `A schedule of reminders 90, 60 and 30 days before the end date would put ${late} of its 3 reminders after the last safe send date.`
      : "Here a schedule keyed to the end date would still arrive in time, because the notice period is short." };
  }
  return { items, stopped: "", endDateCheck };
}

// ---------- Calendar file (iCalendar, RFC 5545) ----------

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const ymd = (d) => toISO(d).replace(/-/g, "");

function fold(line) {
  const out = [];
  let rest = line;
  while (rest.length > 74) { out.push(rest.slice(0, 74)); rest = ` ${rest.slice(74)}`; }
  out.push(rest);
  return out.join("\r\n");
}

function event({ uid, on, title, description, alarms = [], stamp }) {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${ymd(on)}`,
    `DTEND;VALUE=DATE:${ymd(addDays(on, 1))}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(description)}`,
    "TRANSP:TRANSPARENT",
  ];
  for (const a of alarms) lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(title)}`, `TRIGGER:${a}`, "END:VALARM");
  lines.push("END:VEVENT");
  return lines.map(fold).join("\r\n");
}

// The key dates for one contract as a calendar file. Every event says where the date came from.
export function calendarFile({ brief, supplier, contractId, documents = [], now = new Date() }) {
  const d = brief?.dates;
  if (!d) return "";
  const name = supplier.short || supplier.name || "Supplier";
  const method = brief.notice?.methods ? ` Method: ${brief.notice.methods.replace(/[.\s]+$/, "")}.` : "";
  const from = documents.length ? ` Worked out from: ${documents.map((x) => x.name).join(", ")}.` : "";
  const stamp = `${now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`;
  const base = `rdb-${contractId}`;
  const events = [];
  // Once this term's window has closed, the useful dates are the next window's.
  if (d.windowClosed && d.nextCancelBy && !d.expired) {
    const after = ` The window for the current term closed on ${formatDate(d.cancelBy)}; these dates are for the term starting ${formatDate(d.renewsOn)}.`;
    if (d.nextDecideBy) events.push(event({ uid: `${base}-next-decide@renewal-decision-brief`, on: d.nextDecideBy, stamp, title: `Decide: ${name} renewal (next window)`, description: `Renew, renegotiate or exit.${after}${from}`, alarms: ["-P10D"] }));
    if (d.nextSendBy) events.push(event({ uid: `${base}-next-send@renewal-decision-brief`, on: d.nextSendBy, stamp, title: `Send notice to ${name} (next window)`, description: `Last safe day to send. Notice must arrive by ${formatDate(d.nextCancelBy)}.${method}${after}${from}`, alarms: ["-P7D", "-P1D"] }));
    events.push(event({ uid: `${base}-next-arrive@renewal-decision-brief`, on: d.nextCancelBy, stamp, title: `Notice to ${name} must have arrived (next window)`, description: `Contract deadline for notice to arrive.${after}${from}` }));
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Renewal Decision Brief//Prototype//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...events, "END:VCALENDAR", ""].join("\r\n");
  }
  if (d.decideBy) events.push(event({ uid: `${base}-decide@renewal-decision-brief`, on: d.decideBy, stamp, title: `Decide: ${name} renewal`, description: `Renew, renegotiate or exit. The owner decides by this house-rule date.${from}`, alarms: ["-P10D"] }));
  if (d.sendBy) events.push(event({ uid: `${base}-send@renewal-decision-brief`, on: d.sendBy, stamp, title: `Send notice to ${name}`, description: `Last safe day to send. Notice must arrive by ${formatDate(d.cancelBy)}.${method}${from}`, alarms: ["-P7D", "-P1D"] }));
  if (d.cancelBy) events.push(event({ uid: `${base}-arrive@renewal-decision-brief`, on: d.cancelBy, stamp, title: `Notice to ${name} must have arrived`, description: `Contract deadline for notice to arrive. Check the proof of delivery.${from}` }));
  if (brief.outcome === "ends" && d.termEnd) events.push(event({ uid: `${base}-ends@renewal-decision-brief`, on: d.termEnd, stamp, title: `${name} contract ends`, description: `No automatic renewal. Keeping the supplier needs a signed extension.${from}`, alarms: ["-P30D"] }));
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Renewal Decision Brief//Prototype//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...events, "END:VCALENDAR", ""].join("\r\n");
}
