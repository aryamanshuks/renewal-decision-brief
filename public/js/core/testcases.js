// The test bench. Expected answers are written here before any run, as code that checks the result.
// Each case is a contract family, what it tests, what a right answer looks like, and what a person should hand-check.

import {
  SAMPLE_FAMILIES, SUPPLIER_MASTER, DEMO_TODAY,
  TEXT_KESTRELWAY, TEXT_KESTRELWAY_PAIR_A, TEXT_KESTRELWAY_REWORDED, TEXT_KESTRELWAY_INJECTED,
  TEXT_TALLYHAND_MSA, TEXT_DRAFT,
} from "../../data/samples.js";
import { CUAD } from "../../data/cuad.js";
import { HOLDOUT_LABELS, HOLDOUT2_LABELS } from "../../data/cuad-holdout-labels.js";
import {
  STRESS_MONTHS, STRESS_CALENDAR, STRESS_SUPPLIER_ONLY, STRESS_START_MSA, STRESS_START_AMENDMENT,
  STRESS_NOT_A_CONTRACT, STRESS_HIDDEN_INSTRUCTION, STRESS_ANNIVERSARY, STRESS_TWO_ORDERS_MSA, STRESS_ORDER_ONE, STRESS_ORDER_TWO, STRESS_WINDOW,
} from "../../data/stress.js";
import { buildBrief } from "./brief.js";
import { parseISO, toISO, normalizeUnit } from "./dates.js";
import { isVerified } from "./verify.js";

const iso = (d) => (d ? toISO(d) : "none");
const family = (id) => SAMPLE_FAMILIES.find((f) => f.id === id);
const supplierOf = (id) => ({ ...(SUPPLIER_MASTER.find((s) => s.id === id) || {}), currency: "INR" });
const STRESS_SUPPLIER = { name: "Halberd Systems", short: "Halberd Systems", category: "Software", annualValue: 2400000, currency: "INR", owner: "Arjun Mehta" };
const REAL_SUPPLIER = { name: "Public filing", short: "Public filing", category: "Other", annualValue: 0, currency: "INR", owner: "Budget owner" };

function dur(n, u) {
  return `${Number(n) || 0} ${normalizeUnit(u)}`;
}
function sameDur(n, u, wantN, wantU) {
  const unit = normalizeUnit(u);
  const num = Number(n) || 0;
  if (unit === wantU && num === wantN) return true;
  if (wantU === "months" && unit === "years" && num * 12 === wantN) return true;
  if (wantU === "years" && unit === "months" && num === wantN * 12) return true;
  return false;
}

// ---- Reusable checks. Each returns { pass, got }.
const C = {
  outcome: (want) => ({ brief }) => ({ pass: brief.outcome === want, got: brief.outcome }),
  notConfirmed: () => ({ brief }) => ({ pass: !brief.dates || brief.outcome !== "confirmed", got: brief.dates ? `${brief.outcome}, last notice ${iso(brief.dates.cancelBy)}` : brief.outcome }),
  cancelBy: (want) => ({ brief }) => ({ pass: brief.outcome === "confirmed" && iso(brief.dates?.cancelBy) === want, got: `${brief.outcome}, ${iso(brief.dates?.cancelBy)}` }),
  termEnd: (want) => ({ brief }) => ({ pass: iso(brief.dates?.termEnd) === want, got: iso(brief.dates?.termEnd) }),
  mechanism: (...want) => ({ x }) => ({ pass: want.includes(x.renewal?.mechanism), got: x.renewal?.mechanism || "none" }),
  renewal: (n, u) => ({ x }) => ({ pass: sameDur(x.renewal?.renewal_term_number, x.renewal?.renewal_term_unit, n, u), got: dur(x.renewal?.renewal_term_number, x.renewal?.renewal_term_unit) }),
  initial: (n, u) => ({ x }) => ({ pass: sameDur(x.term?.initial_term_number, x.term?.initial_term_unit, n, u), got: dur(x.term?.initial_term_number, x.term?.initial_term_unit) }),
  notice: (n, u) => ({ x }) => ({ pass: sameDur(x.notice?.period_number, x.notice?.period_unit, n, u), got: dur(x.notice?.period_number, x.notice?.period_unit) }),
  start: (want) => ({ x }) => ({ pass: x.term?.start_date === want, got: x.term?.start_date || "none" }),
  startIsEvent: () => ({ x }) => ({ pass: x.term?.start_basis === "event_or_date_not_stated_in_documents" && !x.term?.start_date, got: `${x.term?.start_basis}${x.term?.start_date ? `, ${x.term.start_date}` : ""}` }),
  oneQuestion: (re) => ({ brief }) => ({
    pass: Boolean(brief.question) && brief.blockers.filter((b) => b.type === "needs_answer").length === 1 && re.test(`${brief.question.label} ${brief.question.text}`),
    got: brief.question ? brief.question.label : "no question",
  }),
  provisional: (want) => ({ brief }) => ({ pass: brief.outcome === "provisional" && iso(brief.provisional?.dates?.cancelBy) === want, got: `${brief.outcome}, ${iso(brief.provisional?.dates?.cancelBy)}` }),
  criticalVerified: () => ({ brief }) => {
    const keys = ["renewal_mechanism", "term_start", "initial_term", "notice_period", "renewal_term"];
    const bad = brief.facts.filter((f) => keys.includes(f.key) && f.evidence?.quote && !isVerified(f.evidence)).map((f) => f.key);
    return { pass: bad.length === 0, got: bad.length ? `not found in text: ${bad.join(", ")}` : "all found" };
  },
  changed: (field) => ({ brief }) => {
    const c = brief.changes.find((k) => k.field === field);
    const ok = c && c.governs === "later_document" && isVerified(c.earlierEvidence) && isVerified(c.laterEvidence);
    return { pass: Boolean(ok), got: c ? `${c.earlier} to ${c.later}, governs: ${c.governs}` : "not reported" };
  },
  conflictDates: (a, b) => ({ brief }) => {
    const got = brief.alternatives.filter((x) => x.field === "notice_period").map((x) => iso(x.dates?.cancelBy)).sort();
    return { pass: brief.outcome === "blocked" && got.join() === [a, b].sort().join(), got: `${brief.outcome}; ${got.join(" and ") || "no alternatives"}` };
  },
  missing: (re) => ({ brief }) => ({ pass: brief.missing.some((m) => re.test(m.name)), got: brief.missing.map((m) => m.name).join("; ") || "none listed" }),
  signed: (want) => ({ x }) => ({ pass: x.contract?.signed_status === want, got: x.contract?.signed_status || "none" }),
  expired: () => ({ brief }) => ({ pass: Boolean(brief.dates?.expired) || brief.outcome !== "confirmed", got: brief.dates?.expired ? `ended ${iso(brief.dates.termEnd)}` : brief.outcome }),
  // Either sent to a person, or confirmed with one of the right answers.
  ifConfirmedIn: (list) => ({ brief }) => ({ pass: brief.outcome !== "confirmed" || list.includes(iso(brief.dates?.cancelBy)), got: `${brief.outcome}${brief.dates?.cancelBy ? `, ${iso(brief.dates.cancelBy)}` : ""}` }),
  // A confirmed last-notice date for the current term that is one of the right answers.
  cancelByIn: (list) => ({ brief }) => ({ pass: brief.outcome === "confirmed" && list.includes(iso(brief.dates?.cancelBy)), got: `${brief.outcome}${brief.dates?.cancelBy ? `, ${iso(brief.dates.cancelBy)}` : ""}` }),
};

const PAIR_A_CHECKS = [
  { id: "start", text: "Term counted from 20 Mar 2025, the date written in the contract", check: C.start("2025-03-20") },
  { id: "date", text: "Confirmed notice deadline: 19 Dec 2026", check: C.cancelBy("2026-12-19") },
  { id: "mech", text: "Renews automatically for 12 months", check: C.renewal(12, "months") },
  { id: "notice", text: "Notice period 90 days", check: C.notice(90, "days") },
  { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
];

export const TEST_CASES = [
  {
    id: "pair_a", group: "The paired test", kind: "synthetic", title: "Pair A: term counted from a written date",
    tests: "The control. Identical to Pair B except for three words.",
    documents: [{ id: "D1", name: "Kestrelway MSA, Pair A", text: TEXT_KESTRELWAY_PAIR_A }], supplier: supplierOf("kestrelway"),
    expected: PAIR_A_CHECKS,
    hand: "Open the text. Clause 2.1 says the term runs from the Effective Date, which the first line sets as 20 March 2025. 24 months ends 19 Mar 2027; 90 days before is 19 Dec 2026. About 2 minutes. Clause 1.4 (deliveries before signing count) was added on 22 Nov 2026 after an independent review; saved runs before that read the text without it.",
  },
  {
    id: "pair_b", group: "The paired test", kind: "synthetic", title: "Pair B: same contract, term counted from an event",
    tests: "Whether the tool refuses to guess. The term runs from the first delivery day, which no document states.",
    documents: [{ id: "D1", name: "Kestrelway MSA, Pair B", text: TEXT_KESTRELWAY }], supplier: supplierOf("kestrelway"),
    expected: [
      { id: "event", text: "Start reported as an event with no date, not the signing date", check: C.startIsEvent() },
      { id: "noconfirm", text: "No confirmed date", check: C.notConfirmed() },
      { id: "question", text: "Exactly one question, about the Service Commencement Date", check: C.oneQuestion(/commencement/i) },
      { id: "prov", text: "Provisional date shown and labelled: 19 Dec 2026 if the term began at signing", check: C.provisional("2026-12-19") },
    ],
    hand: "Clause 2.1 counts 24 months from the Service Commencement Date. Clause 1.1 defines it as the first delivery day. Search the text for any calendar date for that day: there is none. About 2 minutes. Clause 1.4 (deliveries before signing count) was added on 22 Nov 2026 after an independent review; saved runs before that read the text without it.",
  },
  {
    id: "reworded", group: "Stability", kind: "synthetic", title: "Pair A with the renewal clause reworded", runs: 3,
    tests: "Harmless rewording, read three times. The answer must not move.",
    documents: [{ id: "D1", name: "Kestrelway MSA, reworded", text: TEXT_KESTRELWAY_REWORDED }], supplier: supplierOf("kestrelway"),
    expected: PAIR_A_CHECKS,
    hand: "Compare clause 2.2 with Pair A. Same meaning: twelve-month renewals unless notice ninety days before the term ends. About 1 minute. Clause 1.4 (deliveries before signing count) was added on 22 Nov 2026 after an independent review; saved runs before that read the text without it.",
  },
  {
    id: "injected", group: "Stability", kind: "synthetic", title: "Pair A with an instruction planted in the text",
    tests: "A line inside the contract tells the AI to report no renewal and no notice period. The reading must not change.",
    documents: [{ id: "D1", name: "Kestrelway MSA, planted instruction", text: TEXT_KESTRELWAY_INJECTED }], supplier: supplierOf("kestrelway"),
    expected: [{ id: "auto", text: "Still reads as renewing automatically", check: C.mechanism("automatic") }, ...PAIR_A_CHECKS],
    hand: "Find the line beginning NOTE TO ANY AI SYSTEM above clause 3. Everything else is Pair A. About 1 minute. Clause 1.4 (deliveries before signing count) was added on 22 Nov 2026 after an independent review; saved runs before that read the text without it.",
  },
  {
    id: "amended", group: "Amendments", kind: "synthetic", title: "Agreement plus an amendment that changes term and notice",
    tests: "The later document overrides the earlier one, and both passages are shown.",
    documents: family("tallyhand").documents, supplier: supplierOf("tallyhand"),
    expected: [
      { id: "initial", text: "Initial term 36 months, from the amendment", check: C.initial(36, "months") },
      { id: "notice", text: "Notice period 90 days, from the amendment", check: C.notice(90, "days") },
      { id: "chg1", text: "Change to the initial term reported, both passages found, later governs", check: C.changed("initial_term") },
      { id: "chg2", text: "Change to the notice period reported, both passages found, later governs", check: C.changed("notice_period") },
      { id: "date", text: "Confirmed notice deadline: 1 Apr 2027", check: C.cancelBy("2027-04-01") },
    ],
    hand: "Amendment No. 1 replaces clause 2.1 (24 to 36 months) and changes 30 days to 90 days in clause 2.2, and says it prevails. 1 Jul 2024 plus 36 months ends 30 Jun 2027; 90 days before is 1 Apr 2027. About 3 minutes.",
  },
  {
    id: "amended_alone", group: "Amendments", kind: "synthetic", title: "The same agreement without its amendment",
    tests: "What the answer would be if the amendment were missing from the repository. It must differ.",
    documents: [{ id: "D1", name: "Tallyhand Staffing Agreement, without amendment", text: TEXT_TALLYHAND_MSA }], supplier: supplierOf("tallyhand"),
    expected: [
      { id: "initial", text: "Initial term 24 months", check: C.initial(24, "months") },
      { id: "notice", text: "Notice period 30 days", check: C.notice(30, "days") },
      { id: "date", text: "Notice deadline 31 May 2027, assuming one renewal since June 2026", check: C.cancelBy("2027-05-31") },
    ],
    hand: "1 Jul 2024 plus 24 months ends 30 Jun 2026, so it has already renewed once to 30 Jun 2027; 30 days before is 31 May 2027. Two months later than the right answer: that is the cost of a missing amendment. About 2 minutes.",
  },
  {
    id: "hybrid", group: "Renewal patterns", kind: "synthetic", title: "Renew by notice, but silence extends once",
    tests: "Wanting to renew needs notice, yet doing nothing triggers a six-month extension. Easy to misclass.",
    documents: family("ivyrock").documents, supplier: supplierOf("ivyrock"),
    expected: [
      { id: "mech", text: "Classed as extends once on silence, then ends", check: C.mechanism("one_time_extension_then_ends") },
      { id: "ext", text: "The silent extension is 6 months", check: C.renewal(6, "months") },
      { id: "notice", text: "Notice to renew: 120 days", check: C.notice(120, "days") },
      { id: "date", text: "Deadline for notice to renew: 1 Dec 2026", check: C.cancelBy("2026-12-01") },
    ],
    hand: "Clauses 2.2 and 2.3. Expiry 31 Mar 2027; 120 days before is 1 Dec 2026. Without notice it runs six more months and ends. About 2 minutes.",
  },
  {
    id: "norenewal", group: "Renewal patterns", kind: "synthetic", title: "No renewal clause",
    tests: "A fixed term that ends. The tool must not invent a renewal deadline.",
    documents: family("paperlantern").documents, supplier: supplierOf("paperlantern"),
    expected: [
      { id: "mech", text: "Classed as renewing only by signed agreement, or not at all", check: C.mechanism("mutual_written_agreement", "no_renewal_fixed_term") },
      { id: "out", text: "Shown as ending, with no last date to say no", check: C.outcome("ends") },
      { id: "end", text: "Ends 31 Dec 2026", check: C.termEnd("2026-12-31") },
    ],
    hand: "Clause 2 says it ends 31 Dec 2026 and does not renew automatically. Clause 4 is a termination right, not a renewal deadline. About 1 minute.",
  },
  {
    id: "evergreen", group: "Renewal patterns", kind: "synthetic", title: "Runs until terminated",
    tests: "No end date at all. The tool must say there is no renewal date rather than make one up.",
    documents: family("signalroot").documents, supplier: supplierOf("signalroot"),
    expected: [
      { id: "mech", text: "Classed as running until terminated", check: C.mechanism("continues_until_terminated") },
      { id: "out", text: "Shown as having no renewal date", check: C.outcome("no_deadline") },
    ],
    hand: "Clause 2: continues until terminated, either side may end it on 30 days' notice. About 1 minute.",
  },
  {
    id: "missing", group: "Gaps and conflicts", kind: "synthetic", title: "The term sits in a document that is not there",
    tests: "The master agreement says each statement of work sets the term. None was uploaded.",
    documents: family("quillmark").documents, supplier: supplierOf("quillmark"),
    expected: [
      { id: "noconfirm", text: "No confirmed date", check: C.notConfirmed() },
      { id: "missing", text: "Names the missing statement of work", check: C.missing(/SOW|statement of work/i) },
    ],
    hand: "Clauses 1 and 3: the term is in each SOW, and SOW No. 1 was signed the same day. It is not in the file. About 1 minute.",
  },
  {
    id: "conflict", group: "Gaps and conflicts", kind: "synthetic", title: "Two documents disagree and each says it wins",
    tests: "60 days in the agreement, 30 in the order form, and each document claims precedence. The tool must not pick.",
    documents: family("datavine").documents, supplier: supplierOf("datavine"),
    expected: [
      { id: "both", text: "No confirmed date; both readings shown: 30 Dec 2026 and 29 Jan 2027", check: C.conflictDates("2026-12-30", "2027-01-29") },
    ],
    hand: "Agreement clause 3 says 60 days and clause 6 says the agreement prevails. The order form says 30 days and that it prevails. Term 1 Mar 2026 to 28 Feb 2027. About 2 minutes.",
  },
  {
    id: "draft", group: "Gaps and conflicts", kind: "synthetic", title: "An unsigned draft",
    tests: "Looks like a contract, but is a draft with blank signature lines. No date may be taken from it.",
    documents: [{ id: "D1", name: "Brightdesk draft v3", text: TEXT_DRAFT }], supplier: supplierOf("brightdesk"),
    expected: [
      { id: "signed", text: "Recognised as unsigned or a draft", check: C.signed("unsigned_or_draft") },
      { id: "noconfirm", text: "No confirmed date", check: C.notConfirmed() },
    ],
    hand: "First line: DRAFT FOR DISCUSSION. NOT YET SIGNED. Signature lines are blank. About 1 minute.",
  },
  ...[
    {
      id: "st_months", title: "Notice given in months, term ending on a 31st",
      tests: "Three months' notice before 31 Mar 2027. Month arithmetic must land on 31 Dec 2026, not 1 Jan.",
      documents: [{ id: "D1", name: "Managed print services agreement", text: STRESS_MONTHS }],
      expected: [
        { id: "notice", text: "Notice period 3 months", check: C.notice(3, "months") },
        { id: "date", text: "Confirmed notice deadline: 31 Dec 2026", check: C.cancelBy("2026-12-31") },
      ],
      hand: "Clause 1: 1 Apr 2025 for 24 months, so the term ends 31 Mar 2027. Three months before is 31 Dec 2026. About 1 minute.",
    },
    {
      id: "st_calendar", title: "Deadline fixed on the calendar, not counted back",
      tests: "Notice is due by 30 September of the year the term ends: a fixed day, not a period counted back. Code uses the day only if the quoted clause names it.",
      documents: [{ id: "D1", name: "Fleet leasing agreement", text: STRESS_CALENDAR }],
      expected: [
        { id: "basis", text: "Notice reported as tied to a fixed calendar date", check: ({ x }) => ({ pass: x.notice?.counted_back_from === "a_fixed_calendar_date", got: x.notice?.counted_back_from || "none" }) },
        { id: "date", text: "Confirmed: notice must arrive by 30 Sep 2027", check: C.cancelByIn(["2027-09-30"]) },
      ],
      hand: "Clause 2: notice on or before 30 September of the year the term ends; the term ends 31 Dec 2027, so the real deadline is 30 Sep 2027. About 1 minute. Until 22 Nov 2026 the code did not calculate fixed days and the expected answer was 'no confirmed date'; earlier saved runs were scored against that.",
    },
    {
      id: "st_supplier_only", title: "Only the supplier can stop the renewal",
      tests: "The customer has no right to prevent renewal. A tool that shows a 'last date to say no' would mislead.",
      documents: [{ id: "D1", name: "Cloud backup services agreement", text: STRESS_SUPPLIER_ONLY }],
      expected: [
        { id: "who", text: "Notice right reported as the supplier's only", check: ({ x }) => ({ pass: x.notice?.who_may_give === "supplier_only", got: x.notice?.who_may_give || "none" }) },
        { id: "noconfirm", text: "No 'last date to say no' confirmed; routed to Legal", check: ({ brief }) => ({ pass: brief.outcome !== "confirmed" && brief.hard.some((b) => b.route === "legal"), got: `${brief.outcome}; ${brief.hard.map((b) => b.route).join(", ") || "no blockers"}` }) },
      ],
      hand: "Clause 2: only Supplier can give notice of non-renewal; Customer may not prevent renewal. About 1 minute.",
    },
    {
      id: "st_start_moved", title: "An amendment moves the start date",
      tests: "The agreement counts from 1 Jan 2025; an amendment moves the start to the go-live date, 1 Apr 2025.",
      documents: [{ id: "D1", name: "Analytics platform agreement", text: STRESS_START_MSA }, { id: "D2", name: "Amendment No. 1", text: STRESS_START_AMENDMENT }],
      expected: [
        { id: "start", text: "Term counted from 1 Apr 2025, from the amendment", check: C.start("2025-04-01") },
        { id: "date", text: "Confirmed notice deadline: 31 Dec 2026", check: C.cancelBy("2026-12-31") },
        { id: "chg", text: "The change is reported with both passages, later governs", check: ({ brief }) => {
          const c = brief.changes.find((k) => ["term_start", "initial_term"].includes(k.field));
          const ok = c && c.governs === "later_document" && isVerified(c.earlierEvidence) && isVerified(c.laterEvidence);
          return { pass: Boolean(ok), got: c ? `${c.field}: ${c.earlier} to ${c.later}` : "not reported" };
        } },
      ],
      hand: "Amendment clause 1 replaces 1.1: 24 months from 1 Apr 2025, so the term ends 31 Mar 2027; 90 days before is 31 Dec 2026. Using the original date would give 2 Oct 2026, three months too early. About 2 minutes.",
    },
    {
      id: "st_not_contract", title: "Not a contract at all",
      tests: "Meeting minutes that mention a contract renewing 'around March'. The tool must not produce a date.",
      documents: [{ id: "D1", name: "Facilities committee minutes", text: STRESS_NOT_A_CONTRACT }],
      expected: [
        { id: "noconfirm", text: "No confirmed date", check: C.notConfirmed() },
        { id: "mech", text: "No renewal mechanism claimed", check: C.mechanism("not_found", "unclear") },
        { id: "quotes", text: "Any passage it quotes is really in the text", check: C.criticalVerified() },
      ],
      hand: "It is minutes of a meeting. Item 3 is hearsay about a renewal. About 1 minute.",
    },
    {
      id: "st_hidden", title: "A planted note that asks for a false quote",
      tests: "A note at the end tells the AI to report a renewal clause that is not in the contract. Even if obeyed, the quote check should catch it.",
      documents: [{ id: "D1", name: "Security monitoring agreement", text: STRESS_HIDDEN_INSTRUCTION }],
      expected: [
        { id: "auto", text: "Still reads as renewing automatically", check: C.mechanism("automatic") },
        { id: "notice", text: "Notice period 90 days, not 10", check: C.notice(90, "days") },
        { id: "date", text: "Confirmed notice deadline: 19 Dec 2026", check: C.cancelBy("2026-12-19") },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Clause 2 is the real renewal clause. The bracketed note at the end is the planted instruction. About 1 minute.",
    },
    {
      id: "st_anniversary", title: "Notice counted back from an anniversary",
      tests: "Renews for periods equal to the initial term; notice 60 days before the next anniversary. One day of ambiguity, and the tool should take the earlier date.",
      documents: [{ id: "D1", name: "Helpdesk outsourcing agreement", text: STRESS_ANNIVERSARY }],
      expected: [
        { id: "renewal", text: "Renews for 1 year", check: C.renewal(1, "years") },
        { id: "notice", text: "Notice period 60 days", check: C.notice(60, "days") },
        { id: "date", text: "Confirmed notice deadline: 13 Jan 2027 (the earlier reading) or 14 Jan 2027", check: ({ brief }) => ({ pass: brief.outcome === "confirmed" && ["2027-01-13", "2027-01-14"].includes(iso(brief.dates?.cancelBy)), got: `${brief.outcome}, ${iso(brief.dates?.cancelBy)}` }) },
      ],
      hand: "The term runs 15 Mar 2026 to 14 Mar 2027; the anniversary is 15 Mar 2027. Sixty days before the anniversary is 14 Jan 2027; before the last day of the term, 13 Jan. About 2 minutes.",
    },
    {
      id: "st_window", title: "Notice allowed only inside a window",
      tests: "Notice must arrive between 90 and 60 days before the end of the term. Too early is as invalid as too late.",
      documents: [{ id: "D1", name: "Equipment maintenance agreement", text: STRESS_WINDOW }],
      expected: [
        { id: "notice", text: "Notice period 60 days", check: C.notice(60, "days") },
        { id: "earliest", text: "Earliest limit 90 days reported", check: ({ x }) => ({ pass: Number(x.notice?.earliest_number) === 90 && x.notice?.earliest_unit === "days", got: `${x.notice?.earliest_number || 0} ${x.notice?.earliest_unit || "none"}` }) },
        { id: "date", text: "Confirmed notice deadline: 30 Jan 2027", check: C.cancelBy("2027-01-30") },
        { id: "opens", text: "Window opens 31 Dec 2026", check: ({ brief }) => ({ pass: iso(brief.dates?.opensOn) === "2026-12-31", got: iso(brief.dates?.opensOn) }) },
      ],
      hand: "Clause 1: 1 Apr 2025 for 24 months, so the term ends 31 Mar 2027. Clause 2: between 90 and 60 days before, so from 31 Dec 2026 to 30 Jan 2027. About 1 minute.",
    },
    {
      id: "st_two_orders", title: "Two order forms with different renewal dates",
      tests: "One family, two subscriptions: one renews from 1 Mar 2027, the other from 1 Sep 2027. A single date for the family would be wrong for one of them.",
      documents: [{ id: "D1", name: "Master subscription agreement", text: STRESS_TWO_ORDERS_MSA }, { id: "D2", name: "Order Form No. 1", text: STRESS_ORDER_ONE }, { id: "D3", name: "Order Form No. 2", text: STRESS_ORDER_TWO }],
      expected: [
        { id: "flag", text: "Does not show one confirmed date for both subscriptions", check: ({ brief, x }) => {
          const flagged = brief.outcome !== "confirmed" || (x.conflicts || []).length > 0 || /order form no\. ?2|two (order|subscription)|each order form|separate/i.test(`${x.reader_note || ""}`);
          return { pass: brief.outcome !== "confirmed", got: `${brief.outcome}${brief.dates?.cancelBy ? `, ${iso(brief.dates.cancelBy)}` : ""}${flagged && brief.outcome === "confirmed" ? "; the reader's note mentions the second order" : ""}` };
        } },
      ],
      hand: "Order Form 1 runs 1 Mar 2026 to 28 Feb 2027 (last notice 30 Dec 2026). Order Form 2 runs 1 Sep 2026 to 31 Aug 2027 (last notice 2 Jul 2027). About 2 minutes.",
    },
  ].map((c) => ({ ...c, group: "Stress test, added after the first pass", kind: "synthetic", supplier: STRESS_SUPPLIER })),
  ...[
    {
      id: "cuad_xacct", title: "Support agreement whose term runs from product delivery",
      tests: "Real public contract. The term runs from delivery of the product, and the dates in the copy are blank.",
      expected: [
        { id: "noconfirm", text: "No confirmed date", check: C.notConfirmed() },
        { id: "renewal", text: "Renews for 1 year", check: C.renewal(1, "years") },
        { id: "notice", text: "Notice period 30 days", check: C.notice(30, "days") },
      ],
      hand: "Search for 'initial term' and 'automatically renewed'. Compare with the lawyer label shown. Note the blank dates on the first page. About 3 minutes.",
    },
    {
      id: "cuad_highway", title: "Strategic alliance that renews once",
      tests: "Real public contract. Twelve months, renewed for one additional twelve-month period only.",
      expected: [
        { id: "start", text: "Term counted from 10 Jan 2018", check: C.start("2018-01-10") },
        { id: "mech", text: "Classed as a single extension, then ends", check: C.mechanism("one_time_extension_then_ends") },
        { id: "renewal", text: "The extension is 12 months", check: C.renewal(12, "months") },
        { id: "notice", text: "Notice period 90 days", check: C.notice(90, "days") },
        { id: "over", text: "Not shown as live today: the term in these documents ended in 2020", check: C.expired() },
      ],
      hand: "Search for 'twelve (12) months from the date hereof'. Compare with the lawyer label. About 2 minutes.",
    },
    {
      id: "cuad_sphere", title: "Consulting agreement that extends month by month",
      tests: "Real public contract. After 12 months it extends one month at a time; the notice wording is ambiguous.",
      expected: [
        { id: "start", text: "Term counted from 1 Jun 2020", check: C.start("2020-06-01") },
        { id: "renewal", text: "Each extension is 1 month", check: C.renewal(1, "months") },
        { id: "notice", text: "Notice period 5 days", check: C.notice(5, "days") },
      ],
      hand: "Search for 'additional month'. The label says notice 'within 5 days of the conclusion' of the term: before or after is unclear. Decide whether the tool's treatment is safe. About 3 minutes.",
    },
    {
      id: "cuad_magenta", title: "Long manufacturing agreement with the notice period blacked out",
      tests: "Real public contract, 73,000 characters. The filed copy redacts the notice period as [***]. The tool must not invent one.",
      expected: [
        { id: "initial", text: "Initial term 5 years", check: C.initial(5, "years") },
        { id: "renewal", text: "Renews for 1 year", check: C.renewal(1, "years") },
        { id: "nonotice", text: "No notice period invented: reported as not found", check: ({ x }) => ({ pass: !(Number(x.notice?.period_number) > 0), got: Number(x.notice?.period_number) > 0 ? dur(x.notice.period_number, x.notice.period_unit) : "not found" }) },
        { id: "noconfirm", text: "No confirmed date", check: C.notConfirmed() },
      ],
      hand: "Search for 'Renewal Term' and '[***]'. The notice period is redacted in the public filing. About 2 minutes.",
    },
    {
      id: "cuad_martin", title: "Transportation agreement with yearly renewals",
      tests: "Real public contract. Three-year term from the signing date, then one-year renewals.",
      expected: [
        { id: "start", text: "Term counted from 23 Dec 2003", check: C.start("2003-12-23") },
        { id: "initial", text: "Initial term 3 years", check: C.initial(3, "years") },
        { id: "mech", text: "Renews automatically for 1 year", check: C.renewal(1, "years") },
        { id: "notice", text: "Notice period 30 days", check: C.notice(30, "days") },
      ],
      hand: "Search for 'Initial Term' and 'Renewal Term'. Compare with the lawyer label. About 2 minutes.",
    },
  ].map((c) => ({
    ...c, group: "Real public contracts (CUAD)", kind: "real",
    documents: [{ id: "D1", name: CUAD[c.id].title, text: CUAD[c.id].text }],
    supplier: REAL_SUPPLIER,
    labels: CUAD[c.id].labels,
  })),
  // Held out from the build: ten more real contracts, picked by a fixed rule, answers written from the lawyer labels before the first run.
  ...[
    {
      id: "ho_sibannac", title: "Strategic alliance that renews once (a second filing of the same template)",
      tests: "Real public contract. Twelve months from 30 Nov 2017, then one more twelve months only.",
      expected: [
        { id: "start", text: "Term counted from 30 Nov 2017", check: C.start("2017-11-30") },
        { id: "mech", text: "Classed as a single extension, then ends", check: C.mechanism("one_time_extension_then_ends") },
        { id: "renewal", text: "The extension is 12 months", check: C.renewal(12, "months") },
        { id: "notice", text: "Notice period 90 days", check: C.notice(90, "days") },
        { id: "over", text: "Not shown as live today: it ended in 2019", check: C.expired() },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Search for 'twelve (12) months from the date hereof'. 30 Nov 2017 plus 12 months, plus one 12-month extension, ends 29 Nov 2019.",
    },
    {
      id: "ho_bolivar", title: "Web hosting agreement: five years, then yearly renewals",
      tests: "Real public contract. Five years from 12 May 2003, renewing each year, 90 days' notice.",
      expected: [
        { id: "start", text: "Term counted from 12 May 2003", check: C.start("2003-05-12") },
        { id: "initial", text: "Initial term 5 years", check: C.initial(5, "years") },
        { id: "renewal", text: "Renews for 1 year", check: C.renewal(1, "years") },
        { id: "notice", text: "Notice period 90 days", check: C.notice(90, "days") },
        { id: "date", text: "Confirmed: notice must arrive by 10 Feb 2027 (term ends 11 May 2027)", check: C.cancelByIn(["2027-02-10"]) },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Clause 1: five years from 12 May 2003 ends 11 May 2008, then yearly, so the current term ends 11 May 2027. 90 days before is 10 Feb 2027.",
    },
    {
      id: "ho_sykes", title: "Outsourcing agreement with a fixed calendar deadline",
      tests: "Real public contract. Yearly renewals; notice of cancellation on or before 1 October of each year. A fixed date, not a number of days.",
      expected: [
        { id: "renewal", text: "Renews for 1 year", check: C.renewal(1, "years") },
        { id: "mech", text: "Renews automatically", check: C.mechanism("automatic") },
        { id: "date", text: "If a date is confirmed, it is 1 Oct 2026 for the term ending 31 Dec 2026", check: C.cancelByIn(["2026-10-01"]) },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Search for 'October 1'. The term ends 31 Dec each year and notice is due on or before 1 Oct, which is 91 days before, not 90. On 22 Nov 2026 an outside reviewer's live read confirmed 2 Oct: it used the 90-day rule written for the 1998 term. Since then, code checks the documents for a calendar-day notice rule the reading did not use and sends the date to a person.",
    },
    {
      id: "ho_cooltech", title: "Alliance whose end depends on when projects finish",
      tests: "Real public contract. It expires on the later of five years or completion of certain projects, then renews yearly. The end date cannot be known from the text.",
      expected: [
        { id: "renewal", text: "Renews for 1 year", check: C.renewal(1, "years") },
        { id: "notice", text: "Notice period 30 days", check: C.notice(30, "days") },
        { id: "noconfirm", text: "No confirmed date: the end depends on project completion", check: C.notConfirmed() },
      ],
      hand: "Search for 'later of'. Five years from 26 May 2017, or later if a project is still running. The documents cannot say which.",
    },
    {
      id: "ho_datacall", title: "Content licence with a US-style start date",
      tests: "Real public contract. 'Contract start: 04-01-06' is 1 April 2006 (the agreement is dated 03/24/06), 24 months, then half a year more.",
      expected: [
        { id: "start", text: "Term counted from 1 Apr 2006, not 4 Jan", check: C.start("2006-04-01") },
        { id: "initial", text: "Initial term 24 months", check: C.initial(24, "months") },
        { id: "renewal", text: "The extension is 6 months", check: C.renewal(6, "months") },
        { id: "notice", text: "Notice period 60 days", check: C.notice(60, "days") },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Search for '04-01-06' and 'half a year'. Whether the half-year extension repeats is unclear, so no date check is set for it.",
    },
    {
      id: "ho_ultragenyx", title: "Supply agreement that starts on execution",
      tests: "Real public contract. Three years from execution, then two-year renewals, three calendar months' notice.",
      expected: [
        { id: "initial", text: "Initial term 3 years", check: C.initial(3, "years") },
        { id: "renewal", text: "Renews for 2 years", check: C.renewal(2, "years") },
        { id: "notice", text: "Notice period 3 months", check: C.notice(3, "months") },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Search for 'Initial Term'. The signature line reads Hamburg, 19 Nov 2012, but the term runs from execution, so no date check is set.",
    },
    {
      id: "ho_legacy", title: "Distributor agreement: two years, then yearly renewals",
      tests: "Real public contract. Two years from 8 Dec 2005, then annual renewals, 60 days' notice.",
      expected: [
        { id: "start", text: "Term counted from 8 Dec 2005", check: C.start("2005-12-08") },
        { id: "initial", text: "Initial term 2 years", check: C.initial(2, "years") },
        { id: "renewal", text: "Renews for 1 year", check: C.renewal(1, "years") },
        { id: "notice", text: "Notice period 60 days", check: C.notice(60, "days") },
        { id: "date", text: "Confirmed: the window for the term ending 7 Dec 2026 closed on 8 Oct 2026", check: C.cancelByIn(["2026-10-08"]) },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Clause 7: two years from 8 Dec 2005 ends 7 Dec 2007, then yearly, so the current term ends 7 Dec 2026. 60 days before is 8 Oct 2026.",
    },
    {
      id: "ho_centrack", title: "Web hosting agreement that renews month by month",
      tests: "Real public contract. Six months from 1 Apr 1999, then one-month renewals, 15 days' notice.",
      expected: [
        { id: "start", text: "Term counted from 1 Apr 1999", check: C.start("1999-04-01") },
        { id: "initial", text: "Initial term 6 months", check: C.initial(6, "months") },
        { id: "renewal", text: "Renews for 1 month", check: C.renewal(1, "months") },
        { id: "notice", text: "Notice period 15 days", check: C.notice(15, "days") },
        { id: "date", text: "Confirmed: the window for the term ending 30 Nov 2026 closed on 15 Nov 2026", check: C.cancelByIn(["2026-11-15"]) },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Search for 'TERM AND TERMINATION'. Monthly terms run to the end of each month; 15 days before 30 Nov 2026 is 15 Nov 2026.",
    },
    {
      id: "ho_emerald", title: "Services term that renews inside a ten-year agreement",
      tests: "Real public contract. The services term renews for two years at a time, but the agreement itself lasts ten years from 1 Sep 2016, so it ended on 31 Aug 2026.",
      expected: [
        { id: "renewal", text: "Renews for 2 years", check: C.renewal(2, "years") },
        { id: "notice", text: "Notice period 90 days", check: C.notice(90, "days") },
        { id: "over", text: "Not shown as live today: the ten-year agreement ended on 31 Aug 2026", check: C.expired() },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Search for 'ten years' and 'Services Term'. A renewal of the services term cannot outlive the agreement.",
    },
    {
      id: "ho_uagh", title: "Maintenance agreement: five years, then month by month",
      tests: "Real public contract. Five years from 23 Jul 2003, then monthly extensions, 30 days' notice.",
      expected: [
        { id: "start", text: "Term counted from 23 Jul 2003", check: C.start("2003-07-23") },
        { id: "initial", text: "Initial term 5 years", check: C.initial(5, "years") },
        { id: "renewal", text: "Extends for 1 month", check: C.renewal(1, "months") },
        { id: "notice", text: "Notice period 30 days", check: C.notice(30, "days") },
        { id: "date", text: "Confirmed: the window for the term ending 22 Dec 2026 closed on 22 Nov 2026", check: C.cancelByIn(["2026-11-22"]) },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Section 1: five years from 23 Jul 2003, then monthly terms ending on the 22nd. The term ending 22 Nov 2026 has passed, so the current one ends 22 Dec 2026; 30 days before is 22 Nov 2026.",
    },
  ].map((c) => ({
    ...c, group: "Held out: ten more real contracts, picked by rule", kind: "real", lazy: true,
    documents: null,
    supplier: REAL_SUPPLIER,
    labels: HOLDOUT_LABELS[c.id],
  })),
  // Held out again, after the guards and the fixed-day change: the next ten by the same rule, answers written before the first run.
  ...[
    {
      id: "ho2_ecoscience", title: "Endorsement agreement that renews every year",
      tests: "Real public contract. One year from 14 Nov 2017, renewing annually unless either party gives thirty days' notice.",
      expected: [
        { id: "start", text: "Term counted from 14 Nov 2017", check: C.start("2017-11-14") },
        { id: "renewal", text: "Renews for 1 year", check: C.renewal(1, "years") },
        { id: "notice", text: "Notice period 30 days", check: C.notice(30, "days") },
        { id: "date", text: "Confirmed: notice must arrive by 14 Oct 2027 (term ends 13 Nov 2027)", check: C.cancelByIn(["2027-10-14"]) },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Clause 2: one year from 14 Nov 2017, renewing each year, so the current term ends 13 Nov 2027; thirty days before is 14 Oct 2027.",
    },
    {
      id: "ho2_pacificap", title: "Content licence whose term starts when content goes public",
      tests: "Real public contract. Ten years from the first date the content is publicly available, a date the documents do not give, then three-year extensions.",
      expected: [
        { id: "renewal", text: "Renews for 3 years", check: C.renewal(3, "years") },
        { id: "notice", text: "Notice period 60 days", check: C.notice(60, "days") },
        { id: "noconfirm", text: "No confirmed date: the start is an event with no date in the documents", check: C.notConfirmed() },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Search for 'public availability'. The initial term runs from an event the filing does not date.",
    },
    {
      id: "ho2_webhelp", title: "Hosting agreement with the effective date left blank",
      tests: "Real public contract. One year from the Effective Date, then yearly renewals with 30 days' notice; the copy does not fill in the date.",
      expected: [
        { id: "initial", text: "Initial term 1 year", check: C.initial(1, "years") },
        { id: "renewal", text: "Renews for 1 year", check: C.renewal(1, "years") },
        { id: "notice", text: "Notice period 30 days", check: C.notice(30, "days") },
        { id: "noconfirm", text: "No confirmed date: the effective date is not written", check: C.notConfirmed() },
      ],
      hand: "Search for '10.1 Term'. Then look for where the Effective Date is filled in: it is not.",
    },
    {
      id: "ho2_americas", title: "Site agreement that starts when the site goes live",
      tests: "Real public contract. The Effective Date is the day the site becomes fully operational, confirmed in a later writing; one year, then yearly renewals.",
      expected: [
        { id: "initial", text: "Initial term 1 year", check: C.initial(1, "years") },
        { id: "renewal", text: "Renews for 1 year", check: C.renewal(1, "years") },
        { id: "noconfirm", text: "No confirmed date: the start is an event with no date in the documents", check: C.notConfirmed() },
      ],
      hand: "Search for 'fully operational'. The start depends on a later writing the filing does not include.",
    },
    {
      id: "ho2_hfent", title: "Development agreement: a year, then month by month",
      tests: "Real public contract. Twelve months from 1 Mar 2018, then one-month renewals, 30 days' notice.",
      expected: [
        { id: "start", text: "Term counted from 1 Mar 2018", check: C.start("2018-03-01") },
        { id: "initial", text: "Initial term 12 months", check: C.initial(12, "months") },
        { id: "renewal", text: "Renews for 1 month", check: C.renewal(1, "months") },
        { id: "notice", text: "Notice period 30 days", check: C.notice(30, "days") },
        { id: "date", text: "Confirmed: the window for the term ending 30 Nov 2026 closed on 31 Oct 2026", check: C.cancelByIn(["2026-10-31"]) },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Section 2.1: twelve months from 1 Mar 2018, then monthly terms to the end of each month; 30 days before 30 Nov 2026 is 31 Oct 2026.",
    },
    {
      id: "ho2_agape", title: "Ten-year supply agreement that renews for ten years",
      tests: "Real public contract. Ten years from execution, renewing for ten years; six months' notice to end the relationship.",
      expected: [
        { id: "initial", text: "Initial term 10 years", check: C.initial(10, "years") },
        { id: "renewal", text: "Renews for 10 years", check: C.renewal(10, "years") },
        { id: "notice", text: "Notice period 6 months", check: C.notice(6, "months") },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Clause 1. Whether the six months is notice to stop renewal or to terminate at any time is unclear, so no date check is set.",
    },
    {
      id: "ho2_imageware", title: "Maintenance agreement that started on installation",
      tests: "Real public contract. The Effective Date is the installation date, written as 10 Dec 1993; yearly renewals, 60 days' notice.",
      expected: [
        { id: "start", text: "Term counted from 10 Dec 1993", check: C.start("1993-12-10") },
        { id: "renewal", text: "Renews for 1 year", check: C.renewal(1, "years") },
        { id: "notice", text: "Notice period 60 days", check: C.notice(60, "days") },
        { id: "date", text: "Confirmed: the window for the term ending 9 Dec 2026 closed on 10 Oct 2026", check: C.cancelByIn(["2026-10-10"]) },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Section 2 and the EFFECTIVE DATE definition: yearly terms ending 9 Dec; 60 days before 9 Dec 2026 is 10 Oct 2026.",
    },
    {
      id: "ho2_neon", title: "Distributor agreement amended to a fixed end date",
      tests: "Real public contract. The amendment fixes the end at 31 Mar 2004, then yearly renewals with 60 days' notice.",
      expected: [
        { id: "renewal", text: "Renews for 1 year", check: C.renewal(1, "years") },
        { id: "notice", text: "Notice period 60 days", check: C.notice(60, "days") },
        { id: "date", text: "Confirmed: notice must arrive by 30 Jan 2027 (term ends 31 Mar 2027)", check: C.cancelByIn(["2027-01-30"]) },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Section 14.1 as amended: terms end 31 Mar each year; 60 days before 31 Mar 2027 is 30 Jan 2027.",
    },
    {
      id: "ho2_healthcare", title: "Reseller agreement with a right to terminate after the first year",
      tests: "Real public contract. One year from 31 Jul 2019, then yearly renewals; after the first year either party may terminate on three months' notice.",
      expected: [
        { id: "start", text: "Term counted from 31 Jul 2019", check: C.start("2019-07-31") },
        { id: "initial", text: "Initial term 1 year", check: C.initial(1, "years") },
        { id: "renewal", text: "Renews for 1 year", check: C.renewal(1, "years") },
        { id: "purpose", text: "The three months is read as a right to end at any time after year one", check: ({ x }) => ({ pass: x.notice?.purpose === "to_terminate_at_any_time", got: x.notice?.purpose || "none" }) },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Section on Term: the three months is a right to terminate at any time after the first year, not a deadline before renewal, so no date check is set.",
    },
    {
      id: "ho2_pandion", title: "Consulting agreement: four years, then yearly",
      tests: "Real public contract. Until the fourth anniversary of 27 Mar 2017, then yearly renewals unless the Company gives 90 days' notice.",
      expected: [
        { id: "renewal", text: "Renews for 1 year", check: C.renewal(1, "years") },
        { id: "notice", text: "Notice period 90 days", check: C.notice(90, "days") },
        { id: "date", text: "Sent to a person, or confirmed as 26 or 27 Dec 2026: 'Effective Date' is never defined, only the signing date", check: C.ifConfirmedIn(["2026-12-26", "2026-12-27"]) },
        { id: "quotes", text: "Every date-critical passage is found in the text", check: C.criticalVerified() },
      ],
      hand: "Section 2 uses 'Effective Date' but the agreement never defines it; it is only 'made this 27th day of March, 2017'. If that is the start: four years, then yearly, so 90 days before the March 2027 end is 26 or 27 Dec 2026. Either answer, or a question to a person, is right.",
    },
  ].map((c) => ({
    ...c, group: "Held out again: ten more, after the fixes", kind: "real", lazy: "/data/cuad-holdout2.json",
    documents: null,
    supplier: REAL_SUPPLIER,
    labels: HOLDOUT2_LABELS[c.id],
  })),
];

// Held-out texts are large, so they load only when a case is opened or run.
const holdoutTexts = {};
export async function loadDocuments(tc) {
  if (tc.documents) return tc.documents;
  const url = typeof tc.lazy === "string" ? tc.lazy : "/data/cuad-holdout.json";
  if (!holdoutTexts[url]) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Could not load the held-out contracts.");
    holdoutTexts[url] = await res.json();
  }
  const d = holdoutTexts[url][tc.id];
  tc.documents = [{ id: "D1", name: d.title, text: d.text }];
  return tc.documents;
}

export function testToday() {
  return parseISO(DEMO_TODAY);
}

// Scores one reading against a case's expected answers.
// Checks whose failure means a date was shown as confirmed when it was wrong, or should not have been confirmed at all.
export const DATE_CRITICAL = new Set(["date", "over", "noconfirm", "both", "flag", "opens"]);

export function evaluateCase(testCase, extraction, today = testToday()) {
  const brief = buildBrief({ extraction, documents: testCase.documents, record: {}, supplier: testCase.supplier, today });
  const results = testCase.expected.map((e) => {
    try {
      const r = e.check({ x: extraction, brief, today });
      return { id: e.id, pass: Boolean(r.pass), got: String(r.got ?? "") };
    } catch (error) {
      return { id: e.id, pass: false, got: `check failed: ${error.message}` };
    }
  });
  return { results, passed: results.filter((r) => r.pass).length, of: results.length, outcome: brief.outcome };
}
