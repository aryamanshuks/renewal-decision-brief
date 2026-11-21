// Checks procurement's existing renewal tracker (an Excel sheet, pasted or saved as CSV)
// against what the signed contracts on file actually prove. Plain code, no model.
import { parseISO, daysBetween, formatDate } from "./dates.js";

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };

// ---------- Reading the sheet ----------

// Splits pasted Excel cells (tab separated) or a CSV file into rows of cells. Handles quoted cells.
export function parseTable(text) {
  const src = String(text || "").replace(/\r\n?/g, "\n").replace(/^﻿/, "");
  const firstLine = src.split("\n").find((l) => l.trim()) || "";
  const sep = firstLine.includes("\t") ? "\t" : firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === "") quoted = true;
    else if (ch === sep) { row.push(cell.trim()); cell = ""; }
    else if (ch === "\n") { row.push(cell.trim()); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell.trim()); rows.push(row); }
  return rows.filter((r) => r.some((c) => c !== ""));
}

const COLUMN_HINTS = {
  supplier: [/supplier/, /vendor/, /counterparty/, /party/, /company/, /name/],
  notice: [/notice/, /opt.?out/, /cancel/, /terminat/, /deadline/],
  end: [/end/, /expir/, /renewal date/, /renews on/, /term date/],
  auto: [/auto/, /renewal type/, /evergreen/, /^renews\??$/],
  owner: [/owner/, /contact/, /responsible/],
  value: [/value/, /amount/, /spend/, /cost/],
};

// Finds which column holds what, from the header row. Returns column indexes (or -1).
export function detectColumns(header) {
  const h = header.map((c) => c.toLowerCase());
  const taken = new Set();
  const find = (key) => {
    for (const re of COLUMN_HINTS[key]) {
      const i = h.findIndex((c, j) => !taken.has(j) && re.test(c));
      if (i !== -1) { taken.add(i); return i; }
    }
    return -1;
  };
  // Order matters: "notice deadline" must not be taken as the end date, and "auto-renews" not as the end date.
  const cols = {};
  for (const key of ["supplier", "notice", "auto", "end", "owner", "value"]) cols[key] = find(key);
  return cols;
}

// Reads a date the way an Indian Excel sheet usually shows it: day first.
// Accepts 2027-03-19, 19/03/2027, 19-03-2027, 19.03.2027, 19 Mar 2027, 19-Mar-27.
export function parseTrackerDate(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return parseISO(`${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`);
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);
  if (m) return build(m[3], Number(m[2]) - 1, Number(m[1]));
  m = s.match(/^(\d{1,2})[\s-]+([A-Za-z]{3,9})[\s,-]+(\d{2}|\d{4})$/);
  if (m) {
    const name = m[2].toLowerCase();
    const month = MONTHS[name.slice(0, 4)] ?? MONTHS[name.slice(0, 3)];
    if (month !== undefined) return build(m[3], month, Number(m[1]));
  }
  return null;
}

function build(year, month, day) {
  const y = String(year).length === 2 ? 2000 + Number(year) : Number(year);
  const iso = `${y}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return parseISO(iso);
}

function yesNo(raw) {
  const s = String(raw || "").trim().toLowerCase();
  if (!s) return null;
  if (/^(y|yes|true|auto|automatic|evergreen)/.test(s)) return true;
  if (/^(n|no|false|manual|fixed|ends)/.test(s)) return false;
  return null;
}

const STOP = /\b(private|pvt|limited|ltd|llp|inc|llc|co|company|the|services|india)\b\.?/g;
export function normaliseName(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(STOP, " ").replace(/\s+/g, " ").trim();
}

function sameSupplier(a, b) {
  const x = normaliseName(a);
  const y = normaliseName(b);
  if (!x || !y) return false;
  if (x === y || x.startsWith(y) || y.startsWith(x)) return true;
  return x.split(" ")[0] === y.split(" ")[0] && x.split(" ")[0].length >= 5;
}

// ---------- Comparing ----------

const fd = (d) => (d ? formatDate(d) : "");
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

// One verdict per tracker row. severity: "bad" would cause a missed or wrong window, "warn" cannot be proven, "good" matches.
function judge(row, view, today) {
  const { brief, supplier } = view;
  const T = row.notice;
  const E = row.end;
  if (!brief) return { severity: "warn", label: "Not read yet", detail: "The contract is on file but has not been read. Read it to check this row." };
  const d = brief.dates;
  const changed = (brief.changes || []).some((c) => c.governs === "later_document");

  if (brief.outcome === "provisional") {
    const p = brief.provisional?.dates;
    return {
      severity: "warn",
      label: "Cannot be proven yet",
      proves: p?.cancelBy ? `Notice by ${fd(p.cancelBy)} only if the term began on the signing date` : "Depends on a date no document gives",
      detail: `The tracker's date assumes a start date that the documents do not give. If the term began earlier, the real deadline is earlier too.${T && p?.cancelBy && daysBetween(p.cancelBy, T) === 0 ? " The tracker matches that assumption, not the contract." : ""} One question to ${supplier.owner || "the owner"} settles it.`,
    };
  }

  if (brief.outcome === "blocked") {
    const alts = (brief.alternatives || []).filter((a) => a.dates?.cancelBy).map((a) => a.dates.cancelBy).sort((a, b) => a - b);
    if (alts.length >= 2 && T) {
      const later = alts[alts.length - 1];
      const earlier = alts[0];
      if (daysBetween(later, T) === 0) {
        return { severity: "bad", label: "Uses the later of two readings", proves: `Documents conflict: ${alts.map(fd).join(" or ")}`, detail: `The documents give two notice deadlines. The tracker took the later one, ${fd(later)}. Until someone settles which document governs, the safe deadline is ${fd(earlier)}.` };
      }
      return { severity: "warn", label: "Documents conflict", proves: `${alts.map(fd).join(" or ")}`, detail: "The documents give two notice deadlines. Neither can be confirmed until someone settles which document governs." };
    }
    return { severity: "warn", label: "Cannot be proven from the file", proves: "No date can be confirmed", detail: "The documents on file cannot prove a renewal date, usually because a document they refer to is missing. The tracker's date comes from somewhere else." };
  }

  if (brief.outcome === "no_deadline") {
    if (T || E) return { severity: "warn", label: "Tracker has a date the contract does not", proves: "Runs until terminated", detail: "The contract has no renewal date. It runs until someone ends it. Check where the tracker's date came from." };
    return { severity: "good", label: "Matches", proves: "Runs until terminated", detail: "No renewal date, as the tracker says." };
  }

  if (brief.outcome === "ends" && d?.termEnd) {
    if (row.auto === true) return { severity: "warn", label: "Says it renews; it ends", proves: `Ends ${fd(d.termEnd)}`, detail: "The contract does not renew on its own. Keeping the supplier needs a new signed agreement before it ends." };
    if (E && daysBetween(d.termEnd, E) !== 0) return { severity: "warn", label: "End date differs", proves: `Ends ${fd(d.termEnd)}`, detail: `The tracker says ${fd(E)}. The contract proves ${fd(d.termEnd)}.` };
    return { severity: "good", label: "Matches", proves: `Ends ${fd(d.termEnd)}, no automatic renewal`, detail: "The tracker agrees with the contract." };
  }

  if (brief.outcome === "confirmed" && d?.cancelBy) {
    const proves = `Notice must arrive by ${fd(d.cancelBy)}. Safe to send by ${fd(d.sendBy)}`;
    const notes = [];
    if (brief.mechanism === "one_time_extension_then_ends" && row.auto === true) notes.push("It extends once, then ends; it does not keep renewing.");
    if (brief.mechanism === "automatic" && row.auto === false) notes.push("The tracker says it does not renew; the contract renews automatically.");
    if (changed && E && d.termEnd && daysBetween(d.termEnd, E) !== 0) {
      return { severity: "bad", label: "Out of date", proves, detail: `A later document changed the terms. The tracker still has the old ones: it ends ${fd(E)}${T ? `, notice by ${fd(T)}` : ""}. The contract now ends ${fd(d.termEnd)}.${notes.length ? ` ${notes.join(" ")}` : ""}` };
    }
    if (!T && E) {
      const late = daysBetween(d.cancelBy, E);
      return { severity: "bad", label: "End date only", proves, detail: `The tracker has the end date, ${fd(E)}, but no notice date. A reminder on the end date comes ${plural(late, "day")} after the last day notice can arrive.${notes.length ? ` ${notes.join(" ")}` : ""}` };
    }
    if (T) {
      const late = daysBetween(d.cancelBy, T);
      if (late > 0) return { severity: "bad", label: `${plural(late, "day")} too late`, proves, detail: `The tracker's notice date, ${fd(T)}, is after the contract's deadline. Acting on it would miss the window.${notes.length ? ` ${notes.join(" ")}` : ""}` };
      if (late < 0) return { severity: "good", label: "Earlier than needed", proves, detail: `The tracker's date is ${plural(-late, "day")} before the deadline, so it is safe, but it does not say how the notice must be sent.${notes.length ? ` ${notes.join(" ")}` : ""}` };
      return { severity: notes.length ? "warn" : "good", label: notes.length ? "Date matches, type differs" : "Matches", proves, detail: notes.length ? notes.join(" ") : `The deadline matches. The safe send date allows for delivery time, ${fd(d.sendBy)}.` };
    }
    return { severity: "bad", label: "No date in the tracker", proves, detail: "The tracker row has no date at all." };
  }

  return { severity: "warn", label: "Not checked", proves: "", detail: "This contract's state could not be compared." };
}

// rows: parsed table including the header. views: allViews(). master: SUPPLIER_MASTER. today: Date.
export function reconcile({ table, views, master, today }) {
  if (!table.length) return { error: "The sheet is empty." };
  const header = table[0];
  const cols = detectColumns(header);
  if (cols.supplier === -1) return { error: "Could not find a supplier column. Name one column Supplier or Vendor.", header };
  if (cols.notice === -1 && cols.end === -1) return { error: "Could not find a date column. Name one Notice deadline or End date.", header };
  const unreadable = [];
  const items = table.slice(1).map((cells, i) => {
    const get = (k) => (cols[k] === -1 ? "" : cells[cols[k]] || "");
    const row = {
      line: i + 2,
      supplier: get("supplier"),
      ownerText: get("owner"),
      noticeText: get("notice"),
      endText: get("end"),
      autoText: get("auto"),
      notice: parseTrackerDate(get("notice")),
      end: parseTrackerDate(get("end")),
      auto: yesNo(get("auto")),
    };
    if ((row.noticeText && !row.notice) || (row.endText && !row.end)) unreadable.push(row.line);
    return row;
  }).filter((r) => r.supplier);

  const matchedViews = new Set();
  const results = items.map((row) => {
    const view = views.find((v) => sameSupplier(row.supplier, v.supplier.short || v.supplier.name) || sameSupplier(row.supplier, v.supplier.name));
    if (view) {
      matchedViews.add(view.contract.id);
      return { row, view, ...judge(row, view, today) };
    }
    const sup = master.find((s) => sameSupplier(row.supplier, s.short || s.name) || sameSupplier(row.supplier, s.name));
    if (sup) return { row, supplier: sup, severity: "warn", label: "No contract on file", proves: "Nothing on file can prove a date", detail: `The tracker has a date, but no signed contract for ${sup.short || sup.name} is in the repository, so nothing can check it.` };
    return { row, severity: "warn", label: "Not recognised", proves: "", detail: "This name is not in the payments file or the repository. Check the spelling, or add the contract." };
  });

  const missingFromTracker = views.filter((v) => !matchedViews.has(v.contract.id));
  const inTracker = (s) => items.some((r) => sameSupplier(r.supplier, s.short || s.name) || sameSupplier(r.supplier, s.name));
  const paidNowhere = master.filter((s) => s.noContract && !inTracker(s));

  const order = { bad: 0, warn: 1, good: 2 };
  results.sort((a, b) => order[a.severity] - order[b.severity]);
  const count = (sev) => results.filter((r) => r.severity === sev).length;
  const valueOf = (r) => Number((r.view?.supplier || r.supplier)?.annualValue) || 0;
  return {
    cols,
    header,
    results,
    unreadable,
    missingFromTracker,
    paidNowhere,
    summary: {
      rows: results.length,
      bad: count("bad"),
      warn: count("warn"),
      good: count("good"),
      badValue: results.filter((r) => r.severity === "bad").reduce((n, r) => n + valueOf(r), 0),
    },
  };
}
