import test from "node:test";
import assert from "node:assert/strict";
import {
  parseISO, toISO, formatDate, addMonths, termEndFromStart, subtractDuration, subtractBusinessDays, daysBetween,
} from "../public/js/core/dates.js";
import { verifyQuote, isVerified } from "../public/js/core/verify.js";
import { buildBrief, computeDates, sendByFor, oddStartReasons } from "../public/js/core/brief.js";

const D = parseISO;

test("dates: parse and reject impossible dates", () => {
  assert.equal(toISO(D("2026-11-04")), "2026-11-04");
  assert.equal(D("2026-02-31"), null);
  assert.equal(D("4 Nov 2026"), null);
  assert.equal(formatDate(D("2026-11-04"), { weekday: true }), "Wed 4 Nov 2026");
});

test("dates: month arithmetic clamps to month end", () => {
  assert.equal(toISO(addMonths(D("2025-01-31"), 1)), "2025-02-28");
  assert.equal(toISO(addMonths(D("2024-01-31"), 1)), "2024-02-29");
  assert.equal(toISO(addMonths(D("2025-03-20"), 24)), "2027-03-20");
});

test("dates: a 24 month term from 3 Feb 2025 ends 2 Feb 2027", () => {
  assert.equal(toISO(termEndFromStart(D("2025-02-03"), 24, "months")), "2027-02-02");
  assert.equal(toISO(termEndFromStart(D("2025-03-20"), 24, "months")), "2027-03-19");
  assert.equal(toISO(termEndFromStart(D("2026-01-01"), 1, "years")), "2026-12-31");
});

test("dates: 90 days before 2 Feb 2027 is 4 Nov 2026, and before 19 Mar 2027 is 19 Dec 2026", () => {
  assert.equal(toISO(subtractDuration(D("2027-02-02"), 90, "days")), "2026-11-04");
  assert.equal(toISO(subtractDuration(D("2027-03-19"), 90, "days")), "2026-12-19");
  assert.equal(daysBetween(D("2026-11-04"), D("2026-12-19")), 45);
});

test("dates: working days skip weekends", () => {
  // 4 Nov 2026 is a Wednesday. Three working days earlier is Friday 30 Oct.
  assert.equal(toISO(subtractBusinessDays(D("2026-11-04"), 3)), "2026-10-30");
  // Deemed receipt of 3 working days plus the 2 day safety margin: Wednesday 28 Oct.
  assert.equal(toISO(sendByFor(D("2026-11-04"), 3, "business_days")), "2026-10-28");
  // A Saturday deadline with no deemed receipt steps back to Friday, then two working days: Wednesday.
  assert.equal(toISO(sendByFor(D("2026-12-19"), 0, "none")), "2026-12-16");
});

test("verify: finds a passage despite spacing, case and typographic quotes", () => {
  const text = "2. Renewal.  This Agreement shall renew\nautomatically for successive twelve (12) month terms unless either party gives “written notice” at least 90 days before the end of the then‑current term.";
  const r = verifyQuote(text, 'this agreement shall renew automatically for successive twelve (12) month terms unless either party gives "written notice" at least 90 days before the end of the then-current term.');
  assert.equal(r.level, "exact");
  assert.ok(text.slice(r.start, r.end).startsWith("This Agreement shall renew"));
  assert.equal(isVerified(r), true);
});

test("verify: an invented passage is not verified", () => {
  const text = "The term is twelve months. Either party may terminate on thirty days notice.";
  const r = verifyQuote(text, "This Agreement renews automatically for successive one year terms unless notice is given.");
  assert.equal(r.level, "missing");
  assert.equal(isVerified(r), false);
  assert.equal(verifyQuote(text, "").level, "missing");
});

// ---- The paired test: identical contracts except for what the term is counted from.
function contractText(startWording) {
  return `MASTER SERVICES AGREEMENT
This Agreement is made on 20 March 2025 (the "Effective Date") between LogiCo Freight Private Limited ("Supplier") and the Customer.
1.1 "Service Commencement Date" means the first day on which Supplier performs deliveries for Customer.
2.1 Term. This Agreement continues for an initial term of twenty-four (24) months from the ${startWording}.
2.2 Renewal. After the initial term this Agreement shall renew automatically for successive periods of twelve (12) months unless either party gives written notice of non-renewal at least ninety (90) days before the end of the then-current term.
9.1 Notices. A notice must be sent by registered post and is deemed received three (3) business days after posting. Email is not valid notice.
Signed by both parties on 20 March 2025.`;
}

function reading(kind) {
  const fromEvent = kind === "B";
  return {
    contract: { title: "Master Services Agreement", supplier_name: "LogiCo Freight Private Limited", customer_name: "Customer", contract_type: "master services agreement", signed_status: "signed", agreement_date: "2025-03-20", agreement_date_evidence: { doc_id: "D1", quote: "This Agreement is made on 20 March 2025" } },
    documents: [{ doc_id: "D1", role: "main_agreement", document_date: "2025-03-20", one_line_summary: "Main agreement." }],
    term: {
      start_basis: fromEvent ? "event_or_date_not_stated_in_documents" : "defined_date_stated_in_documents",
      start_date: fromEvent ? "" : "2025-03-20",
      start_label: fromEvent ? "Service Commencement Date" : "Effective Date",
      start_event_description: fromEvent ? "The first day on which Supplier performs deliveries for Customer." : "",
      start_evidence: { doc_id: "D1", quote: fromEvent ? '"Service Commencement Date" means the first day on which Supplier performs deliveries for Customer.' : 'This Agreement is made on 20 March 2025 (the "Effective Date")' },
      initial_term_number: 24, initial_term_unit: "months", fixed_end_date: "",
      initial_term_evidence: { doc_id: "D1", quote: `This Agreement continues for an initial term of twenty-four (24) months from the ${fromEvent ? "Service Commencement Date" : "Effective Date"}.` },
    },
    renewal: { mechanism: "automatic", renewal_term_number: 12, renewal_term_unit: "months", if_no_one_acts: "It renews for another twelve months.", evidence: { doc_id: "D1", quote: "this Agreement shall renew automatically for successive periods of twelve (12) months" } },
    notice: { period_number: 90, period_unit: "days", purpose: "to_prevent_renewal", counted_back_from: "end_of_current_term", who_may_give: "either_party", evidence: { doc_id: "D1", quote: "unless either party gives written notice of non-renewal at least ninety (90) days before the end of the then-current term" }, delivery_methods: "Registered post.", email_is_valid: "no", deemed_receipt_number: 3, deemed_receipt_unit: "business_days", notice_address: "", delivery_evidence: { doc_id: "D1", quote: "A notice must be sent by registered post and is deemed received three (3) business days after posting." } },
    price_on_renewal: { rule: "not_addressed", cap_percent: 0, summary: "", evidence: { doc_id: "", quote: "" } },
    exit_rights: { customer_can_terminate_for_convenience: "not_stated", convenience_notice_number: 0, convenience_notice_unit: "none", summary: "", evidence: { doc_id: "", quote: "" } },
    precedence: { rule: "not_stated", summary: "", evidence: { doc_id: "", quote: "" } },
    changes_by_later_documents: [], conflicts: [], missing_documents: [], reader_note: "",
  };
}

const supplier = { name: "LogiCo", category: "Logistics", annualValue: 42000000, currency: "INR", owner: "Ops lead" };

test("pair A: term from the Effective Date computes alone", () => {
  const documents = [{ id: "D1", name: "MSA", text: contractText("Effective Date") }];
  const brief = buildBrief({ extraction: reading("A"), documents, supplier, today: D("2026-10-01") });
  assert.equal(brief.outcome, "confirmed");
  assert.equal(toISO(brief.dates.termEnd), "2027-03-19");
  assert.equal(toISO(brief.dates.cancelBy), "2026-12-19");
  assert.equal(brief.question, null);
  assert.equal(brief.facts.find((f) => f.key === "term_start").status, "confirmed");
});

test("pair B: term from the Service Commencement Date refuses a confirmed date and asks one question", () => {
  const documents = [{ id: "D1", name: "MSA", text: contractText("Service Commencement Date") }];
  const brief = buildBrief({ extraction: reading("B"), documents, supplier, today: D("2026-10-01") });
  assert.equal(brief.outcome, "provisional");
  assert.equal(brief.dates, null);
  assert.ok(brief.question && brief.question.id === "term_start_date");
  assert.equal(brief.blockers.filter((b) => b.type === "needs_answer").length, 1);
  // The provisional date is the signing-date reading, clearly labelled.
  assert.equal(toISO(brief.provisional.dates.cancelBy), "2026-12-19");
});

test("pair B answered: service began before signing, so procurement must confirm, then the real date appears", () => {
  const documents = [{ id: "D1", name: "MSA", text: contractText("Service Commencement Date") }];
  const answered = { answers: { term_start_date: { value: "2025-02-03", by: "Ops lead", evidenceNote: "First delivery report" } } };
  let brief = buildBrief({ extraction: reading("B"), documents, supplier, record: answered, today: D("2026-10-01") });
  assert.equal(brief.outcome, "provisional");
  assert.equal(brief.facts.find((f) => f.key === "term_start").status, "awaiting_confirmation");
  assert.equal(toISO(brief.provisional.dates.cancelBy), "2026-11-04");

  answered.answers.term_start_date.procurement = "confirmed";
  brief = buildBrief({ extraction: reading("B"), documents, supplier, record: answered, today: D("2026-10-01") });
  assert.equal(brief.outcome, "confirmed");
  assert.equal(toISO(brief.dates.termEnd), "2027-02-02");
  assert.equal(toISO(brief.dates.cancelBy), "2026-11-04");
  assert.equal(toISO(brief.dates.sendBy), "2026-10-28");
  assert.equal(toISO(brief.dates.decideBy), "2026-07-30");
  assert.equal(brief.dates.windowClosed, false);
  assert.equal(brief.silence.amount, 42000000);
});

test("pair B on 21 Nov 2026: the window has closed and the next one is shown", () => {
  const documents = [{ id: "D1", name: "MSA", text: contractText("Service Commencement Date") }];
  const record = { answers: { term_start_date: { value: "2025-02-03", by: "Ops lead", procurement: "confirmed" } } };
  const brief = buildBrief({ extraction: reading("B"), documents, supplier, record, today: D("2026-11-21") });
  assert.equal(brief.dates.windowClosed, true);
  assert.equal(toISO(brief.dates.renewsOn), "2027-02-03");
  assert.equal(toISO(brief.dates.nextTermEnd), "2028-02-02");
  assert.equal(toISO(brief.dates.nextCancelBy), "2027-11-04");
});

test("a quote that is not in the document blocks a confirmed date", () => {
  const documents = [{ id: "D1", name: "MSA", text: contractText("Effective Date") }];
  const x = reading("A");
  x.notice.evidence.quote = "either party may cancel on thirty days notice at any time";
  const brief = buildBrief({ extraction: x, documents, supplier, today: D("2026-10-01") });
  assert.equal(brief.outcome, "blocked");
  assert.equal(brief.dates, null);
  assert.ok(brief.blockers.some((b) => b.type === "unverified" && b.field === "notice_period"));
});

test("conflicting notice periods: both dates are shown and nothing is chosen silently", () => {
  const documents = [
    { id: "D1", name: "MSA", text: contractText("Effective Date") },
    { id: "D2", name: "Order Form", text: "Order Form 1. Either party may give notice of non-renewal at least thirty (30) days before the end of the then-current term." },
  ];
  const x = reading("A");
  x.conflicts = [{
    field: "notice_period", reading_a: "90 days under the main agreement", a_number: 90, a_unit: "days", a_date: "",
    evidence_a: { doc_id: "D1", quote: "at least ninety (90) days before the end of the then-current term" },
    reading_b: "30 days under the order form", b_number: 30, b_unit: "days", b_date: "",
    evidence_b: { doc_id: "D2", quote: "at least thirty (30) days before the end of the then-current term" },
    why_unresolved: "Neither document says which prevails.",
  }];
  let brief = buildBrief({ extraction: x, documents, supplier, today: D("2026-10-01") });
  assert.equal(brief.outcome, "blocked");
  assert.equal(brief.alternatives.length, 2);
  assert.deepEqual(brief.alternatives.map((a) => toISO(a.dates.cancelBy)), ["2026-12-19", "2027-02-17"]);
  // Procurement picks the main agreement's reading.
  brief = buildBrief({ extraction: x, documents, supplier, record: { resolutions: { conflicts: { notice_period: "a" } } }, today: D("2026-10-01") });
  assert.equal(brief.outcome, "confirmed");
  assert.equal(toISO(brief.dates.cancelBy), "2026-12-19");
  assert.equal(brief.facts.find((f) => f.key === "notice_period").status, "procurement_confirmed");
});

test("an initial term long past rolls forward by renewal periods and says so", () => {
  const d = computeDates({ start: D("2001-05-14"), initialNumber: 1, initialUnit: "years", mechanism: "automatic", renewalNumber: 1, renewalUnit: "years", noticeNumber: 30, noticeUnit: "days", deemedNumber: 0, deemedUnit: "none", leadDays: 30, today: D("2026-11-21") });
  assert.equal(toISO(d.termEnd), "2027-05-13");
  assert.equal(d.renewalsPassed, 25);
  assert.equal(toISO(d.cancelBy), "2027-04-13");
});

test("a fixed term with no renewal has an end date and no notice date", () => {
  const documents = [{ id: "D1", name: "MSA", text: contractText("Effective Date") }];
  const x = reading("A");
  x.renewal = { mechanism: "mutual_written_agreement", renewal_term_number: 0, renewal_term_unit: "none", if_no_one_acts: "It ends.", evidence: { doc_id: "D1", quote: "This Agreement continues for an initial term of twenty-four (24) months" } };
  x.notice.period_number = 0; x.notice.period_unit = "none"; x.notice.evidence = { doc_id: "", quote: "" };
  const brief = buildBrief({ extraction: x, documents, supplier, today: D("2026-10-01") });
  assert.equal(brief.outcome, "ends");
  assert.equal(brief.dates.cancelBy, null);
  assert.equal(toISO(brief.dates.termEnd), "2027-03-19");
  assert.equal(toISO(brief.dates.decideBy), "2026-12-19");
});

test("odd answers are caught", () => {
  assert.equal(oddStartReasons(D("2025-02-03"), D("2025-03-20"), D("2026-10-01")).length, 1);
  assert.equal(oddStartReasons(D("2025-04-14"), D("2025-03-20"), D("2026-10-01")).length, 0);
  assert.equal(oddStartReasons(D("2027-01-01"), D("2025-03-20"), D("2026-10-01")).length, 2);
});

test("cross-check: a reading that says 'ends unless renewed' but also 'silence extends it' is blocked for a person", () => {
  const documents = [{ id: "D1", name: "MSA", text: contractText("Effective Date") }];
  const r = reading("A");
  r.renewal = { ...r.renewal, mechanism: "customer_must_give_notice_to_renew", if_no_one_acts: "The agreement is extended once automatically for six months, then ends." };
  const brief = buildBrief({ extraction: r, documents, supplier, today: D("2026-10-01") });
  assert.equal(brief.outcome, "blocked");
  assert.ok(brief.hard.some((b) => b.type === "inconsistent"));
  const ok = buildBrief({ extraction: r, documents, record: { resolutions: { passages: { renewal_mechanism: "confirmed" } } }, supplier, today: D("2026-10-01") });
  assert.ok(!ok.hard.some((b) => b.type === "inconsistent"));
});

test("one-time extension: once the initial term has passed, the contract runs to the end of the extension and then ends", () => {
  const out = computeDates({ start: D("2018-01-10"), initialNumber: 12, initialUnit: "months", mechanism: "one_time_extension_then_ends", renewalNumber: 12, renewalUnit: "months", noticeNumber: 90, noticeUnit: "days", leadDays: 45, today: D("2026-11-23") });
  assert.equal(toISO(out.termEnd), "2020-01-09");
  assert.equal(out.expired, true);
  const live = computeDates({ start: D("2026-01-01"), initialNumber: 6, initialUnit: "months", mechanism: "one_time_extension_then_ends", renewalNumber: 6, renewalUnit: "months", noticeNumber: 30, noticeUnit: "days", leadDays: 30, today: D("2026-11-23") });
  assert.equal(toISO(live.termEnd), "2026-12-31");
  assert.equal(live.expired, false);
  assert.equal(live.cancelBy, null);
});

test("workflow: a notice sent by email does not count when the contract says email is not valid", async () => {
  const { workflowState } = await import("../public/js/core/workflow.js");
  const documents = [{ id: "D1", name: "MSA", text: contractText("Effective Date") }];
  const brief = buildBrief({ extraction: reading("A"), documents, supplier, today: D("2026-10-01") });
  const record = { decision: { choice: "exit", by: "Ops lead", on: "2026-10-01" }, notice: { sentOn: "2026-10-02", proof: "inbox", method: "Email" } };
  const flow = workflowState({ brief, record, supplier, people: {}, today: D("2026-10-02") });
  assert.equal(flow.label, "Notice may not count");
  const ok = workflowState({ brief, record: { ...record, notice: { ...record.notice, method: "Registered post" } }, supplier, people: {}, today: D("2026-10-02") });
  assert.equal(ok.label, "Notice valid and on time");
  // Courier is not a method this contract allows.
  const courier = workflowState({ brief, record: { ...record, notice: { ...record.notice, method: "Courier" } }, supplier, people: {}, today: D("2026-10-02") });
  assert.equal(courier.label, "Notice may not count");
  assert.match(courier.detail, /allows only registered post/);
  // Posted two working days before the deadline: deemed received after it, so it does not count.
  const late = workflowState({ brief, record: { ...record, notice: { sentOn: "2026-12-17", proof: "RP", method: "Registered post" } }, supplier, people: {}, today: D("2026-12-17") });
  assert.equal(late.label, "Notice may not count");
  assert.match(late.detail, /after the deadline of 19 Dec 2026/);
});

test("cross-check: 'is not extended or renewed' is not a contradiction for a fixed term", () => {
  const documents = [{ id: "D1", name: "MSA", text: contractText("Effective Date") }];
  const r = reading("A");
  r.renewal = { ...r.renewal, mechanism: "no_renewal_fixed_term", if_no_one_acts: "The agreement ends on 31 December 2026 and is not extended or renewed." };
  const brief = buildBrief({ extraction: r, documents, supplier, today: D("2026-10-01") });
  assert.ok(!brief.hard.some((b) => b.type === "inconsistent"));
  r.renewal.if_no_one_acts = "It is extended once for six months, then ends.";
  r.renewal.mechanism = "mutual_written_agreement";
  const bad = buildBrief({ extraction: r, documents, supplier, today: D("2026-10-01") });
  assert.ok(bad.hard.some((b) => b.type === "inconsistent"));
});

test("conflict: the chosen reading shows its own passage, and the rejected one stays visible", () => {
  const documents = [{ id: "D1", name: "MSA", text: contractText("Effective Date") + "\nOrder Form: notice of non-renewal at least thirty (30) days before the end of the term." }];
  const r = reading("A");
  r.conflicts = [{ field: "notice_period", reading_a: "90 days, MSA", a_number: 90, a_unit: "days", a_date: "", evidence_a: { doc_id: "D1", quote: "unless either party gives written notice of non-renewal at least ninety (90) days before the end of the then-current term" }, reading_b: "30 days, order form", b_number: 30, b_unit: "days", b_date: "", evidence_b: { doc_id: "D1", quote: "notice of non-renewal at least thirty (30) days before the end of the term" }, why_unresolved: "Both claim precedence." }];
  const record = { resolutions: { conflicts: { notice_period: { side: "b", reason: "Order form is the later, specific document", by: "Priya Menon", on: "2026-10-01", legal: true } } } };
  const brief = buildBrief({ extraction: r, documents, record, supplier, today: D("2026-10-01") });
  const f = brief.facts.find((x) => x.key === "notice_period");
  assert.match(f.evidence.quote, /thirty \(30\) days/);
  assert.match(f.rejected.evidence.quote, /ninety \(90\) days/);
  assert.match(f.note, /chosen by Priya Menon/);
  assert.equal(toISO(brief.dates.cancelBy), "2027-02-17");
});

test("decision: an amendment that changes the terms reopens the decision; renew on a contract that ends needs a signed extension", async () => {
  const { workflowState, decisionBasis } = await import("../public/js/core/workflow.js");
  const documents = [{ id: "D1", name: "MSA", text: contractText("Effective Date") }];
  const before = buildBrief({ extraction: reading("A"), documents, supplier, today: D("2026-10-01") });
  const decision = { choice: "renew", by: "Ops lead", on: "2026-10-01", basis: decisionBasis(before) };
  assert.equal(workflowState({ brief: before, record: { decision }, supplier, people: {}, today: D("2026-10-01") }).stage, "done");
  const r = reading("A");
  r.renewal = { ...r.renewal, mechanism: "mutual_written_agreement", renewal_term_number: 0, renewal_term_unit: "none", if_no_one_acts: "It ends at the end of the term." };
  const after = buildBrief({ extraction: r, documents, supplier, today: D("2026-10-01") });
  const reopened = workflowState({ brief: after, record: { decision }, supplier, people: {}, today: D("2026-10-01") });
  assert.equal(reopened.label, "Terms changed since the decision");
  const again = workflowState({ brief: after, record: { decision: { ...decision, basis: decisionBasis(after) } }, supplier, people: {}, today: D("2026-10-01") });
  assert.equal(again.label, "Signed extension needed");
});

test("workflow scenarios on the saved real readings all hold", async () => {
  const { runScenarios } = await import("../public/js/core/scenarios.js");
  for (const r of runScenarios()) assert.ok(r.pass, `${r.id}: ${r.got}`);
});

test("fixed calendar deadlines: the day in the year the term ends, or the earlier of that and a period", async () => {
  const { fixedDayOnOrBefore } = await import("../public/js/core/brief.js");
  // Fleet leasing stress case: term ends 31 Dec 2027, notice on or before 30 September of that year.
  assert.equal(toISO(fixedDayOnOrBefore(D("2027-12-31"), "09-30")), "2027-09-30");
  // A term ending 31 Mar: 30 September of that year is after the end, so the year before applies.
  assert.equal(toISO(fixedDayOnOrBefore(D("2027-03-31"), "09-30")), "2026-09-30");
  // Sykes: yearly terms to 31 Dec, notice on or before 1 October; with a 90-day period as well, the earlier wins.
  const d = computeDates({ start: D("1998-01-01"), initialNumber: 1, initialUnit: "years", mechanism: "automatic", renewalNumber: 1, renewalUnit: "years", noticeNumber: 90, noticeUnit: "days", deemedNumber: 0, deemedUnit: "none", leadDays: 30, today: D("2026-11-23"), fixedMonthDay: "10-01" });
  assert.equal(toISO(d.termEnd), "2026-12-31");
  assert.equal(toISO(d.cancelBy), "2026-10-01");
  assert.equal(d.windowClosed, true);
  assert.equal(toISO(d.nextCancelBy), "2027-10-01");
});

test("sizing for the 2,500-supplier company adds up from its stated assumptions", async () => {
  const { sizeUp } = await import("../public/js/core/sizing.js");
  const s = sizeUp();
  assert.equal(s.autoContracts, 1000);
  assert.equal(s.due, 600);
  assert.equal(s.perMonth, 50);
  assert.equal(s.silent, 120);
  assert.equal(s.committed, 18e7); // ₹18 crore
  assert.equal(s.avoidable, 81e5); // ₹81 lakh
  assert.equal(s.dueValue, 90e7); // ₹90 crore
  assert.equal(s.questions, 210);
  assert.equal(s.hours, 28);
  assert.equal(s.legal, 30);
  assert.equal(s.backlogCost, 20000);
  assert.equal(s.yearlyReadCost, 4000);
});

test("JSON repair: unescaped quotes from contract text, raw line breaks and trailing commas", async () => {
  const { extractJson } = await import("../server/normalize.js");
  const broken = '{"evidence": {"quote": "the term of this Agreement (the "Term") shall be one year", "doc_id": "D1",}, "note": "line one\nline two"}';
  const x = extractJson(broken);
  assert.equal(x.evidence.quote, 'the term of this Agreement (the "Term") shall be one year');
  assert.equal(x.evidence.doc_id, "D1");
  assert.equal(x.note, "line one\nline two");
  assert.deepEqual(extractJson('```json\n{"a": 1}\n```'), { a: 1 });
});
