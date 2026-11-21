// Drafts the notice letter from a fixed template. Plain code fills the blanks from confirmed facts.
// A person with signing authority sends it. This tool never contacts a supplier.

import { formatDate, describeDuration } from "./dates.js";

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
