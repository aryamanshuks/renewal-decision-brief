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
