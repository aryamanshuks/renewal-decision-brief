import test from "node:test";
import assert from "node:assert/strict";
import { parseTable, detectColumns, parseTrackerDate, reconcile, normaliseName } from "../public/js/core/tracker.js";
import { TRACKER_SAMPLE } from "../public/data/tracker-sample.js";
import { PRECOMPUTED } from "../public/data/precomputed.js";
import { SAMPLE_FAMILIES, SUPPLIER_MASTER, DEMO_TODAY } from "../public/data/samples.js";
import { buildBrief } from "../public/js/core/brief.js";
import { parseISO, toISO } from "../public/js/core/dates.js";

const today = parseISO(DEMO_TODAY);

function views() {
  return SAMPLE_FAMILIES.map((family) => {
    const supplier = { ...SUPPLIER_MASTER.find((s) => s.id === family.supplierId), currency: "INR" };
    const reading = PRECOMPUTED[family.id];
    const brief = reading ? buildBrief({ extraction: JSON.parse(JSON.stringify(reading.result)), documents: family.documents, record: {}, supplier, today }) : null;
    return { contract: { id: family.id }, supplier, brief };
  });
}

const byName = (out, name) => out.results.find((r) => r.row.supplier.startsWith(name));

test("tracker: reads pasted Excel cells and quoted CSV", () => {
  assert.deepEqual(parseTable("Supplier\tEnds\nA Ltd\t19/03/2027\n"), [["Supplier", "Ends"], ["A Ltd", "19/03/2027"]]);
  assert.deepEqual(parseTable('Supplier,Notes\n"B, Inc","said ""yes"""\n'), [["Supplier", "Notes"], ["B, Inc", 'said "yes"']]);
  assert.deepEqual(parseTable("Supplier;Ends\nC;1/2/2027"), [["Supplier", "Ends"], ["C", "1/2/2027"]]);
});

test("tracker: dates are read day first, and impossible dates are refused", () => {
  assert.equal(toISO(parseTrackerDate("03/04/2027")), "2027-04-03");
  assert.equal(toISO(parseTrackerDate("19-Mar-27")), "2027-03-19");
  assert.equal(toISO(parseTrackerDate("5 Sept 2026")), "2026-09-05");
  assert.equal(toISO(parseTrackerDate("2027-03-19")), "2027-03-19");
  assert.equal(parseTrackerDate("31/02/2026"), null);
  assert.equal(parseTrackerDate("next March"), null);
});

test("tracker: finds columns by their usual names, not their position", () => {
  const cols = detectColumns(["Vendor", "Renewal type", "Opt-out deadline", "Expiry date", "Contract owner"]);
  assert.equal(cols.supplier, 0);
  assert.equal(cols.auto, 1);
  assert.equal(cols.notice, 2);
  assert.equal(cols.end, 3);
  assert.equal(cols.owner, 4);
  assert.equal(normaliseName("Kestrelway Logistics Pvt. Ltd."), "kestrelway logistics");
});

test("tracker: the sample sheet gets the verdict each row deserves", () => {
  const out = reconcile({ table: parseTable(TRACKER_SAMPLE), views: views(), master: SUPPLIER_MASTER, today });
  assert.equal(out.summary.rows, 8);
  assert.equal(byName(out, "Brightdesk").label, "End date only");
  assert.equal(byName(out, "Tallyhand").label, "Out of date");
  assert.equal(byName(out, "Ivyrock").label, "60 days too late");
  assert.equal(byName(out, "Datavine").label, "Uses the later of two readings");
  assert.equal(byName(out, "Corelight").label, "No contract on file");
  assert.equal(byName(out, "Kestrelway").severity, "warn");
  assert.equal(byName(out, "Quillmark").severity, "warn");
  assert.equal(byName(out, "Paper Lantern").label, "Matches");
  assert.deepEqual([out.summary.bad, out.summary.warn, out.summary.good], [5, 2, 1]);
  assert.deepEqual(out.missingFromTracker.map((v) => v.contract.id), ["signalroot"]);
  assert.deepEqual(out.paidNowhere.map((s) => s.id), ["mintleaf", "bluepeak", "lumenpost"]);
});

test("tracker: a correct notice date matches, and one day late is caught", () => {
  const sheet = (date) => `Supplier,Notice deadline\nBrightdesk Software,${date}\n`;
  const ok = reconcile({ table: parseTable(sheet("16/12/2026")), views: views(), master: SUPPLIER_MASTER, today });
  assert.equal(ok.results[0].label, "Matches");
  const late = reconcile({ table: parseTable(sheet("17/12/2026")), views: views(), master: SUPPLIER_MASTER, today });
  assert.equal(late.results[0].label, "1 day too late");
  assert.equal(late.results[0].severity, "bad");
});

test("tracker: a sheet without a supplier or a date column is refused with a reason", () => {
  const a = reconcile({ table: parseTable("Name of thing,Date\nX,1/1/2027"), views: views(), master: SUPPLIER_MASTER, today });
  assert.match(a.error, /date column/, "a bare 'Date' column is ambiguous, so the sheet is refused");
  const b = reconcile({ table: parseTable("Foo,Bar\n1,2"), views: views(), master: SUPPLIER_MASTER, today });
  assert.match(b.error, /supplier column/);
});
