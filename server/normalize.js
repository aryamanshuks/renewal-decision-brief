// Makes any model answer safe to use: every field present, the right type, enum values from the allowed list.
// Then converts the flat answer into the nested reading the browser code expects.
import { EXTRACTION_SCHEMA } from "./schema.js";

// Value used when an enum answer is missing or not in the list. Prefer the most cautious option the list offers.
const CAUTIOUS = ["not_found", "not_stated", "unclear", "not_addressed", "not_applicable", "other_or_unclear", "none", "other"];

function coerceEnum(value, allowed) {
  const v = String(value ?? "").toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (allowed.includes(v)) return v;
  return CAUTIOUS.find((c) => allowed.includes(c)) || allowed[0];
}

function coerceNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = parseFloat(String(value ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function coerce(value, schema) {
  if (schema.enum) return coerceEnum(value, schema.enum);
  if (schema.type === "string") return value === null || value === undefined ? "" : String(value);
  if (schema.type === "number") return coerceNumber(value);
  if (schema.type === "array") return (Array.isArray(value) ? value : []).map((item) => coerce(item, schema.items));
  if (schema.type === "object") {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const out = {};
    for (const [key, sub] of Object.entries(schema.properties)) out[key] = coerce(source[key], sub);
    return out;
  }
  return value;
}

const ev = (doc, quote) => ({ doc_id: doc || "", quote: quote || "" });

// House style for the model's own words: no em dashes. Quotes are left exactly as the contract has them.
function tidy(value, key = "") {
  if (typeof value === "string") {
    if (/quote$|doc$/.test(key)) return value;
    return value.replace(/\s*\u2014\s*/g, ", ").replace(/\u2013/g, "-");
  }
  if (Array.isArray(value)) return value.map((v) => tidy(v, key));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = tidy(v, k);
    return out;
  }
  return value;
}

// Flat answer (as the schema asks for it) to the nested reading used by public/js/core/brief.js.
export function toReading(flat) {
  const f = tidy(coerce(flat, EXTRACTION_SCHEMA));
  const { contract: c, term: t, renewal: r, notice: n, price_on_renewal: p, exit_rights: x, precedence: pr } = f;
  return {
    contract: {
      title: c.title, supplier_name: c.supplier_name, customer_name: c.customer_name, contract_type: c.contract_type,
      signed_status: c.signed_status, agreement_date: c.agreement_date, agreement_date_evidence: ev(c.agreement_date_doc, c.agreement_date_quote),
    },
    term: {
      start_basis: t.start_basis, start_date: t.start_date, start_label: t.start_label, start_event_description: t.start_event_description,
      start_evidence: ev(t.start_doc, t.start_quote), initial_term_number: t.initial_term_number, initial_term_unit: t.initial_term_unit,
      fixed_end_date: t.fixed_end_date, initial_term_evidence: ev(t.initial_term_doc, t.initial_term_quote),
    },
    renewal: {
      mechanism: r.mechanism, renewal_term_number: r.renewal_term_number, renewal_term_unit: r.renewal_term_unit,
      if_no_one_acts: r.if_no_one_acts, evidence: ev(r.doc, r.quote),
    },
    notice: {
      period_number: n.period_number, period_unit: n.period_unit, purpose: n.purpose, counted_back_from: n.counted_back_from,
      who_may_give: n.who_may_give, earliest_number: n.earliest_number, earliest_unit: n.earliest_unit, evidence: ev(n.doc, n.quote), delivery_methods: n.delivery_methods, email_is_valid: n.email_is_valid,
      deemed_receipt_number: n.deemed_receipt_number, deemed_receipt_unit: n.deemed_receipt_unit, notice_address: n.notice_address,
      delivery_evidence: ev(n.delivery_doc, n.delivery_quote),
    },
    price_on_renewal: { rule: p.rule, cap_percent: p.cap_percent, summary: p.summary, evidence: ev(p.doc, p.quote) },
    exit_rights: {
      customer_can_terminate_for_convenience: x.customer_can_terminate_for_convenience, convenience_notice_number: x.convenience_notice_number,
      convenience_notice_unit: x.convenience_notice_unit, summary: x.summary, evidence: ev(x.doc, x.quote),
    },
    precedence: { rule: pr.rule, summary: pr.summary, evidence: ev(pr.doc, pr.quote) },
    changes_by_later_documents: f.changes_by_later_documents.map((k) => ({
      field: k.field, earlier_value: k.earlier_value, earlier_evidence: ev(k.earlier_doc, k.earlier_quote),
      later_value: k.later_value, later_evidence: ev(k.later_doc, k.later_quote), which_governs: k.which_governs, basis: k.basis,
    })),
    conflicts: f.conflicts.map((k) => ({
      field: k.field,
      reading_a: k.reading_a, a_number: k.a_number, a_unit: k.a_unit, a_date: k.a_date, evidence_a: ev(k.a_doc, k.a_quote),
      reading_b: k.reading_b, b_number: k.b_number, b_unit: k.b_unit, b_date: k.b_date, evidence_b: ev(k.b_doc, k.b_quote),
      why_unresolved: k.why_unresolved,
    })),
    missing_documents: f.missing_documents.map((k) => ({ name: k.name, why_it_matters: k.why_it_matters, evidence: ev(k.doc, k.quote) })),
    separately_renewing_parts: f.separately_renewing_parts,
    parts_summary: f.parts_summary,
    reader_note: f.reader_note,
  };
}

// Pulls the JSON object out of a text answer, tolerating code fences or a stray sentence around it.
export function extractJson(text) {
  const raw = String(text || "").trim();
  try {
    return JSON.parse(raw);
  } catch {
    // fall through
  }
  const unfenced = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  try {
    return JSON.parse(unfenced);
  } catch {
    // fall through
  }
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end > start) return JSON.parse(raw.slice(start, end + 1));
  throw new Error("No JSON object found");
}
