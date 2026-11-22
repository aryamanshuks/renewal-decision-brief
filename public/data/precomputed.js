// Real readings by the live model, captured on the deployed site on 22 Nov 2026 (IST) and saved here
// so the first screen is instant. The product labels them as saved readings. "Read again live" calls the model.
// All eight were read again with prompt v6 on 22 Nov 2026, so every saved reading carries the fields the current checks use.
// Earlier versions of these readings, and what changed, are in the git history and on the test bench.
// Nothing here was edited by hand.
export const PRECOMPUTED = {
 "kestrelway": {
  "result": {
   "contract": {
    "title": "MASTER SERVICES AGREEMENT (LOGISTICS)",
    "supplier_name": "Kestrelway Logistics Private Limited",
    "customer_name": "Orvanta Commerce Private Limited",
    "contract_type": "master services agreement for logistics and parcel delivery",
    "signed_status": "signed",
    "agreement_date": "2025-03-20",
    "agreement_date_evidence": {
     "doc_id": "D1",
     "quote": "This Master Services Agreement (\"Agreement\") is made on 20 March 2025 between:"
    }
   },
   "term": {
    "start_basis": "event_or_date_not_stated_in_documents",
    "start_date": "",
    "start_label": "Service Commencement Date",
    "start_event_description": "The first day on which the supplier performs deliveries for the customer under the agreement; no calendar date is written.",
    "start_evidence": {
     "doc_id": "D1",
     "quote": "\"Service Commencement Date\" means the first day on which Supplier performs deliveries for Customer under this Agreement."
    },
    "initial_term_number": 24,
    "initial_term_unit": "months",
    "fixed_end_date": "",
    "initial_term_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement comes into force on the date written above and continues for an initial term of twenty-four (24) months from the Service Commencement Date (the \"Initial Term\")."
    },
    "end_condition": "none",
    "agreement_limit": {
     "number": 0,
     "unit": "none",
     "end_date": "",
     "evidence": {
      "doc_id": "",
      "quote": ""
     }
    }
   },
   "renewal": {
    "mechanism": "automatic",
    "renewal_term_number": 12,
    "renewal_term_unit": "months",
    "if_no_one_acts": "The agreement renews automatically for another 12 months at the end of the Initial Term and each Renewal Term.",
    "evidence": {
     "doc_id": "D1",
     "quote": "After the Initial Term, this Agreement shall renew automatically for successive periods of twelve (12) months (each a \"Renewal Term\") unless either party gives the other written notice of non-renewal at least ninety (90) days before the end of the then-current term."
    }
   },
   "notice": {
    "period_number": 90,
    "period_unit": "days",
    "purpose": "to_prevent_renewal",
    "counted_back_from": "end_of_current_term",
    "who_may_give": "either_party",
    "earliest_number": 0,
    "earliest_unit": "none",
    "fixed_month_day": "",
    "evidence": {
     "doc_id": "D1",
     "quote": "unless either party gives the other written notice of non-renewal at least ninety (90) days before the end of the then-current term."
    },
    "delivery_methods": "In writing by registered post or courier to the other party's registered office, marked for the attention of the Company Secretary.",
    "email_is_valid": "no",
    "deemed_receipt_number": 3,
    "deemed_receipt_unit": "business_days",
    "notice_address": "Plot 14, Transport Nagar, Bengaluru 560 058",
    "delivery_evidence": {
     "doc_id": "D1",
     "quote": "A notice sent by registered post or courier is deemed received three (3) Business Days after posting. Email does not constitute valid notice under this Agreement."
    }
   },
   "price_on_renewal": {
    "rule": "capped_increase",
    "cap_percent": 6,
    "summary": "The supplier may revise rates once each year of the term on 30 days' notice, with each revision capped at 6% of the rates then in force.",
    "evidence": {
     "doc_id": "D1",
     "quote": "Supplier may revise the rates once in each year of the term by giving thirty (30) days' notice. No revision shall exceed six percent (6%) of the rates then in force."
    }
   },
   "exit_rights": {
    "customer_can_terminate_for_convenience": "no",
    "convenience_notice_number": 0,
    "convenience_notice_unit": "none",
    "summary": "The customer cannot terminate for convenience during the Initial Term, and can otherwise exit by non-renewal notice or for uncured material breach.",
    "evidence": {
     "doc_id": "D1",
     "quote": "Customer has no right to terminate this Agreement for convenience during the Initial Term."
    }
   },
   "precedence": {
    "rule": "not_stated",
    "summary": "",
    "evidence": {
     "doc_id": "",
     "quote": ""
    }
   },
   "changes_by_later_documents": [],
   "conflicts": [],
   "missing_documents": [
    {
     "name": "Schedule 1 and Schedule 2",
     "why_it_matters": "The schedules are referred to for services and rates but were not provided, and could contain pricing terms.",
     "evidence": {
      "doc_id": "D1",
      "quote": "Customer shall pay the per-parcel rates in Schedule 2."
     }
    }
   ],
   "separately_renewing_parts": 1,
   "parts_summary": "",
   "reader_note": "The term runs from the first delivery date, which is not stated, so the end date cannot be fixed from the documents. Clause 1.4 treats earlier deliveries as made under this agreement, but the term still runs from the Service Commencement Date."
  },
  "meta": {
   "model": "claude-sonnet-5-5",
   "effort": "medium",
   "mode": "prompt",
   "attempts": 1,
   "ms": 8099,
   "input_tokens": 8278,
   "output_tokens": 1546,
   "stop_reason": "end_turn",
   "request_id": "req_011ChHF9oh77h34a5UsssfSs",
   "ran_at": "2026-11-22T03:19:33.982Z",
   "prompt": "v6",
   "documents": [
    {
     "id": "D1",
     "name": "Kestrelway MSA (signed 20 Mar 2025).pdf",
     "chars": 3240
    }
   ]
  }
 },
 "brightdesk": {
  "result": {
   "contract": {
    "title": "SOFTWARE SUBSCRIPTION AGREEMENT",
    "supplier_name": "Brightdesk Software Private Limited",
    "customer_name": "Orvanta Commerce Private Limited",
    "contract_type": "software subscription",
    "signed_status": "signed",
    "agreement_date": "2026-02-15",
    "agreement_date_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement is made on 15 February 2026 (the \"Effective Date\")"
    }
   },
   "term": {
    "start_basis": "defined_date_stated_in_documents",
    "start_date": "2026-02-15",
    "start_label": "Effective Date",
    "start_event_description": "",
    "start_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement starts on the Effective Date and continues for an initial term of twelve (12) months."
    },
    "initial_term_number": 12,
    "initial_term_unit": "months",
    "fixed_end_date": "",
    "initial_term_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement starts on the Effective Date and continues for an initial term of twelve (12) months."
    },
    "end_condition": "none",
    "agreement_limit": {
     "number": 0,
     "unit": "none",
     "end_date": "",
     "evidence": {
      "doc_id": "",
      "quote": ""
     }
    }
   },
   "renewal": {
    "mechanism": "automatic",
    "renewal_term_number": 12,
    "renewal_term_unit": "months",
    "if_no_one_acts": "The agreement renews for a further twelve months at the end of each term.",
    "evidence": {
     "doc_id": "D1",
     "quote": "this Agreement renews automatically for a further period of twelve (12) months unless either party gives the other written notice of non-renewal at least sixty (60) days before the end of the then-current term."
    }
   },
   "notice": {
    "period_number": 60,
    "period_unit": "days",
    "purpose": "to_prevent_renewal",
    "counted_back_from": "end_of_current_term",
    "who_may_give": "either_party",
    "earliest_number": 0,
    "earliest_unit": "none",
    "fixed_month_day": "",
    "evidence": {
     "doc_id": "D1",
     "quote": "unless either party gives the other written notice of non-renewal at least sixty (60) days before the end of the then-current term."
    },
    "delivery_methods": "In writing, sent by registered post to the other party's registered office.",
    "email_is_valid": "no",
    "deemed_receipt_number": 3,
    "deemed_receipt_unit": "business_days",
    "notice_address": "Unit 5, Tech Park, Baner, Pune 411 045",
    "delivery_evidence": {
     "doc_id": "D1",
     "quote": "Notices must be in writing and sent by registered post to the other party's registered office. Email is not a valid means of giving notice."
    }
   },
   "price_on_renewal": {
    "rule": "capped_increase",
    "cap_percent": 7,
    "summary": "Supplier may raise the fee for a renewal term by up to 7% if it tells Customer at least 90 days before the renewal term begins.",
    "evidence": {
     "doc_id": "D1",
     "quote": "Supplier may increase the fee for a renewal term by no more than seven percent (7%), by telling Customer at least ninety (90) days before the renewal term begins."
    }
   },
   "exit_rights": {
    "customer_can_terminate_for_convenience": "no",
    "convenience_notice_number": 0,
    "convenience_notice_unit": "none",
    "summary": "Customer can exit by giving non-renewal notice before a term ends, or by terminating for an unremedied material breach, but not for convenience.",
    "evidence": {
     "doc_id": "D1",
     "quote": "There is no right to terminate for convenience, and fees paid are not refundable."
    }
   },
   "precedence": {
    "rule": "not_stated",
    "summary": "",
    "evidence": {
     "doc_id": "",
     "quote": ""
    }
   },
   "changes_by_later_documents": [],
   "conflicts": [],
   "missing_documents": [],
   "separately_renewing_parts": 1,
   "parts_summary": "",
   "reader_note": "The supplier's price increase notice (90 days) is due before the customer's non-renewal deadline (60 days), so the customer will know the new price before it must decide."
  },
  "meta": {
   "model": "claude-sonnet-5-5",
   "effort": "medium",
   "mode": "prompt",
   "attempts": 1,
   "ms": 6752,
   "input_tokens": 7833,
   "output_tokens": 1277,
   "stop_reason": "end_turn",
   "request_id": "req_011ChHFAR1P9gqhwFT6uVgzQ",
   "ran_at": "2026-11-22T03:19:40.994Z",
   "prompt": "v6",
   "documents": [
    {
     "id": "D1",
     "name": "Brightdesk Subscription Agreement.pdf",
     "chars": 2048
    }
   ]
  }
 },
 "tallyhand": {
  "result": {
   "contract": {
    "title": "STAFFING SERVICES AGREEMENT",
    "supplier_name": "Tallyhand Staffing Private Limited",
    "customer_name": "Orvanta Commerce Private Limited",
    "contract_type": "staffing services agreement for temporary warehouse and customer support staff",
    "signed_status": "signed",
    "agreement_date": "2024-07-01",
    "agreement_date_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement is made on 1 July 2024 (the \"Effective Date\")"
    }
   },
   "term": {
    "start_basis": "defined_date_stated_in_documents",
    "start_date": "2024-07-01",
    "start_label": "Effective Date",
    "start_event_description": "",
    "start_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement is made on 1 July 2024 (the \"Effective Date\")"
    },
    "initial_term_number": 36,
    "initial_term_unit": "months",
    "fixed_end_date": "",
    "initial_term_evidence": {
     "doc_id": "D2",
     "quote": "\"2.1 This Agreement continues for an initial term of thirty-six (36) months from the Effective Date.\""
    },
    "end_condition": "none",
    "agreement_limit": {
     "number": 0,
     "unit": "none",
     "end_date": "",
     "evidence": {
      "doc_id": "",
      "quote": ""
     }
    }
   },
   "renewal": {
    "mechanism": "automatic",
    "renewal_term_number": 12,
    "renewal_term_unit": "months",
    "if_no_one_acts": "At the end of the initial term the agreement renews automatically for a further 12 months, and again each year after that.",
    "evidence": {
     "doc_id": "D1",
     "quote": "It then renews automatically for successive terms of twelve (12) months unless either party gives written notice of non-renewal not less than thirty (30) days before the expiry of the then-current term."
    }
   },
   "notice": {
    "period_number": 90,
    "period_unit": "days",
    "purpose": "to_prevent_renewal",
    "counted_back_from": "end_of_current_term",
    "who_may_give": "either_party",
    "earliest_number": 0,
    "earliest_unit": "none",
    "fixed_month_day": "",
    "evidence": {
     "doc_id": "D2",
     "quote": "In clause 2.2 of the Agreement, the words \"thirty (30) days\" are deleted and replaced with the words \"ninety (90) days\"."
    },
    "delivery_methods": "In writing, delivered by hand, by courier or by email to the addresses listed in the agreement.",
    "email_is_valid": "yes",
    "deemed_receipt_number": 0,
    "deemed_receipt_unit": "none",
    "notice_address": "22 Residency Road, Bengaluru 560 025",
    "delivery_evidence": {
     "doc_id": "D1",
     "quote": "Notices shall be in writing and delivered by hand, by courier or by email to the addresses set out below. A notice sent by email is deemed received on the next Business Day."
    }
   },
   "price_on_renewal": {
    "rule": "index_linked",
    "cap_percent": 0,
    "summary": "Rates are fixed for the initial term, then rise each renewal term by the change in the All-India Consumer Price Index over the prior twelve months, with no cap.",
    "evidence": {
     "doc_id": "D1",
     "quote": "For each renewal term the rates increase by the percentage change in the All-India Consumer Price Index over the preceding twelve months."
    }
   },
   "exit_rights": {
    "customer_can_terminate_for_convenience": "not_stated",
    "convenience_notice_number": 0,
    "convenience_notice_unit": "none",
    "summary": "No right to terminate for convenience is stated, so the customer's exit is by giving non-renewal notice of 90 days before the term ends.",
    "evidence": {
     "doc_id": "D2",
     "quote": "In clause 2.2 of the Agreement, the words \"thirty (30) days\" are deleted and replaced with the words \"ninety (90) days\"."
    }
   },
   "precedence": {
    "rule": "later_document_prevails",
    "summary": "An amendment prevails over the Agreement if they conflict, and Amendment No. 1 says the same of itself.",
    "evidence": {
     "doc_id": "D1",
     "quote": "If an amendment conflicts with this Agreement, the amendment prevails."
    }
   },
   "changes_by_later_documents": [
    {
     "field": "initial_term",
     "earlier_value": "Initial term of 24 months from the Effective Date.",
     "earlier_evidence": {
      "doc_id": "D1",
      "quote": "This Agreement continues for an initial term of twenty-four (24) months from the Effective Date."
     },
     "later_value": "Initial term of 36 months from the Effective Date.",
     "later_evidence": {
      "doc_id": "D2",
      "quote": "\"2.1 This Agreement continues for an initial term of thirty-six (36) months from the Effective Date.\""
     },
     "which_governs": "later_document",
     "basis": "Amendment No. 1 deletes and replaces clause 2.1 and states that it prevails over the Agreement."
    },
    {
     "field": "notice_period",
     "earlier_value": "Non-renewal notice of 30 days before expiry of the term.",
     "earlier_evidence": {
      "doc_id": "D1",
      "quote": "unless either party gives written notice of non-renewal not less than thirty (30) days before the expiry of the then-current term."
     },
     "later_value": "Non-renewal notice of 90 days before expiry of the term.",
     "later_evidence": {
      "doc_id": "D2",
      "quote": "In clause 2.2 of the Agreement, the words \"thirty (30) days\" are deleted and replaced with the words \"ninety (90) days\"."
     },
     "which_governs": "later_document",
     "basis": "Amendment No. 1 expressly replaces the words in clause 2.2 and prevails over the Agreement."
    }
   ],
   "conflicts": [],
   "missing_documents": [
    {
     "name": "Revised rate card attached to Amendment No. 1",
     "why_it_matters": "The replacement Annexure A sets the rates from 1 January 2026 and may affect price terms, but it was not provided.",
     "evidence": {
      "doc_id": "D2",
      "quote": "Annexure A to the Agreement is replaced with the revised rate card attached to this Amendment, with effect from 1 January 2026."
     }
    }
   ],
   "separately_renewing_parts": 1,
   "parts_summary": "",
   "reader_note": "The amendment was signed on 10 December 2025, and the initial term now ends 36 months after 1 July 2024, so the longer 90-day notice window applies. The original 24-month term would have ended before the amendment's new term runs out, so check that the amendment was effective in time."
  },
  "meta": {
   "model": "claude-sonnet-5-5",
   "effort": "medium",
   "mode": "prompt",
   "attempts": 1,
   "ms": 11505,
   "input_tokens": 8358,
   "output_tokens": 2040,
   "stop_reason": "end_turn",
   "request_id": "req_011ChHFAxC7mdERovaddmf3c",
   "ran_at": "2026-11-22T03:19:53.033Z",
   "prompt": "v6",
   "documents": [
    {
     "id": "D1",
     "name": "Tallyhand Staffing Agreement (1 Jul 2024).pdf",
     "chars": 1936
    },
    {
     "id": "D2",
     "name": "Amendment No. 1 (10 Dec 2025).pdf",
     "chars": 1189
    }
   ]
  }
 },
 "ivyrock": {
  "result": {
   "contract": {
    "title": "FACILITIES MANAGEMENT AGREEMENT",
    "supplier_name": "Ivyrock Facilities Private Limited",
    "customer_name": "Orvanta Commerce Private Limited",
    "contract_type": "facilities management services agreement",
    "signed_status": "signed",
    "agreement_date": "2024-04-01",
    "agreement_date_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement is made on 1 April 2024 between Ivyrock Facilities Private Limited"
    }
   },
   "term": {
    "start_basis": "fixed_calendar_date",
    "start_date": "2024-04-01",
    "start_label": "Start of term",
    "start_event_description": "",
    "start_evidence": {
     "doc_id": "D1",
     "quote": "The term of this Agreement is thirty-six (36) months, starting on 1 April 2024 and ending on 31 March 2027 (the \"Expiry Date\")."
    },
    "initial_term_number": 36,
    "initial_term_unit": "months",
    "fixed_end_date": "2027-03-31",
    "initial_term_evidence": {
     "doc_id": "D1",
     "quote": "The term of this Agreement is thirty-six (36) months, starting on 1 April 2024 and ending on 31 March 2027 (the \"Expiry Date\")."
    },
    "end_condition": "none",
    "agreement_limit": {
     "number": 0,
     "unit": "none",
     "end_date": "",
     "evidence": {
      "doc_id": "",
      "quote": ""
     }
    }
   },
   "renewal": {
    "mechanism": "one_time_extension_then_ends",
    "renewal_term_number": 6,
    "renewal_term_unit": "months",
    "if_no_one_acts": "The agreement is extended once automatically for six months after the Expiry Date and then ends without further notice.",
    "evidence": {
     "doc_id": "D1",
     "quote": "If Customer does not give notice under clause 2.2, this Agreement shall be extended once, automatically, for a period of six (6) months from the Expiry Date on the same terms, and shall then end without further notice."
    }
   },
   "notice": {
    "period_number": 120,
    "period_unit": "days",
    "purpose": "to_renew",
    "counted_back_from": "end_of_current_term",
    "who_may_give": "customer_only",
    "earliest_number": 0,
    "earliest_unit": "none",
    "fixed_month_day": "",
    "evidence": {
     "doc_id": "D1",
     "quote": "Customer may renew this Agreement for a further term of twenty-four (24) months by giving Supplier written notice at least one hundred and twenty (120) days before the Expiry Date."
    },
    "delivery_methods": "In writing, delivered by hand or by courier to the other party's registered office.",
    "email_is_valid": "no",
    "deemed_receipt_number": 0,
    "deemed_receipt_unit": "none",
    "notice_address": "3rd Floor, Lakeview Plaza, Chandigarh 160 017",
    "delivery_evidence": {
     "doc_id": "D1",
     "quote": "A notice must be in writing and delivered by hand or by courier to the other party's registered office. It is deemed received on delivery. A copy may be sent by email, but email alone is not valid notice."
    }
   },
   "price_on_renewal": {
    "rule": "capped_increase",
    "cap_percent": 5,
    "summary": "On a customer renewal the parties renegotiate in good faith, and failing agreement the charges rise by 5 percent; the six-month silent extension is on the same terms.",
    "evidence": {
     "doc_id": "D1",
     "quote": "On a renewal under clause 2.2 the parties shall renegotiate the charges in good faith. Failing agreement, the charges increase by five percent (5%)."
    }
   },
   "exit_rights": {
    "customer_can_terminate_for_convenience": "no",
    "convenience_notice_number": 0,
    "convenience_notice_unit": "none",
    "summary": "No termination for convenience is stated; the customer can terminate on 30 days' notice after three failed monthly audits in any six month period, or let the agreement run out.",
    "evidence": {
     "doc_id": "D1",
     "quote": "Three failed monthly audits in any six month period entitle Customer to terminate on thirty (30) days' notice."
    }
   },
   "precedence": {
    "rule": "not_stated",
    "summary": "",
    "evidence": {
     "doc_id": "",
     "quote": ""
    }
   },
   "changes_by_later_documents": [],
   "conflicts": [],
   "missing_documents": [
    {
     "name": "Schedule A",
     "why_it_matters": "It describes the services and could contain terms affecting scope or charges, though it was not provided.",
     "evidence": {
      "doc_id": "D1",
      "quote": "as described in Schedule A"
     }
    },
    {
     "name": "Schedule B",
     "why_it_matters": "It sets service standards that determine the audit based termination right.",
     "evidence": {
      "doc_id": "D1",
      "quote": "Supplier shall meet the cleaning and response standards in Schedule B."
     }
    }
   ],
   "separately_renewing_parts": 1,
   "parts_summary": "",
   "reader_note": "The customer must give 120 days' written notice by hand or courier before 31 March 2027 to renew for 24 months, otherwise the agreement extends only six months and then ends. Email alone is not valid notice."
  },
  "meta": {
   "model": "claude-sonnet-5-5",
   "effort": "medium",
   "mode": "prompt",
   "attempts": 1,
   "ms": 7907,
   "input_tokens": 7833,
   "output_tokens": 1590,
   "stop_reason": "end_turn",
   "request_id": "req_011ChHFBqHuzFRcecXpFLZez",
   "ran_at": "2026-11-22T03:20:01.389Z",
   "prompt": "v6",
   "documents": [
    {
     "id": "D1",
     "name": "Ivyrock Facilities Agreement.pdf",
     "chars": 1875
    }
   ]
  }
 },
 "paperlantern": {
  "result": {
   "contract": {
    "title": "MARKETING SERVICES RETAINER AGREEMENT",
    "supplier_name": "Paper Lantern Creative LLP",
    "customer_name": "Orvanta Commerce Private Limited",
    "contract_type": "marketing services retainer agreement",
    "signed_status": "signed",
    "agreement_date": "2025-12-15",
    "agreement_date_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement is made on 15 December 2025 between Paper Lantern Creative LLP"
    }
   },
   "term": {
    "start_basis": "fixed_calendar_date",
    "start_date": "2026-01-01",
    "start_label": "Start date",
    "start_event_description": "",
    "start_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement starts on 1 January 2026 and ends on 31 December 2026."
    },
    "initial_term_number": 0,
    "initial_term_unit": "none",
    "fixed_end_date": "2026-12-31",
    "initial_term_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement starts on 1 January 2026 and ends on 31 December 2026."
    },
    "end_condition": "none",
    "agreement_limit": {
     "number": 0,
     "unit": "none",
     "end_date": "",
     "evidence": {
      "doc_id": "",
      "quote": ""
     }
    }
   },
   "renewal": {
    "mechanism": "no_renewal_fixed_term",
    "renewal_term_number": 0,
    "renewal_term_unit": "none",
    "if_no_one_acts": "The agreement ends on 31 December 2026 and does not renew.",
    "evidence": {
     "doc_id": "D1",
     "quote": "It does not renew automatically. The parties may renew it only by a written agreement signed by both of them before it ends."
    }
   },
   "notice": {
    "period_number": 0,
    "period_unit": "none",
    "purpose": "not_applicable",
    "counted_back_from": "not_applicable",
    "who_may_give": "not_found",
    "earliest_number": 0,
    "earliest_unit": "none",
    "fixed_month_day": "",
    "evidence": {
     "doc_id": "",
     "quote": ""
    },
    "delivery_methods": "Email to the addresses listed in the Schedule.",
    "email_is_valid": "yes",
    "deemed_receipt_number": 0,
    "deemed_receipt_unit": "none",
    "notice_address": "41 Hauz Khas Village, New Delhi 110 016",
    "delivery_evidence": {
     "doc_id": "D1",
     "quote": "Notices may be given by email to the addresses in the Schedule and are deemed received on the day they are sent."
    }
   },
   "price_on_renewal": {
    "rule": "not_addressed",
    "cap_percent": 0,
    "summary": "The agreement does not renew automatically and says nothing about price on any renewal.",
    "evidence": {
     "doc_id": "",
     "quote": ""
    }
   },
   "exit_rights": {
    "customer_can_terminate_for_convenience": "yes",
    "convenience_notice_number": 60,
    "convenience_notice_unit": "days",
    "summary": "The customer may end the agreement at any time by giving sixty days' written notice.",
    "evidence": {
     "doc_id": "D1",
     "quote": "Either party may terminate this Agreement at any time by giving the other sixty (60) days' written notice."
    }
   },
   "precedence": {
    "rule": "not_stated",
    "summary": "",
    "evidence": {
     "doc_id": "",
     "quote": ""
    }
   },
   "changes_by_later_documents": [],
   "conflicts": [],
   "missing_documents": [
    {
     "name": "Schedule",
     "why_it_matters": "It holds the email addresses for notices, which are not provided, and could affect valid delivery of notice.",
     "evidence": {
      "doc_id": "D1",
      "quote": "Notices may be given by email to the addresses in the Schedule and are deemed received on the day they are sent."
     }
    }
   ],
   "separately_renewing_parts": 1,
   "parts_summary": "",
   "reader_note": "The agreement lapses on 31 December 2026 unless both parties sign a written renewal before then. Notices are deemed received the day they are sent, and the Schedule with the email addresses was not provided."
  },
  "meta": {
   "model": "claude-sonnet-5-5",
   "effort": "medium",
   "mode": "prompt",
   "attempts": 1,
   "ms": 6413,
   "input_tokens": 7589,
   "output_tokens": 1232,
   "stop_reason": "end_turn",
   "request_id": "req_011ChHFCT5Cyk94k68xk5Ggu",
   "ran_at": "2026-11-22T03:20:08.265Z",
   "prompt": "v6",
   "documents": [
    {
     "id": "D1",
     "name": "Paper Lantern Retainer 2026.pdf",
     "chars": 1256
    }
   ]
  }
 },
 "quillmark": {
  "result": {
   "contract": {
    "title": "CONSULTING SERVICES MASTER AGREEMENT",
    "supplier_name": "Quillmark Advisory LLP",
    "customer_name": "Orvanta Commerce Private Limited",
    "contract_type": "consulting services master agreement with statements of work",
    "signed_status": "signed",
    "agreement_date": "2025-05-05",
    "agreement_date_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement is made on 5 May 2025 between Quillmark Advisory LLP, 9 Nariman Point, Mumbai 400 021 (\"Consultant\") and Orvanta Commerce Private Limited"
    }
   },
   "term": {
    "start_basis": "not_found",
    "start_date": "",
    "start_label": "",
    "start_event_description": "",
    "start_evidence": {
     "doc_id": "",
     "quote": ""
    },
    "initial_term_number": 0,
    "initial_term_unit": "none",
    "fixed_end_date": "",
    "initial_term_evidence": {
     "doc_id": "D1",
     "quote": "The term, fees and deliverables for each engagement are set out in the applicable SOW."
    },
    "end_condition": "other_condition",
    "agreement_limit": {
     "number": 0,
     "unit": "none",
     "end_date": "",
     "evidence": {
      "doc_id": "D1",
      "quote": "This Agreement continues for as long as any SOW is in force."
     }
    }
   },
   "renewal": {
    "mechanism": "automatic",
    "renewal_term_number": 0,
    "renewal_term_unit": "none",
    "if_no_one_acts": "Each SOW renews by itself for a period equal to its initial term, but the SOW term length is not in the documents provided.",
    "evidence": {
     "doc_id": "D1",
     "quote": "Each SOW renews automatically for successive periods equal to its initial term unless either party gives the other written notice at least forty-five (45) days before the end of its then-current term."
    }
   },
   "notice": {
    "period_number": 45,
    "period_unit": "days",
    "purpose": "to_prevent_renewal",
    "counted_back_from": "end_of_current_term",
    "who_may_give": "either_party",
    "earliest_number": 0,
    "earliest_unit": "none",
    "fixed_month_day": "",
    "evidence": {
     "doc_id": "D1",
     "quote": "unless either party gives the other written notice at least forty-five (45) days before the end of its then-current term."
    },
    "delivery_methods": "In writing, sent by courier or email to the addresses given in the applicable SOW.",
    "email_is_valid": "yes",
    "deemed_receipt_number": 0,
    "deemed_receipt_unit": "none",
    "notice_address": "",
    "delivery_evidence": {
     "doc_id": "D1",
     "quote": "Notices must be in writing and sent by courier or email to the addresses given in the applicable SOW."
    }
   },
   "price_on_renewal": {
    "rule": "supplier_may_change_with_notice",
    "cap_percent": 0,
    "summary": "The consultant may revise day rates for a renewal period by giving notice before it begins, with no cap and no minimum notice stated.",
    "evidence": {
     "doc_id": "D1",
     "quote": "Consultant may revise its day rates for a renewal period by giving notice before that period begins."
    }
   },
   "exit_rights": {
    "customer_can_terminate_for_convenience": "not_stated",
    "convenience_notice_number": 0,
    "convenience_notice_unit": "none",
    "summary": "The agreement gives no termination for convenience right; the client can stop an SOW from renewing by giving 45 days' written notice before its term ends.",
    "evidence": {
     "doc_id": "D1",
     "quote": "unless either party gives the other written notice at least forty-five (45) days before the end of its then-current term."
    }
   },
   "precedence": {
    "rule": "later_document_prevails",
    "summary": "If the agreement and an SOW conflict, the SOW prevails.",
    "evidence": {
     "doc_id": "D1",
     "quote": "If there is a conflict between this Agreement and an SOW, the SOW prevails."
    }
   },
   "changes_by_later_documents": [],
   "conflicts": [],
   "missing_documents": [
    {
     "name": "SOW No. 1 and any other Statements of Work",
     "why_it_matters": "They hold the actual start date, initial term, fees and notice addresses, which determine renewal dates.",
     "evidence": {
      "doc_id": "D1",
      "quote": "The parties have signed SOW No. 1 on the date of this Agreement."
     }
    }
   ],
   "separately_renewing_parts": 1,
   "parts_summary": "",
   "reader_note": "The master agreement contains no term length or start date; these sit only in SOWs that were not provided. Each SOW renews on its own and prevails over the master agreement if they conflict."
  },
  "meta": {
   "model": "claude-sonnet-5-5",
   "effort": "medium",
   "mode": "prompt",
   "attempts": 1,
   "ms": 7359,
   "input_tokens": 7630,
   "output_tokens": 1428,
   "stop_reason": "end_turn",
   "request_id": "req_011ChHFCyMs9kwL6B6DPYM7t",
   "ran_at": "2026-11-22T03:20:16.300Z",
   "prompt": "v6",
   "documents": [
    {
     "id": "D1",
     "name": "Quillmark Master Agreement.pdf",
     "chars": 1361
    }
   ]
  }
 },
 "datavine": {
  "result": {
   "contract": {
    "title": "MASTER SUBSCRIPTION AGREEMENT",
    "supplier_name": "Datavine Analytics Private Limited",
    "customer_name": "Orvanta Commerce Private Limited",
    "contract_type": "software analytics subscription master agreement with order form",
    "signed_status": "signed",
    "agreement_date": "2026-02-20",
    "agreement_date_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement is made on 20 February 2026 between Datavine Analytics Private Limited, 18 Cyber Hub Road, Gurugram 122 002 (\"Supplier\")"
    }
   },
   "term": {
    "start_basis": "fixed_calendar_date",
    "start_date": "2026-03-01",
    "start_label": "Subscription start date",
    "start_event_description": "",
    "start_evidence": {
     "doc_id": "D2",
     "quote": "Subscription start date: 1 March 2026."
    },
    "initial_term_number": 12,
    "initial_term_unit": "months",
    "fixed_end_date": "",
    "initial_term_evidence": {
     "doc_id": "D2",
     "quote": "Subscription term: 12 months."
    },
    "end_condition": "none",
    "agreement_limit": {
     "number": 0,
     "unit": "none",
     "end_date": "",
     "evidence": {
      "doc_id": "",
      "quote": ""
     }
    }
   },
   "renewal": {
    "mechanism": "automatic",
    "renewal_term_number": 12,
    "renewal_term_unit": "months",
    "if_no_one_acts": "The subscription renews automatically for another 12 months.",
    "evidence": {
     "doc_id": "D2",
     "quote": "This Order Form renews automatically for successive 12 month terms unless either party gives notice of non-renewal at least thirty (30) days before the end of the then-current term."
    }
   },
   "notice": {
    "period_number": 60,
    "period_unit": "days",
    "purpose": "to_prevent_renewal",
    "counted_back_from": "end_of_current_term",
    "who_may_give": "either_party",
    "earliest_number": 0,
    "earliest_unit": "none",
    "fixed_month_day": "",
    "evidence": {
     "doc_id": "D1",
     "quote": "Each subscription term renews automatically for successive periods of twelve (12) months unless either party gives written notice of non-renewal at least sixty (60) days before the end of the then-current subscription term."
    },
    "delivery_methods": "In writing, sent by email to the notice address in the Order Form.",
    "email_is_valid": "yes",
    "deemed_receipt_number": 1,
    "deemed_receipt_unit": "business_days",
    "notice_address": "renewals@datavine.example",
    "delivery_evidence": {
     "doc_id": "D1",
     "quote": "Notices must be in writing and sent by email to the notice address in the Order Form. A notice is deemed received on the Business Day after it is sent."
    }
   },
   "price_on_renewal": {
    "rule": "not_addressed",
    "cap_percent": 0,
    "summary": "The documents do not say how the price changes on renewal; the Order Form states only INR 48,00,000 per year.",
    "evidence": {
     "doc_id": "D2",
     "quote": "Fees: INR 48,00,000 per year."
    }
   },
   "exit_rights": {
    "customer_can_terminate_for_convenience": "not_stated",
    "convenience_notice_number": 0,
    "convenience_notice_unit": "none",
    "summary": "No right to terminate for convenience is stated; the customer can exit by giving non-renewal notice before the term ends.",
    "evidence": {
     "doc_id": "",
     "quote": ""
    }
   },
   "precedence": {
    "rule": "unclear",
    "summary": "The Agreement says it prevails over an Order Form and the Order Form says it prevails over the Agreement, so the documents do not settle it.",
    "evidence": {
     "doc_id": "D1",
     "quote": "If there is a conflict between this Agreement and an Order Form, this Agreement prevails."
    }
   },
   "changes_by_later_documents": [],
   "conflicts": [
    {
     "field": "notice_period",
     "reading_a": "Non-renewal notice must be given at least 60 days before the end of the term.",
     "a_number": 60,
     "a_unit": "days",
     "a_date": "",
     "evidence_a": {
      "doc_id": "D1",
      "quote": "Each subscription term renews automatically for successive periods of twelve (12) months unless either party gives written notice of non-renewal at least sixty (60) days before the end of the then-current subscription term."
     },
     "reading_b": "Non-renewal notice must be given at least 30 days before the end of the term.",
     "b_number": 30,
     "b_unit": "days",
     "b_date": "",
     "evidence_b": {
      "doc_id": "D2",
      "quote": "This Order Form renews automatically for successive 12 month terms unless either party gives notice of non-renewal at least thirty (30) days before the end of the then-current term."
     },
     "why_unresolved": "Each document claims to prevail over the other in a conflict, so neither the 60 day nor the 30 day period can be chosen."
    }
   ],
   "missing_documents": [],
   "separately_renewing_parts": 1,
   "parts_summary": "",
   "reader_note": "The notice period conflicts (60 days in the Agreement, 30 days in the Order Form) and the precedence clauses contradict each other, so the safer course is to give notice at least 60 days before the term ends. The Agreement requires notices by email to the notice address in the Order Form."
  },
  "meta": {
   "model": "claude-sonnet-5-5",
   "effort": "medium",
   "mode": "prompt",
   "attempts": 1,
   "ms": 8513,
   "input_tokens": 7971,
   "output_tokens": 1637,
   "stop_reason": "end_turn",
   "request_id": "req_011ChHFEQTW8ys8dsmcZnR8m",
   "ran_at": "2026-11-22T03:20:36.870Z",
   "prompt": "v6",
   "documents": [
    {
     "id": "D1",
     "name": "Datavine Master Subscription Agreement.pdf",
     "chars": 1316
    },
    {
     "id": "D2",
     "name": "Datavine Order Form No. 1.pdf",
     "chars": 914
    }
   ]
  }
 },
 "signalroot": {
  "result": {
   "contract": {
    "title": "INTERNET LEASED LINE SERVICE AGREEMENT",
    "supplier_name": "Signalroot Telecom Private Limited",
    "customer_name": "Orvanta Commerce Private Limited",
    "contract_type": "internet leased line service agreement",
    "signed_status": "signed",
    "agreement_date": "2023-08-10",
    "agreement_date_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement is made on 10 August 2023 between Signalroot Telecom Private Limited"
    }
   },
   "term": {
    "start_basis": "fixed_calendar_date",
    "start_date": "2023-08-10",
    "start_label": "date of this Agreement",
    "start_event_description": "",
    "start_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement starts on the date of this Agreement and continues until terminated."
    },
    "initial_term_number": 0,
    "initial_term_unit": "none",
    "fixed_end_date": "",
    "initial_term_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement starts on the date of this Agreement and continues until terminated."
    },
    "end_condition": "none",
    "agreement_limit": {
     "number": 0,
     "unit": "none",
     "end_date": "",
     "evidence": {
      "doc_id": "",
      "quote": ""
     }
    }
   },
   "renewal": {
    "mechanism": "continues_until_terminated",
    "renewal_term_number": 0,
    "renewal_term_unit": "none",
    "if_no_one_acts": "The agreement has no fixed end and simply keeps running until one party terminates it.",
    "evidence": {
     "doc_id": "D1",
     "quote": "This Agreement starts on the date of this Agreement and continues until terminated."
    }
   },
   "notice": {
    "period_number": 30,
    "period_unit": "days",
    "purpose": "to_terminate_at_any_time",
    "counted_back_from": "any_time",
    "who_may_give": "either_party",
    "earliest_number": 0,
    "earliest_unit": "none",
    "fixed_month_day": "",
    "evidence": {
     "doc_id": "D1",
     "quote": "Either party may terminate it at any time by giving the other thirty (30) days' written notice."
    },
    "delivery_methods": "Notices may be given by email to the supplier's accounts address.",
    "email_is_valid": "yes",
    "deemed_receipt_number": 0,
    "deemed_receipt_unit": "none",
    "notice_address": "accounts@signalroot.example",
    "delivery_evidence": {
     "doc_id": "D1",
     "quote": "Notices may be given by email to accounts@signalroot.example and are deemed received on the day they are sent."
    }
   },
   "price_on_renewal": {
    "rule": "supplier_may_change_with_notice",
    "cap_percent": 0,
    "summary": "There is no renewal, but the supplier may revise the monthly charge at any time by giving sixty days' written notice, with no cap.",
    "evidence": {
     "doc_id": "D1",
     "quote": "Supplier may revise the charge by giving sixty (60) days' written notice."
    }
   },
   "exit_rights": {
    "customer_can_terminate_for_convenience": "yes",
    "convenience_notice_number": 30,
    "convenience_notice_unit": "days",
    "summary": "The customer can end the agreement at any time by giving thirty days' written notice.",
    "evidence": {
     "doc_id": "D1",
     "quote": "Either party may terminate it at any time by giving the other thirty (30) days' written notice."
    }
   },
   "precedence": {
    "rule": "not_stated",
    "summary": "",
    "evidence": {
     "doc_id": "",
     "quote": ""
    }
   },
   "changes_by_later_documents": [],
   "conflicts": [],
   "missing_documents": [],
   "separately_renewing_parts": 1,
   "parts_summary": "",
   "reader_note": "The supplier can raise the charge on sixty days' notice, which is longer than the thirty days the customer needs to exit, so the customer can leave before a price rise takes effect. Notice by email is deemed received on the day it is sent."
  },
  "meta": {
   "model": "claude-sonnet-5-5",
   "effort": "medium",
   "mode": "prompt",
   "attempts": 1,
   "ms": 6166,
   "input_tokens": 7555,
   "output_tokens": 1204,
   "stop_reason": "end_turn",
   "request_id": "req_011ChHFF47ffeV6t6tEqyof8",
   "ran_at": "2026-11-22T03:20:43.345Z",
   "prompt": "v6",
   "documents": [
    {
     "id": "D1",
     "name": "Signalroot Leased Line Agreement.pdf",
     "chars": 1137
    }
   ]
  }
 }
};
