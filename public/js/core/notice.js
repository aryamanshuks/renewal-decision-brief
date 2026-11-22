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

// After the notice window has closed there is no notice to give. What is left is a request,
// which the supplier is free to refuse. The letter says so, so nobody mistakes it for notice.
export function draftLateRequest({ brief, supplier = {}, customerName, today, signer }) {
  const title = brief.contract.title || "Agreement";
  const supplierName = brief.contract.supplier || supplier.name || "the Supplier";
  const customer = customerName || brief.contract.customer || "the Customer";
  const agreementDate = brief.agreementDate ? formatDate(brief.agreementDate) : "[date of agreement]";
  const d = brief.dates || {};
  const renews = (brief.silence?.text || "").replace(/^If nobody acts,\s*/i, "").replace(/[.\s]+$/, "");
  const lines = [];
  lines.push(`${customer}`);
  lines.push(`Date: ${formatDate(today)}`);
  lines.push("");
  lines.push(`To: ${supplierName}`);
  lines.push("");
  lines.push(`Subject: ${title} dated ${agreementDate}, request about the renewal`);
  lines.push("");
  lines.push(`Under the Agreement, notice of non-renewal had to reach you by ${formatDate(d.cancelBy)}. We did not give it${renews ? `, so ${renews}` : ""}.`);
  lines.push("");
  lines.push(`Before ${d.renewsOn ? formatDate(d.renewsOn) : "the renewal starts"}, we would like to agree one of these with you:`);
  lines.push(`1. The Agreement ends on ${formatDate(d.termEnd)}, the last day of the current term.`);
  lines.push("2. Revised charges and service levels for the renewal term.");
  lines.push("");
  lines.push("This letter is a request. It is not a notice under the Agreement, and it does not waive any of our rights under it.");
  lines.push("");
  lines.push(signer ? `${signer.name}, ${signer.title}` : "Name and title:");
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

// Which delivery methods the contract allows the customer, read from the delivery wording the passage check confirmed.
// When the wording gives each party its own methods, only the customer's count: a method the contract
// reserves for the supplier does not make the customer's notice valid.
const CUSTOMER_WORDS = /\b(customer|buyer|client|purchaser|licensee|orvanta)\b/;
const SUPPLIER_WORDS = /\b(supplier|vendor|provider|consultant|contractor|licensor|seller)\b/;
function methodsIn(text) {
  const t = String(text || "").toLowerCase();
  const found = new Set();
  // "registered office" is an address, not a method.
  if (/registered (post|mail|letter|a\.?d\.?)|certified mail|speed post|\bby post\b|\bpost\b(?! office)|postal|first[- ]class/.test(t.replace(/registered office|post office box|post box/g, ""))) found.add("Registered post");
  if (/courier|overnight/.test(t)) found.add("Courier");
  if (/\bhand\b|in person|personally/.test(t)) found.add("Hand delivery");
  if (/e-?mail/.test(t.replace(/e-?mail (alone )?(is|does) not|not by e-?mail|e-?mail copy|copy (may be sent )?by e-?mail/g, ""))) found.add("Email");
  return found;
}
export function methodsBySender(brief) {
  const text = `${brief.notice?.methods || ""}. ${brief.notice?.methodsQuote || ""}`;
  const parts = text.split(/(?<=[.;])\s+|\s*;\s*/).map((p) => p.trim()).filter(Boolean);
  // A clause belongs to the party named first in it: "Supplier must give notice ... to Customer's office" is the supplier's rule.
  const own = (p, re, other) => {
    const t = p.toLowerCase();
    const a = t.search(re);
    const b = t.search(other);
    return a !== -1 && (b === -1 || a < b);
  };
  const customerParts = parts.filter((p) => own(p, CUSTOMER_WORDS, SUPPLIER_WORDS) && methodsIn(p).size);
  const supplierParts = parts.filter((p) => own(p, SUPPLIER_WORDS, CUSTOMER_WORDS) && methodsIn(p).size);
  return { split: customerParts.length > 0 && supplierParts.length > 0, customerParts, supplierParts, parts };
}
export function allowedMethods(brief) {
  const bySender = methodsBySender(brief);
  if (bySender.split) {
    const allowed = new Set();
    for (const p of bySender.customerParts) for (const m of methodsIn(p)) allowed.add(m);
    return { allowed: METHODS.filter((m) => allowed.has(m)), known: allowed.size > 0, bySender: true };
  }
  const allowed = methodsIn(brief.notice?.methods || "");
  if (brief.notice?.emailValid === "yes") allowed.add("Email");
  if (brief.notice?.emailValid === "no") allowed.delete("Email");
  return { allowed: METHODS.filter((m) => allowed.has(m)), known: allowed.size > 0, bySender: false };
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
export function assessNotice(brief, notice, today = null) {
  const d = brief.dates || {};
  const problems = [];
  const open = [];
  const sentDate = parseISO(notice.sentOn || "");
  const deliveredDate = parseISO(notice.deliveredOn || "");
  // A date after today is a plan, not a fact. It never settles the work, and it stays a plan after the date passes
  // until a person confirms it was actually posted.
  const planned = notice.status === "planned" || Boolean(today && sentDate && sentDate > today);
  const planLapsed = planned && Boolean(today && sentDate && sentDate < today);
  if (planned && !planLapsed) open.push(`Planned for ${formatDate(sentDate)}, so it is recorded as planned, not sent. Confirm it once it has gone.`);
  if (planLapsed) open.push(`Planned for ${formatDate(sentDate)}, but nobody has confirmed it was posted. Until someone does, the notice counts as not sent.`);
  if (today && deliveredDate && deliveredDate > today) problems.push(`The delivery date, ${formatDate(deliveredDate)}, is after today. A delivery cannot be recorded before it happens.`);
  if (sentDate && deliveredDate && deliveredDate < sentDate) problems.push(`Delivered on ${formatDate(deliveredDate)}, before it was sent on ${formatDate(sentDate)}. One of the dates is wrong: check the proof of posting and delivery.`);
  if (notice.kind === "extension") {
    if (sentDate && d.termEnd && sentDate > d.termEnd) problems.push(`Signed on ${formatDate(sentDate)}, after the contract ended on ${formatDate(d.termEnd)}.`);
    return { problems, open, receipt: sentDate, basis: "signed by both sides", planned, planLapsed };
  }
  const { allowed, known, bySender } = allowedMethods(brief);
  if (!notice.method) open.push("The delivery method was not recorded.");
  else if (known && !allowed.includes(notice.method)) problems.push(`Sent by ${notice.method.toLowerCase()}, but the contract allows ${bySender ? "the customer" : ""}${bySender ? " " : ""}only ${allowed.map((m) => m.toLowerCase()).join(" or ")}${bySender ? "; other methods are for the supplier" : ""}.`);
  else if (!known) open.push("The contract's delivery rules could not be read, so a person must confirm the method was valid.");
  const r = receiptDate(brief, notice);
  if (!r.date) open.push(`Record the delivery date when proof of delivery arrives: ${r.basis}.`);
  else if (d.cancelBy && r.date > d.cancelBy) problems.push(`It counts as received on ${formatDate(r.date)} (${r.basis}), after the deadline of ${formatDate(d.cancelBy)}.`);
  else if (d.opensOn && r.date < d.opensOn) problems.push(`It counts as received on ${formatDate(r.date)}, before the notice window opens on ${formatDate(d.opensOn)}. The contract does not allow notice that early.`);
  if (brief.notice?.earliestStated && !brief.notice?.earliestUsable) open.push("The contract limits how early notice may be given, but the limit could not be worked out. A person must check the timing against the clause.");
  return { problems, open, receipt: r.date, basis: r.basis, planned, planLapsed };
}

export { toISO };
