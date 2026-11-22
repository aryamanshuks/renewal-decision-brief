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

test("the send-by date plans for the slowest delivery time the verified notice clause states", async () => {
  const P = await import("../public/data/precomputed.js");
  const S = await import("../public/data/samples.js");
  const B = await import("../public/js/core/brief.js");
  const D = await import("../public/js/core/dates.js");
  const fam = S.SAMPLE_FAMILIES.find((f) => f.id === "tallyhand");
  const sup = S.SUPPLIER_MASTER.find((s) => s.id === fam.supplierId);
  const x = JSON.parse(JSON.stringify(P.PRECOMPUTED.tallyhand.result));
  const text = fam.documents.map((d) => d.text).join("\n");
  const at = text.indexOf("Notices shall be in writing");
  x.notice.delivery_evidence = { doc_id: fam.documents.find((d) => d.text.includes("Notices shall be in writing")).id, quote: text.slice(at, text.indexOf("Business Day.", at) + "Business Day.".length) };
  x.notice.deemed_receipt_number = 0; x.notice.deemed_receipt_unit = "none";
  const b = B.buildBrief({ extraction: x, documents: fam.documents, record: {}, supplier: sup, today: D.parseISO("2026-11-23") });
  assert.equal(b.notice.deemedNumber, 1);
  assert.equal(b.notice.deemedUnit, "business_days");
  assert.equal(D.toISO(b.dates.sendBy), "2027-03-29");
});

test("Sykes: a reading that counts 90 days back from the term end is stopped when the contract also sets 1 October", async () => {
  const fs = await import("node:fs");
  const P = await import("../public/data/precomputed.js");
  const B = await import("../public/js/core/brief.js");
  const D = await import("../public/js/core/dates.js");
  const h = JSON.parse(fs.readFileSync(new URL("../public/data/cuad-holdout.json", import.meta.url), "utf8"));
  const docs = [{ id: "D1", name: "Sykes", text: h.ho_sykes.text }];
  const flat = h.ho_sykes.text.replace(/\s+/g, " ");
  const q = (s) => { const i = flat.indexOf(s); assert.ok(i >= 0, s); return s; };
  const x = JSON.parse(JSON.stringify(P.PRECOMPUTED.brightdesk.result));
  Object.assign(x.term, { start_date: "1998-01-01", start_basis: "fixed_calendar_date", start_evidence: { doc_id: "D1", quote: q("The term of this Agreement will commence on January 1, 1998") }, initial_term_number: 0, initial_term_unit: "none", fixed_end_date: "1998-12-31", initial_term_evidence: { doc_id: "D1", quote: q("will end on December 31, 1998") }, end_condition: "none" });
  Object.assign(x.renewal, { mechanism: "automatic", renewal_term_number: 1, renewal_term_unit: "years", evidence: { doc_id: "D1", quote: q("Thereafter this Agreement will automatically be renewed for successive additional periods of one year") } });
  Object.assign(x.notice, { period_number: 90, period_unit: "days", counted_back_from: "end_of_current_term", fixed_month_day: "", purpose: "to_prevent_renewal", deemed_receipt_number: 0, deemed_receipt_unit: "none", evidence: { doc_id: "D1", quote: q("Unless either party gives the other at least ninety days' prior written notice") }, delivery_evidence: { doc_id: "", quote: "" } });
  x.price_on_renewal = { rule: "not_addressed", cap_percent: 0, summary: "", evidence: { doc_id: "", quote: "" } };
  const sup = { name: "X", short: "X", category: "Other", annualValue: 0, currency: "INR", owner: "A" };
  const run = (xx) => B.buildBrief({ extraction: xx, documents: docs, record: {}, supplier: sup, today: D.parseISO("2026-11-23") });
  const bad = run(x);
  assert.notEqual(bad.outcome, "confirmed");
  assert.ok(bad.hard.some((b) => b.type === "legal" && /calendar day/.test(b.message)));
  const good = JSON.parse(JSON.stringify(x));
  Object.assign(good.notice, { period_number: 0, period_unit: "none", counted_back_from: "a_fixed_calendar_date", fixed_month_day: "10-01", evidence: { doc_id: "D1", quote: q("unless either party gives notice of cancellation on or before October 1 of any such year") } });
  const ok = run(good);
  assert.equal(ok.outcome, "confirmed");
  assert.equal(D.toISO(ok.dates.cancelBy), "2026-10-01");
});

test("a method the contract reserves for the supplier does not make the customer's notice valid", async () => {
  const P = await import("../public/data/precomputed.js");
  const B = await import("../public/js/core/brief.js");
  const N = await import("../public/js/core/notice.js");
  const D = await import("../public/js/core/dates.js");
  const text = "SERVICES AGREEMENT. This Agreement is made on 1 January 2026 between Rowan Lake Services Private Limited (\"Supplier\") and Orvanta Commerce Private Limited (\"Customer\"). 1. TERM. This Agreement starts on 1 January 2026 and continues for twelve (12) months. It renews automatically for further periods of twelve (12) months unless notice of non-renewal is given at least thirty (30) days before the end of the then-current term. 2. NOTICES. Customer may give notice under this Agreement only by email to contracts@rowanlake.example. Supplier must give notice by registered post to Customer's registered office. Notices are effective on receipt.";
  const docs = [{ id: "D1", name: "Rowan Lake", text }];
  const x = JSON.parse(JSON.stringify(P.PRECOMPUTED.brightdesk.result));
  Object.assign(x.term, { start_date: "2026-01-01", start_basis: "fixed_calendar_date", start_evidence: { doc_id: "D1", quote: "This Agreement starts on 1 January 2026 and continues for twelve (12) months." }, initial_term_number: 12, initial_term_unit: "months", fixed_end_date: "", initial_term_evidence: { doc_id: "D1", quote: "This Agreement starts on 1 January 2026 and continues for twelve (12) months." } });
  Object.assign(x.renewal, { mechanism: "automatic", renewal_term_number: 12, renewal_term_unit: "months", evidence: { doc_id: "D1", quote: "It renews automatically for further periods of twelve (12) months" } });
  Object.assign(x.notice, { period_number: 30, period_unit: "days", counted_back_from: "end_of_current_term", fixed_month_day: "", deemed_receipt_number: 0, deemed_receipt_unit: "none", email_is_valid: "yes", delivery_methods: "Customer: by email only to contracts@rowanlake.example. Supplier: by registered post to Customer's registered office.", evidence: { doc_id: "D1", quote: "unless notice of non-renewal is given at least thirty (30) days before the end of the then-current term." }, delivery_evidence: { doc_id: "D1", quote: "Customer may give notice under this Agreement only by email to contracts@rowanlake.example. Supplier must give notice by registered post to Customer's registered office." } });
  x.price_on_renewal = { rule: "not_addressed", cap_percent: 0, summary: "", evidence: { doc_id: "", quote: "" } };
  const sup = { name: "Rowan Lake", short: "Rowan Lake", category: "Other", annualValue: 100, currency: "INR", owner: "A" };
  const today = D.parseISO("2026-11-23");
  const b = B.buildBrief({ extraction: x, documents: docs, record: {}, supplier: sup, today });
  assert.equal(b.outcome, "confirmed");
  assert.deepEqual(N.allowedMethods(b).allowed, ["Email"]);
  const post = N.assessNotice(b, { sentOn: "2026-11-18", method: "Registered post", deliveredOn: "2026-11-21", proof: "RP-1" }, today);
  assert.ok(post.problems.some((p) => /only email/.test(p)), JSON.stringify(post.problems));
  const mail = N.assessNotice(b, { sentOn: "2026-11-20", method: "Email", deliveredOn: "2026-11-20", proof: "Read receipt" }, today);
  assert.equal(mail.problems.length, 0, JSON.stringify(mail.problems));
});
