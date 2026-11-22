// House rules. These are assumptions about the company in the brief, stated in one place and shown in the product.

// Days an owner needs between being asked and the last safe day to send notice.
// Longer where replacing the supplier takes a tender or a migration.
export const LEAD_DAYS = {
  Logistics: 90,
  Facilities: 60,
  Staffing: 45,
  Software: 30,
  Consulting: 30,
  Marketing: 30,
  Other: 45,
};

export const CATEGORIES = Object.keys(LEAD_DAYS);

export function leadDaysFor(category) {
  return LEAD_DAYS[category] ?? LEAD_DAYS.Other;
}

// Working days held back before the contractual deadline, on top of any deemed delivery time in the contract.
export const SAFETY_MARGIN_BUSINESS_DAYS = 2;

// The reading instructions the checks in this build expect. Must match PROMPT_VERSION in server/schema.js.
// A reading made with earlier instructions may lack fields that later checks rely on.
export const READING_VERSION = "v6";

// Working days an owner has to answer a question before it is escalated.
export const QUESTION_DUE_BUSINESS_DAYS = 3;

export const STATUS_LABEL = {
  confirmed: "Confirmed from documents",
  owner_confirmed: "Answered by owner",
  procurement_confirmed: "Confirmed by procurement",
  needs_answer: "Needs one answer",
  awaiting_confirmation: "Answer awaiting procurement check",
  conflict: "Conflicting terms",
  not_found: "Not found in these documents",
  unverified: "Passage not verified",
  not_applicable: "Not applicable",
};

export const MECHANISM_LABEL = {
  automatic: "Renews automatically",
  customer_must_give_notice_to_renew: "Ends unless you give notice to renew",
  mutual_written_agreement: "Renews only if both sides sign",
  one_time_extension_then_ends: "Extends once on silence, then ends",
  no_renewal_fixed_term: "Fixed term, no renewal",
  continues_until_terminated: "No fixed term, runs until terminated",
  unclear: "Renewal wording is unclear",
  not_found: "No renewal wording found",
};

export function formatMoney(amount, currency = "INR") {
  if (!Number.isFinite(amount)) return "";
  if (currency === "INR") {
    const abs = Math.abs(amount);
    if (abs >= 1e7) return `₹${trimZero(amount / 1e7)} crore`;
    if (abs >= 1e5) return `₹${trimZero(amount / 1e5)} lakh`;
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
  }
  return `${currency} ${Math.round(amount).toLocaleString("en-US")}`;
}

function trimZero(n) {
  const fixed = n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2);
  return fixed.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
}
