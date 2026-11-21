// DEV ONLY. Hand-written readings so the screens can be built and tested without an AI key.
// This file is never served by the site. Every reading the site shows comes from a real model call.
// Run the dev server with MOCK=1 to use it.

const E = (doc_id, quote) => ({ doc_id, quote });
const NONE = E("", "");
const CUSTOMER = "Orvanta Commerce Private Limited";

function reading(over) {
  const base = {
    contract: { title: "", supplier_name: "", customer_name: CUSTOMER, contract_type: "", signed_status: "signed", agreement_date: "", agreement_date_evidence: NONE },
    documents: [],
    term: { start_basis: "not_found", start_date: "", start_label: "", start_event_description: "", start_evidence: NONE, initial_term_number: 0, initial_term_unit: "none", fixed_end_date: "", initial_term_evidence: NONE },
    renewal: { mechanism: "not_found", renewal_term_number: 0, renewal_term_unit: "none", if_no_one_acts: "", evidence: NONE },
    notice: { period_number: 0, period_unit: "none", purpose: "not_applicable", counted_back_from: "not_applicable", who_may_give: "not_found", evidence: NONE, delivery_methods: "", email_is_valid: "not_stated", deemed_receipt_number: 0, deemed_receipt_unit: "none", notice_address: "", delivery_evidence: NONE },
    price_on_renewal: { rule: "not_addressed", cap_percent: 0, summary: "", evidence: NONE },
    exit_rights: { customer_can_terminate_for_convenience: "not_stated", convenience_notice_number: 0, convenience_notice_unit: "none", summary: "", evidence: NONE },
    precedence: { rule: "not_stated", summary: "", evidence: NONE },
    changes_by_later_documents: [], conflicts: [], missing_documents: [], reader_note: "",
  };
  for (const k of Object.keys(over)) {
    base[k] = Array.isArray(over[k]) || typeof over[k] !== "object" ? over[k] : { ...base[k], ...over[k] };
  }
  return base;
}

function kestrelway(kind, reworded) {
  const event = kind === "B";
  const renewalQuote = reworded
    ? 'this Agreement will be extended automatically for further periods of twelve months each (each a "Renewal Term"), unless one party notifies the other in writing, no later than ninety days before the term then running expires, that it does not wish to renew.'
    : 'this Agreement shall renew automatically for successive periods of twelve (12) months (each a "Renewal Term") unless either party gives the other written notice of non-renewal at least ninety (90) days before the end of the then-current term.';
  return reading({
    contract: { title: "Master Services Agreement (Logistics)", supplier_name: "Kestrelway Logistics Private Limited", contract_type: "master services agreement", agreement_date: "2025-03-20", agreement_date_evidence: E("D1", 'This Master Services Agreement ("Agreement") is made on 20 March 2025') },
    documents: [{ doc_id: "D1", role: "main_agreement", document_date: "2025-03-20", one_line_summary: "Main logistics services agreement." }],
    term: {
      start_basis: event ? "event_or_date_not_stated_in_documents" : "defined_date_stated_in_documents",
      start_date: event ? "" : "2025-03-20",
      start_label: event ? "Service Commencement Date" : "Effective Date",
      start_event_description: event ? "The first day on which Supplier performs deliveries for Customer under this Agreement." : "",
      start_evidence: event
        ? E("D1", '"Service Commencement Date" means the first day on which Supplier performs deliveries for Customer under this Agreement.')
        : E("D1", 'This Master Services Agreement ("Agreement") is made on 20 March 2025 (the "Effective Date")'),
      initial_term_number: 24, initial_term_unit: "months",
      initial_term_evidence: E("D1", `continues for an initial term of twenty-four (24) months from the ${event ? "Service Commencement Date" : "Effective Date"} (the "Initial Term")`),
    },
    renewal: { mechanism: "automatic", renewal_term_number: 12, renewal_term_unit: "months", if_no_one_acts: "It renews for another twelve months.", evidence: E("D1", renewalQuote) },
    notice: {
      period_number: 90, period_unit: "days", purpose: "to_prevent_renewal", counted_back_from: "end_of_current_term", who_may_give: "either_party",
      evidence: E("D1", renewalQuote),
      delivery_methods: "Registered post or courier to the registered office, marked for the Company Secretary.", email_is_valid: "no", deemed_receipt_number: 3, deemed_receipt_unit: "business_days",
      notice_address: "Plot 14, Transport Nagar, Bengaluru 560 058, attention Company Secretary",
      delivery_evidence: E("D1", "A notice sent by registered post or courier is deemed received three (3) Business Days after posting. Email does not constitute valid notice under this Agreement."),
    },
    price_on_renewal: { rule: "capped_increase", cap_percent: 6, summary: "Supplier may raise rates once a year by up to 6% on 30 days' notice.", evidence: E("D1", "No revision shall exceed six percent (6%) of the rates then in force.") },
    exit_rights: { customer_can_terminate_for_convenience: "no", summary: "No exit for convenience in the initial term. Either party can end it for an unremedied material breach.", evidence: E("D1", "Customer has no right to terminate this Agreement for convenience during the Initial Term.") },
    reader_note: event ? "The term runs from the Service Commencement Date, which is an event. No document gives its calendar date." : "",
  });
}

const brightdesk = () => reading({
  contract: { title: "Software Subscription Agreement", supplier_name: "Brightdesk Software Private Limited", contract_type: "software subscription", agreement_date: "2026-02-15", agreement_date_evidence: E("D1", 'This Agreement is made on 15 February 2026 (the "Effective Date")') },
  documents: [{ doc_id: "D1", role: "main_agreement", document_date: "2026-02-15", one_line_summary: "Helpdesk software subscription." }],
  term: { start_basis: "defined_date_stated_in_documents", start_date: "2026-02-15", start_label: "Effective Date", start_evidence: E("D1", 'This Agreement is made on 15 February 2026 (the "Effective Date")'), initial_term_number: 12, initial_term_unit: "months", initial_term_evidence: E("D1", "This Agreement starts on the Effective Date and continues for an initial term of twelve (12) months.") },
  renewal: { mechanism: "automatic", renewal_term_number: 12, renewal_term_unit: "months", if_no_one_acts: "It renews for another twelve months.", evidence: E("D1", "this Agreement renews automatically for a further period of twelve (12) months unless either party gives the other written notice of non-renewal at least sixty (60) days before the end of the then-current term.") },
  notice: { period_number: 60, period_unit: "days", purpose: "to_prevent_renewal", counted_back_from: "end_of_current_term", who_may_give: "either_party", evidence: E("D1", "unless either party gives the other written notice of non-renewal at least sixty (60) days before the end of the then-current term"), delivery_methods: "Registered post to the other party's registered office.", email_is_valid: "no", deemed_receipt_number: 3, deemed_receipt_unit: "business_days", notice_address: "Unit 5, Tech Park, Baner, Pune 411 045", delivery_evidence: E("D1", "Email is not a valid means of giving notice. A notice sent by registered post is deemed received three (3) business days after posting.") },
  price_on_renewal: { rule: "capped_increase", cap_percent: 7, summary: "Supplier may raise the fee for a renewal term by up to 7% if it tells Customer at least 90 days before.", evidence: E("D1", "Supplier may increase the fee for a renewal term by no more than seven percent (7%), by telling Customer at least ninety (90) days before the renewal term begins.") },
  exit_rights: { customer_can_terminate_for_convenience: "no", summary: "No exit for convenience and no refunds. Either party can end it for an unremedied material breach.", evidence: E("D1", "There is no right to terminate for convenience, and fees paid are not refundable.") },
});

const tallyhand = (withAmendment) => reading({
  contract: { title: "Staffing Services Agreement", supplier_name: "Tallyhand Staffing Private Limited", contract_type: "staffing services", agreement_date: "2024-07-01", agreement_date_evidence: E("D1", 'This Agreement is made on 1 July 2024 (the "Effective Date")') },
  documents: withAmendment
    ? [{ doc_id: "D1", role: "main_agreement", document_date: "2024-07-01", one_line_summary: "Main staffing agreement." }, { doc_id: "D2", role: "amendment", document_date: "2025-12-10", one_line_summary: "Lengthens the term and the notice period." }]
    : [{ doc_id: "D1", role: "main_agreement", document_date: "2024-07-01", one_line_summary: "Main staffing agreement." }],
  term: { start_basis: "defined_date_stated_in_documents", start_date: "2024-07-01", start_label: "Effective Date", start_evidence: E("D1", 'This Agreement is made on 1 July 2024 (the "Effective Date")'), initial_term_number: withAmendment ? 36 : 24, initial_term_unit: "months", initial_term_evidence: withAmendment ? E("D2", '"2.1 This Agreement continues for an initial term of thirty-six (36) months from the Effective Date."') : E("D1", "2.1 This Agreement continues for an initial term of twenty-four (24) months from the Effective Date.") },
  renewal: { mechanism: "automatic", renewal_term_number: 12, renewal_term_unit: "months", if_no_one_acts: "It renews for another twelve months.", evidence: E("D1", "It then renews automatically for successive terms of twelve (12) months unless either party gives written notice of non-renewal not less than thirty (30) days before the expiry of the then-current term.") },
  notice: { period_number: withAmendment ? 90 : 30, period_unit: "days", purpose: "to_prevent_renewal", counted_back_from: "end_of_current_term", who_may_give: "either_party", evidence: withAmendment ? E("D2", 'In clause 2.2 of the Agreement, the words "thirty (30) days" are deleted and replaced with the words "ninety (90) days".') : E("D1", "unless either party gives written notice of non-renewal not less than thirty (30) days before the expiry of the then-current term"), delivery_methods: "By hand, by courier or by email to the stated addresses.", email_is_valid: "yes", deemed_receipt_number: 1, deemed_receipt_unit: "business_days", notice_address: "contracts@tallyhand.example, 22 Residency Road, Bengaluru 560 025", delivery_evidence: E("D1", "A notice sent by email is deemed received on the next Business Day.") },
  price_on_renewal: { rule: "index_linked", cap_percent: 0, summary: "Rates rise each renewal term by the change in the All-India Consumer Price Index.", evidence: E("D1", "For each renewal term the rates increase by the percentage change in the All-India Consumer Price Index over the preceding twelve months.") },
  precedence: withAmendment ? { rule: "later_document_prevails", summary: "If the amendment conflicts with the agreement, the amendment prevails.", evidence: E("D2", "If this Amendment conflicts with the Agreement, this Amendment prevails.") } : { rule: "later_document_prevails", summary: "An amendment prevails over the agreement.", evidence: E("D1", "If an amendment conflicts with this Agreement, the amendment prevails.") },
  changes_by_later_documents: withAmendment ? [
    { field: "initial_term", earlier_value: "24 months", earlier_evidence: E("D1", "2.1 This Agreement continues for an initial term of twenty-four (24) months from the Effective Date."), later_value: "36 months", later_evidence: E("D2", '"2.1 This Agreement continues for an initial term of thirty-six (36) months from the Effective Date."'), which_governs: "later_document", basis: "Amendment No. 1 replaces clause 2.1 and says it prevails." },
    { field: "notice_period", earlier_value: "30 days", earlier_evidence: E("D1", "unless either party gives written notice of non-renewal not less than thirty (30) days before the expiry of the then-current term"), later_value: "90 days", later_evidence: E("D2", 'In clause 2.2 of the Agreement, the words "thirty (30) days" are deleted and replaced with the words "ninety (90) days".'), which_governs: "later_document", basis: "Amendment No. 1 changes clause 2.2 and says it prevails." },
  ] : [],
});

const ivyrock = () => reading({
  contract: { title: "Facilities Management Agreement", supplier_name: "Ivyrock Facilities Private Limited", contract_type: "facilities management", agreement_date: "2024-04-01", agreement_date_evidence: E("D1", "This Agreement is made on 1 April 2024") },
  documents: [{ doc_id: "D1", role: "main_agreement", document_date: "2024-04-01", one_line_summary: "Facilities management agreement." }],
  term: { start_basis: "fixed_calendar_date", start_date: "2024-04-01", start_label: "start date", start_evidence: E("D1", 'The term of this Agreement is thirty-six (36) months, starting on 1 April 2024 and ending on 31 March 2027 (the "Expiry Date").'), initial_term_number: 36, initial_term_unit: "months", fixed_end_date: "2027-03-31", initial_term_evidence: E("D1", 'The term of this Agreement is thirty-six (36) months, starting on 1 April 2024 and ending on 31 March 2027 (the "Expiry Date").') },
  renewal: { mechanism: "one_time_extension_then_ends", renewal_term_number: 6, renewal_term_unit: "months", if_no_one_acts: "It extends once for six months on the same terms, then ends.", evidence: E("D1", "If Customer does not give notice under clause 2.2, this Agreement shall be extended once, automatically, for a period of six (6) months from the Expiry Date on the same terms, and shall then end without further notice.") },
  notice: { period_number: 120, period_unit: "days", purpose: "to_renew", counted_back_from: "end_of_current_term", who_may_give: "customer_only", evidence: E("D1", "Customer may renew this Agreement for a further term of twenty-four (24) months by giving Supplier written notice at least one hundred and twenty (120) days before the Expiry Date."), delivery_methods: "By hand or by courier to the registered office.", email_is_valid: "no", deemed_receipt_number: 0, deemed_receipt_unit: "none", notice_address: "3rd Floor, Lakeview Plaza, Chandigarh 160 017", delivery_evidence: E("D1", "A copy may be sent by email, but email alone is not valid notice.") },
  price_on_renewal: { rule: "capped_increase", cap_percent: 5, summary: "On a renewal the parties renegotiate. Failing agreement, charges rise 5%.", evidence: E("D1", "Failing agreement, the charges increase by five percent (5%).") },
  exit_rights: { customer_can_terminate_for_convenience: "not_stated", summary: "Customer can terminate on 30 days' notice after three failed monthly audits in six months.", evidence: E("D1", "Three failed monthly audits in any six month period entitle Customer to terminate on thirty (30) days' notice.") },
});

const paperlantern = () => reading({
  contract: { title: "Marketing Services Retainer Agreement", supplier_name: "Paper Lantern Creative LLP", contract_type: "marketing retainer", agreement_date: "2025-12-15", agreement_date_evidence: E("D1", "This Agreement is made on 15 December 2025") },
  documents: [{ doc_id: "D1", role: "main_agreement", document_date: "2025-12-15", one_line_summary: "One-year marketing retainer." }],
  term: { start_basis: "fixed_calendar_date", start_date: "2026-01-01", start_label: "start date", start_evidence: E("D1", "This Agreement starts on 1 January 2026 and ends on 31 December 2026."), fixed_end_date: "2026-12-31", initial_term_evidence: E("D1", "This Agreement starts on 1 January 2026 and ends on 31 December 2026.") },
  renewal: { mechanism: "mutual_written_agreement", if_no_one_acts: "It ends on 31 December 2026.", evidence: E("D1", "It does not renew automatically. The parties may renew it only by a written agreement signed by both of them before it ends.") },
  notice: { period_number: 60, period_unit: "days", purpose: "to_terminate_at_any_time", counted_back_from: "any_time", who_may_give: "either_party", evidence: E("D1", "Either party may terminate this Agreement at any time by giving the other sixty (60) days' written notice."), delivery_methods: "By email to the addresses in the Schedule.", email_is_valid: "yes", delivery_evidence: E("D1", "Notices may be given by email to the addresses in the Schedule and are deemed received on the day they are sent.") },
  exit_rights: { customer_can_terminate_for_convenience: "yes", convenience_notice_number: 60, convenience_notice_unit: "days", summary: "Either party can end it at any time on 60 days' written notice.", evidence: E("D1", "Either party may terminate this Agreement at any time by giving the other sixty (60) days' written notice.") },
  missing_documents: [{ name: "The Schedule", why_it_matters: "It holds the email addresses for notices.", evidence: E("D1", "Notices may be given by email to the addresses in the Schedule") }],
});

const quillmarkWithSow = () => reading({
  contract: { title: "Consulting Services Master Agreement", supplier_name: "Quillmark Advisory LLP", contract_type: "consulting master agreement", agreement_date: "2025-05-05", agreement_date_evidence: E("D1", "This Agreement is made on 5 May 2025") },
  documents: [{ doc_id: "D1", role: "main_agreement", document_date: "2025-05-05", one_line_summary: "Master agreement." }, { doc_id: "D2", role: "statement_of_work", document_date: "2025-05-05", one_line_summary: "Pricing strategy engagement for 12 months." }],
  term: { start_basis: "fixed_calendar_date", start_date: "2025-06-01", start_label: "SOW start date", start_evidence: E("D2", "This SOW starts on 1 June 2025 and continues for an initial term of twelve (12) months."), initial_term_number: 12, initial_term_unit: "months", initial_term_evidence: E("D2", "This SOW starts on 1 June 2025 and continues for an initial term of twelve (12) months.") },
  renewal: { mechanism: "automatic", renewal_term_number: 12, renewal_term_unit: "months", if_no_one_acts: "The SOW renews for another twelve months.", evidence: E("D1", "Each SOW renews automatically for successive periods equal to its initial term unless either party gives the other written notice at least forty-five (45) days before the end of its then-current term.") },
  notice: { period_number: 45, period_unit: "days", purpose: "to_prevent_renewal", counted_back_from: "end_of_current_term", who_may_give: "either_party", evidence: E("D1", "unless either party gives the other written notice at least forty-five (45) days before the end of its then-current term"), delivery_methods: "By courier or email to the addresses in the SOW.", email_is_valid: "yes", notice_address: "engagements@quillmark.example", delivery_evidence: E("D1", "Notices must be in writing and sent by courier or email to the addresses given in the applicable SOW.") },
  price_on_renewal: { rule: "supplier_may_change_with_notice", summary: "Consultant may revise its day rates for a renewal period by giving notice before it begins.", evidence: E("D1", "Consultant may revise its day rates for a renewal period by giving notice before that period begins.") },
  precedence: { rule: "order_form_prevails", summary: "If the agreement and an SOW conflict, the SOW prevails.", evidence: E("D1", "If there is a conflict between this Agreement and an SOW, the SOW prevails.") },
});

const quillmark = () => reading({
  contract: { title: "Consulting Services Master Agreement", supplier_name: "Quillmark Advisory LLP", contract_type: "consulting master agreement", agreement_date: "2025-05-05", agreement_date_evidence: E("D1", "This Agreement is made on 5 May 2025") },
  documents: [{ doc_id: "D1", role: "main_agreement", document_date: "2025-05-05", one_line_summary: "Master agreement. Terms of each engagement sit in a statement of work." }],
  term: { start_basis: "not_found", start_label: "SOW term", start_evidence: E("D1", "The term, fees and deliverables for each engagement are set out in the applicable SOW.") },
  renewal: { mechanism: "automatic", if_no_one_acts: "Each SOW renews for a period equal to its initial term.", evidence: E("D1", "Each SOW renews automatically for successive periods equal to its initial term unless either party gives the other written notice at least forty-five (45) days before the end of its then-current term.") },
  notice: { period_number: 45, period_unit: "days", purpose: "to_prevent_renewal", counted_back_from: "end_of_current_term", who_may_give: "either_party", evidence: E("D1", "unless either party gives the other written notice at least forty-five (45) days before the end of its then-current term"), delivery_methods: "By courier or email to the addresses in the applicable SOW.", email_is_valid: "yes", delivery_evidence: E("D1", "Notices must be in writing and sent by courier or email to the addresses given in the applicable SOW.") },
  price_on_renewal: { rule: "supplier_may_change_with_notice", summary: "Consultant may revise its day rates for a renewal period by giving notice before it begins.", evidence: E("D1", "Consultant may revise its day rates for a renewal period by giving notice before that period begins.") },
  precedence: { rule: "order_form_prevails", summary: "If the agreement and an SOW conflict, the SOW prevails.", evidence: E("D1", "If there is a conflict between this Agreement and an SOW, the SOW prevails.") },
  missing_documents: [{ name: "SOW No. 1", why_it_matters: "It sets the term, the fees and the notice addresses. No renewal date can be worked out without it.", evidence: E("D1", "The parties have signed SOW No. 1 on the date of this Agreement.") }],
  reader_note: "The renewal rule is here, but the term it applies to is in SOW No. 1, which was not provided.",
});

const datavine = () => reading({
  contract: { title: "Master Subscription Agreement", supplier_name: "Datavine Analytics Private Limited", contract_type: "software subscription", agreement_date: "2026-02-20", agreement_date_evidence: E("D1", "This Agreement is made on 20 February 2026") },
  documents: [{ doc_id: "D1", role: "main_agreement", document_date: "2026-02-20", one_line_summary: "Master subscription terms." }, { doc_id: "D2", role: "order_form", document_date: "2026-02-20", one_line_summary: "Order for 40 dashboard seats for 12 months." }],
  term: { start_basis: "fixed_calendar_date", start_date: "2026-03-01", start_label: "Subscription start date", start_evidence: E("D2", "Subscription start date: 1 March 2026."), initial_term_number: 12, initial_term_unit: "months", initial_term_evidence: E("D2", "Subscription term: 12 months.") },
  renewal: { mechanism: "automatic", renewal_term_number: 12, renewal_term_unit: "months", if_no_one_acts: "The subscription renews for another twelve months.", evidence: E("D1", "Each subscription term renews automatically for successive periods of twelve (12) months unless either party gives written notice of non-renewal at least sixty (60) days before the end of the then-current subscription term.") },
  notice: { period_number: 60, period_unit: "days", purpose: "to_prevent_renewal", counted_back_from: "end_of_current_term", who_may_give: "either_party", evidence: E("D1", "unless either party gives written notice of non-renewal at least sixty (60) days before the end of the then-current subscription term"), delivery_methods: "By email to the notice address in the Order Form.", email_is_valid: "yes", deemed_receipt_number: 1, deemed_receipt_unit: "business_days", notice_address: "renewals@datavine.example", delivery_evidence: E("D1", "A notice is deemed received on the Business Day after it is sent.") },
  precedence: { rule: "unclear", summary: "Each document says it prevails over the other.", evidence: E("D1", "If there is a conflict between this Agreement and an Order Form, this Agreement prevails.") },
  conflicts: [{
    field: "notice_period",
    reading_a: "60 days' notice, from the Master Subscription Agreement", a_number: 60, a_unit: "days", a_date: "",
    evidence_a: E("D1", "unless either party gives written notice of non-renewal at least sixty (60) days before the end of the then-current subscription term"),
    reading_b: "30 days' notice, from Order Form No. 1", b_number: 30, b_unit: "days", b_date: "",
    evidence_b: E("D2", "This Order Form renews automatically for successive 12 month terms unless either party gives notice of non-renewal at least thirty (30) days before the end of the then-current term."),
    why_unresolved: "Each document says it prevails over the other, so the documents do not settle which notice period applies.",
  }],
});

const signalroot = () => reading({
  contract: { title: "Internet Leased Line Service Agreement", supplier_name: "Signalroot Telecom Private Limited", contract_type: "telecom services", agreement_date: "2023-08-10", agreement_date_evidence: E("D1", "This Agreement is made on 10 August 2023") },
  documents: [{ doc_id: "D1", role: "main_agreement", document_date: "2023-08-10", one_line_summary: "Leased line service with no fixed term." }],
  term: { start_basis: "defined_date_stated_in_documents", start_date: "2023-08-10", start_label: "date of this Agreement", start_evidence: E("D1", "This Agreement starts on the date of this Agreement and continues until terminated.") },
  renewal: { mechanism: "continues_until_terminated", if_no_one_acts: "It keeps running until one side ends it.", evidence: E("D1", "This Agreement starts on the date of this Agreement and continues until terminated.") },
  notice: { period_number: 30, period_unit: "days", purpose: "to_terminate_at_any_time", counted_back_from: "any_time", who_may_give: "either_party", evidence: E("D1", "Either party may terminate it at any time by giving the other thirty (30) days' written notice."), delivery_methods: "By email to accounts@signalroot.example.", email_is_valid: "yes", notice_address: "accounts@signalroot.example", delivery_evidence: E("D1", "Notices may be given by email to accounts@signalroot.example and are deemed received on the day they are sent.") },
  price_on_renewal: { rule: "supplier_may_change_with_notice", summary: "Supplier may revise the monthly charge on 60 days' written notice.", evidence: E("D1", "Supplier may revise the charge by giving sixty (60) days' written notice.") },
  exit_rights: { customer_can_terminate_for_convenience: "yes", convenience_notice_number: 30, convenience_notice_unit: "days", summary: "Either party can end it at any time on 30 days' written notice.", evidence: E("D1", "Either party may terminate it at any time by giving the other thirty (30) days' written notice.") },
});

const draft = () => reading({
  contract: { title: "Software Subscription Agreement", supplier_name: "Brightdesk Software Private Limited", contract_type: "software subscription", signed_status: "unsigned_or_draft", agreement_date: "", agreement_date_evidence: E("D1", "DRAFT FOR DISCUSSION. NOT YET SIGNED. Version 3, circulated 2 November 2026.") },
  documents: [{ doc_id: "D1", role: "main_agreement", document_date: "", one_line_summary: "Unsigned draft of a subscription agreement." }],
  term: { start_basis: "event_or_date_not_stated_in_documents", start_label: "Effective Date", start_event_description: "The Effective Date is left blank in this draft.", start_evidence: E("D1", 'This Agreement is made on [date] (the "Effective Date")'), initial_term_number: 36, initial_term_unit: "months", initial_term_evidence: E("D1", "This Agreement starts on the Effective Date and continues for an initial term of thirty-six (36) months.") },
  renewal: { mechanism: "automatic", renewal_term_number: 12, renewal_term_unit: "months", if_no_one_acts: "It would renew for another twelve months.", evidence: E("D1", "This Agreement renews automatically for further periods of twelve (12) months unless either party gives written notice of non-renewal at least one hundred and eighty (180) days before the end of the then-current term.") },
  notice: { period_number: 180, period_unit: "days", purpose: "to_prevent_renewal", counted_back_from: "end_of_current_term", who_may_give: "either_party", evidence: E("D1", "unless either party gives written notice of non-renewal at least one hundred and eighty (180) days before the end of the then-current term") },
  price_on_renewal: { rule: "supplier_may_change_with_notice", summary: "Supplier may increase the renewal fee at its discretion.", evidence: E("D1", "Supplier may increase the fee for a renewal term at its discretion.") },
  reader_note: "This is marked as an unsigned draft and the signature lines are blank.",
});

// A reading with a quote that is not in the document, to exercise the "passage not verified" path.
const invented = () => {
  const r = brightdesk();
  r.notice.evidence = E("D1", "Either party may cancel the renewal by giving forty-five (45) days' notice in writing.");
  r.notice.period_number = 45;
  return r;
};

export function mockFor(documents) {
  const first = documents[0]?.text || "";
  const all = documents.map((d) => d.text).join("\n");
  if (/MOCK-UNVERIFIED/.test(all)) return invented();
  if (/DRAFT FOR DISCUSSION/.test(first)) return draft();
  if (/Kestrelway/.test(first)) {
    const kind = /months from the Service Commencement Date/.test(first) ? "B" : "A";
    return kestrelway(kind, /will be extended automatically/.test(first));
  }
  if (/Brightdesk/.test(first)) return brightdesk();
  if (/Tallyhand/.test(first)) return tallyhand(documents.length > 1);
  if (/Ivyrock/.test(first)) return ivyrock();
  if (/Paper Lantern/.test(first)) return paperlantern();
  if (/Quillmark/.test(first)) return documents.length > 1 ? quillmarkWithSow() : quillmark();
  if (/Datavine/.test(first)) return datavine();
  if (/Signalroot/.test(first)) return signalroot();
  return reading({ reader_note: "Mock mode has no reading for this text." });
}
