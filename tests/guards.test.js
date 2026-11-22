// The two guards on the end of the term, added after the held-out run found two wrong confirmed dates.
import test from "node:test";
import assert from "node:assert/strict";
import { PRECOMPUTED } from "../public/data/precomputed.js";
import { SAMPLE_FAMILIES, SUPPLIER_MASTER, DEMO_TODAY } from "../public/data/samples.js";
import { buildBrief } from "../public/js/core/brief.js";
import { parseISO } from "../public/js/core/dates.js";

const today = parseISO(DEMO_TODAY);
const family = SAMPLE_FAMILIES.find((f) => f.id === "brightdesk");
const supplier = { ...SUPPLIER_MASTER.find((s) => s.id === family.supplierId), currency: "INR" };
const reading = () => JSON.parse(JSON.stringify(PRECOMPUTED.brightdesk.result));
const brief = (x, documents = family.documents) => buildBrief({ extraction: x, documents, record: {}, supplier, today });

test("guards: the untouched Brightdesk reading still confirms", () => {
  assert.equal(brief(reading()).outcome, "confirmed");
});

test("guards: an end that is 'the later of' two things is not confirmed", () => {
  const x = reading();
  x.term.end_condition = "later_of";
  const b = brief(x);
  assert.equal(b.outcome, "blocked");
  assert.ok(b.hard.some((h) => h.type === "conditional"));
});

test("guards: code finds 'later of' in the sentence around the term passage, even if the reading missed it", () => {
  const x = reading();
  const quote = x.term.initial_term_evidence.quote;
  const documents = family.documents.map((d) => ({ ...d, text: d.text.replace(quote, `This Agreement shall expire on the later of (i) the end of the term below or (ii) completion of the migration project, and ${quote}`) }));
  const b = brief(x, documents);
  assert.equal(b.outcome, "blocked");
  assert.ok(b.hard.some((h) => h.type === "conditional"));
});

test("guards: a renewing term cannot run past an overall limit on the agreement", () => {
  const x = reading();
  x.term.agreement_limit = { number: 6, unit: "months", end_date: "", evidence: { doc_id: x.term.initial_term_evidence.doc_id, quote: x.term.initial_term_evidence.quote } };
  const b = brief(x);
  assert.equal(b.outcome, "blocked");
  const lim = b.hard.find((h) => h.type === "limit");
  assert.ok(lim, "limit blocker present");
  assert.match(lim.message, /has passed/);
});

test("guards: a limit with a passage code cannot find is ignored, not trusted", () => {
  const x = reading();
  x.term.agreement_limit = { number: 6, unit: "months", end_date: "", evidence: { doc_id: "D1", quote: "This sentence is not in the contract." } };
  assert.equal(brief(x).outcome, "confirmed");
});

test("a fixed end date must be written in its quoted passage; when it is, a missing start date does not block", async () => {
  const P = await import("../public/data/precomputed.js");
  const B = await import("../public/js/core/brief.js");
  const D = await import("../public/js/core/dates.js");
  const amend = "Section 14.1 TERM. This Agreement shall be effective through and including March 31, 2004. Upon the expiration of such term, this Agreement will renew automatically for successive terms of one (1) year each unless either party to this Agreement delivers written notice of termination to the other party to this Agreement at least sixty (60) days prior to the end of the original or any renewal term.";
  const x = JSON.parse(JSON.stringify(P.PRECOMPUTED.brightdesk.result));
  Object.assign(x.term, { start_date: "", start_basis: "not_found", start_evidence: { doc_id: "", quote: "" }, initial_term_number: 0, initial_term_unit: "none", fixed_end_date: "2004-03-31", initial_term_evidence: { doc_id: "D1", quote: "This Agreement shall be effective through and including March 31, 2004." } });
  Object.assign(x.renewal, { mechanism: "automatic", renewal_term_number: 1, renewal_term_unit: "years", evidence: { doc_id: "D1", quote: "this Agreement will renew automatically for successive terms of one (1) year each" } });
  Object.assign(x.notice, { period_number: 60, period_unit: "days", counted_back_from: "end_of_current_term", fixed_month_day: "", deemed_receipt_number: 0, deemed_receipt_unit: "none", evidence: { doc_id: "D1", quote: "at least sixty (60) days prior to the end of the original or any renewal term" } });
  x.price_on_renewal = { rule: "not_addressed", cap_percent: 0, summary: "", evidence: { doc_id: "", quote: "" } };
  const docs = [{ id: "D1", name: "Amendment", text: amend }];
  const sup = { name: "X", short: "X", category: "Other", annualValue: 100, currency: "INR", owner: "A" };
  const run = (xx) => B.buildBrief({ extraction: xx, documents: docs, record: {}, supplier: sup, today: D.parseISO("2026-11-23") });
  const ok = run(x);
  assert.equal(ok.outcome, "confirmed");
  assert.equal(D.toISO(ok.dates.cancelBy), "2027-01-30");
  const misread = JSON.parse(JSON.stringify(x));
  misread.term.fixed_end_date = "2004-03-30";
  misread.term.start_date = "1999-01-01"; misread.term.start_basis = "fixed_calendar_date"; misread.term.start_evidence = { doc_id: "D1", quote: "Section 14.1 TERM." };
  const bad = run(misread);
  assert.notEqual(bad.outcome, "confirmed");
  assert.ok(bad.hard.some((h) => h.type === "inconsistent" && h.field === "initial_term"));
});
