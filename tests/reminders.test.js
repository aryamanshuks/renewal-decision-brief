import test from "node:test";
import assert from "node:assert/strict";
import { reminderPlan, calendarFile } from "../public/js/core/reminders.js";
import { PRECOMPUTED } from "../public/data/precomputed.js";
import { SAMPLE_FAMILIES, SUPPLIER_MASTER, DEMO_TODAY } from "../public/data/samples.js";
import { buildBrief } from "../public/js/core/brief.js";
import { workflowState } from "../public/js/core/workflow.js";
import { parseISO, toISO } from "../public/js/core/dates.js";

const today = parseISO(DEMO_TODAY);
const people = { procurement: { name: "Priya Menon" }, escalation: { name: "Rohan Kapoor" }, legal: { name: "Anita Desai" } };

function setup(id, record = {}) {
  const family = SAMPLE_FAMILIES.find((f) => f.id === id);
  const supplier = { ...SUPPLIER_MASTER.find((s) => s.id === family.supplierId), currency: "INR" };
  const brief = buildBrief({ extraction: JSON.parse(JSON.stringify(PRECOMPUTED[id].result)), documents: family.documents, record, supplier, today });
  const flow = workflowState({ brief, record, supplier, people, today });
  return { brief, flow, supplier, family, record };
}

test("reminders: keyed to the safe send date, with an escalation after the decide-by date", () => {
  const { brief, flow, supplier } = setup("brightdesk");
  const plan = reminderPlan({ brief, flow, supplier, people, today });
  const send = plan.items.find((i) => /Last safe day/.test(i.what));
  assert.equal(toISO(send.on), "2026-12-09");
  assert.equal(send.to, "Priya Menon");
  const esc = plan.items.find((i) => /Escalation/.test(i.what));
  assert.equal(esc.to, "Rohan Kapoor");
  assert.equal(esc.past, true, "the decision on Brightdesk is already overdue on the demo date");
  // Reminders 90, 60 and 30 days before the 14 Feb 2027 end date: two of them land after 9 Dec 2026.
  assert.equal(plan.endDateCheck.late, 2);
});

test("reminders: Tallyhand shows why end-date schedules fail after an amendment lengthened the notice", () => {
  const { brief, flow, supplier } = setup("tallyhand");
  const plan = reminderPlan({ brief, flow, supplier, people, today });
  assert.equal(plan.endDateCheck.late, 3);
});

test("reminders: none for a date that is not confirmed, and they stop once a valid notice is recorded", () => {
  const k = setup("kestrelway");
  assert.equal(reminderPlan({ brief: k.brief, flow: k.flow, supplier: k.supplier, people, today }), null);
  const record = {
    decision: { choice: "exit", by: "Arjun Mehta", on: "2026-11-23", reason: "Moving to another helpdesk", basis: { mechanism: "automatic", termEnd: "2027-02-14", cancelBy: "2026-12-16" } },
    notice: { sentOn: "2026-11-23", method: "Registered post", proof: "RP-2" },
  };
  const b = setup("brightdesk", record);
  assert.equal(b.flow.stage, "done");
  const plan = reminderPlan({ brief: b.brief, flow: b.flow, record, supplier: b.supplier, people, today });
  assert.equal(plan.items.length, 0);
  assert.match(plan.stopped, /Stopped/);
});

test("calendar file: valid shape, all-day events, alerts, and where each date came from", () => {
  const { brief, supplier, family } = setup("brightdesk");
  const ics = calendarFile({ brief, supplier, contractId: "brightdesk", documents: family.documents, now: new Date("2026-11-23T05:00:00Z") });
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0"));
  assert.ok(ics.trimEnd().endsWith("END:VCALENDAR"));
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 3);
  assert.ok(ics.includes("DTSTART;VALUE=DATE:20261209"));
  assert.ok(ics.includes("DTEND;VALUE=DATE:20261210"));
  assert.ok(ics.includes("TRIGGER:-P7D"));
  assert.ok(/Brightdesk Subscription Agreement/.test(ics.replace(/\r\n /g, "")));
  for (const line of ics.split("\r\n")) assert.ok(line.length <= 75, `line too long: ${line}`);
});

test("after a missed window: next-window dates, a next-window calendar and a request that is not a notice", async () => {
  const { draftLateRequest } = await import("../public/js/core/notice.js");
  const record = { answers: { term_start_date: { value: "2025-02-03", by: "Meera Nair", evidenceNote: "First invoice", procurement: "confirmed", checkedBy: "Priya Menon", checkedAgainst: "First invoice" } } };
  const { brief, flow, supplier, family } = setup("kestrelway", record);
  const d = brief.dates;
  assert.equal(flow.stage, "window_closed");
  // Term from 3 Feb 2025 for 24 months ends 2 Feb 2027; it renews to 2 Feb 2028.
  assert.equal(toISO(d.nextTermEnd), "2028-02-02");
  assert.equal(toISO(d.nextCancelBy), "2027-11-04", "90 days before 2 Feb 2028");
  assert.equal(toISO(d.nextSendBy), "2027-10-28", "3 working days for delivery and 2 of margin before Thu 4 Nov 2027");
  const plan = reminderPlan({ brief, flow, supplier, people, today });
  assert.equal(plan.next, true);
  assert.match(plan.stopped, /4 Nov 2027/);
  const ics = calendarFile({ brief, supplier, contractId: "kestrelway", documents: family.documents });
  const starts = [...ics.matchAll(/DTSTART;VALUE=DATE:(\d+)/g)].map((m) => m[1]);
  assert.deepEqual(starts, ["20270730", "20271028", "20271104"], "only next-window dates; nothing already past");
  const letter = draftLateRequest({ brief, supplier, customerName: "Orvanta", today, signer: { name: "Priya Menon", title: "Procurement Manager" } });
  assert.match(letter, /is a request\. It is not a notice/);
  assert.match(letter, /ends on 2 Feb 2027/);
  assert.doesNotMatch(letter, /—/, "no em dashes");
});
