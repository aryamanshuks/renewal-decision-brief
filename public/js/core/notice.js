// Drafts the notice letter from a fixed template. Plain code fills the blanks from confirmed facts.
// A person with signing authority sends it. This tool never contacts a supplier.

import { formatDate, describeDuration, parseISO, toISO, addDuration, isUsableDuration, normalizeUnit } from "./dates.js";

export function draftNotice({ brief, supplier = {}, customerName, choice, today, kind }) {
  const title = brief.contract.title || "Agreement";
  const supplierName = brief.contract.supplier || supplier.name || "the Supplier";
  const customer = customerName || brief.contract.customer || "the Customer";
  const agreementDate = brief.agreementDate ? formatDate(brief.agreementDate) : "[date of agreement]";
  const d = brief.dates || {};
  const address = brief.notice.address || "[Supplier's address for notices, as stated in the agreement]";
  const method = brief.notice.methods ? brief.notice.methods.replace(/[.\s]+$/, "") : "[delivery method required by the agreement]";
  const renewalFact = brief.facts.find((f) => f.key === "renewal_mechanism");
  const clause = renewalFact?.evidence?.quote ? `The relevant term reads: "${renewalFact.evidence.quote}"` : "";

  const lines = [];
  lines.push(`${customer}`);
  lines.push(`Date: ${formatDate(today)}`);
  lines.push("");
  lines.push(`To: ${supplierName}`);
  lines.push(`${address}`);
  lines.push(`Delivery: ${method}`);
  lines.push("");
  if (kind === "renewal") {
    lines.push(`Subject: Notice of renewal, ${title} dated ${agreementDate}`);
    lines.push("");
    lines.push(`We refer to the ${title} between ${supplierName} and ${customer} dated ${agreementDate} (the "Agreement").`);
    lines.push("");
    lines.push(`In accordance with the Agreement, we give notice that ${customer} renews the Agreement for the further term provided in it. The current term ends on ${formatDate(d.termEnd)}.`);
  } else {
    lines.push(`Subject: Notice of non-renewal, ${title} dated ${agreementDate}`);
    lines.push("");
    lines.push(`We refer to the ${title} between ${supplierName} and ${customer} dated ${agreementDate} (the "Agreement").`);
    lines.push("");
    lines.push(`In accordance with the Agreement, we give notice that ${customer} does not wish to renew the Agreement. The Agreement will therefore end on ${formatDate(d.termEnd)}, the last day of the current term.`);
    if (choice === "renegotiate") {
      lines.push("");
      lines.push("We remain open to agreeing new terms before that date and will write to you separately about them.");
    }
  }
  if (clause) {
    lines.push("");
    lines.push(clause);
  }
  lines.push("");
  lines.push("This notice is given without prejudice to our other rights under the Agreement.");
  lines.push("");
  lines.push("Signed: ______________________");
  lines.push("Name and title of authorised signatory:");
  return lines.join("\n");
}

export function noticeChecklist(brief) {
  const d = brief.dates || {};
  const items = [];
  if (d.sendBy) items.push(`Send by ${formatDate(d.sendBy, { weekday: true })}. The last contractual date is ${formatDate(d.cancelBy, { weekday: true })}.`);
  if (brief.notice.methods) items.push(`Use the method the contract requires: ${brief.notice.methods.replace(/[.\s]+$/, "")}.`);
  if (brief.notice.emailValid === "no") items.push("Email does not count as notice under this contract.");
  if (brief.notice.address) items.push(`Address it to: ${brief.notice.address}`);
  items.push("Keep proof of sending and record it here.");
  return items;
}

export { describeDuration };

// ---------- Was the notice valid? Plain rules on what the contract says and what was recorded. ----------

export const METHODS = ["Registered post", "Courier", "Hand delivery", "Email"];

// Which delivery methods the contract allows, read from the delivery wording the passage check confirmed.
export function allowedMethods(brief) {
  const text = String(brief.notice?.methods || "").toLowerCase();
  const allowed = new Set();
  if (/registered|certified|speed post|\bpost\b|postal|first[- ]class/.test(text)) allowed.add("Registered post");
  if (/courier|overnight/.test(text)) allowed.add("Courier");
  if (/\bhand\b|in person|personally/.test(text)) allowed.add("Hand delivery");
  if (/e-?mail/.test(text.replace(/email (alone )?(is|does) not|not by email|email copy/g, ""))) allowed.add("Email");
  if (brief.notice?.emailValid === "yes") allowed.add("Email");
  if (brief.notice?.emailValid === "no") allowed.delete("Email");
  return { allowed: METHODS.filter((m) => allowed.has(m)), known: allowed.size > 0 };
}

// When the notice counts as received. Hand delivery: the day it is handed over.
// Otherwise the contract's deemed-receipt rule, unless an actual delivery date was recorded.
export function receiptDate(brief, { sentOn, method, deliveredOn }) {
  const delivered = parseISO(deliveredOn || "");
  if (delivered) return { date: delivered, basis: "recorded delivery date" };
  const sent = parseISO(sentOn || "");
  if (!sent) return { date: null, basis: "" };
  if (method === "Hand delivery") return { date: sent, basis: "handed over that day" };
  const n = Number(brief.notice?.deemedNumber) || 0;
  const u = normalizeUnit(brief.notice?.deemedUnit);
  if (isUsableDuration(n, u)) return { date: addDuration(sent, n, u), basis: `deemed received ${describeDuration(n, u)} after sending, as the contract says` };
  return { date: null, basis: "the contract gives no deemed-receipt rule, so the delivery date must be recorded" };
}

// Checks a recorded notice against the contract. Returns what is wrong, if anything.
export function assessNotice(brief, notice) {
  const d = brief.dates || {};
  const problems = [];
  const open = [];
  if (notice.kind === "extension") {
    const signed = parseISO(notice.sentOn || "");
    if (signed && d.termEnd && signed > d.termEnd) problems.push(`Signed on ${formatDate(signed)}, after the contract ended on ${formatDate(d.termEnd)}.`);
    return { problems, open, receipt: signed, basis: "signed by both sides" };
  }
  const { allowed, known } = allowedMethods(brief);
  if (!notice.method) open.push("The delivery method was not recorded.");
  else if (known && !allowed.includes(notice.method)) problems.push(`Sent by ${notice.method.toLowerCase()}, but the contract allows only ${allowed.map((m) => m.toLowerCase()).join(" or ")}.`);
  else if (!known) open.push("The contract's delivery rules could not be read, so a person must confirm the method was valid.");
  const r = receiptDate(brief, notice);
  if (!r.date) open.push(`Record the delivery date when proof of delivery arrives: ${r.basis}.`);
  else if (d.cancelBy && r.date > d.cancelBy) problems.push(`It counts as received on ${formatDate(r.date)} (${r.basis}), after the deadline of ${formatDate(d.cancelBy)}.`);
  return { problems, open, receipt: r.date, basis: r.basis };
}

export { toISO };
