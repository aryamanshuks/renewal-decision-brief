// Real readings by the live model, captured on the deployed site on 22 Nov 2026 (IST) and saved here
// so the first screen is instant. The product labels them as saved readings. "Read again live" calls the model.
// Prompt v1 readings were taken before the renewal classification fix; Ivyrock was re-read with prompt v2 (see the test bench).
// Nothing here was edited by hand.
export const PRECOMPUTED = {
 "kestrelway": {
  "result": {
   "contract": {
    "title": "MASTER SERVICES AGREEMENT (LOGISTICS)",
    "supplier_name": "Kestrelway Logistics Private Limited",
    "customer_name": "Orvanta Commerce Private Limited",
    "contract_type": "logistics master services agreement for parcel collection, line-haul and last-mile delivery",
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
    "start_event_description": "The first day on which the Supplier performs deliveries for the Customer under the Agreement; no calendar date is written.",
    "start_evidence": {
     "doc_id": "D1",
     "quote": "\"Service Commencement Date\" means the first day on which Supplier performs deliveries for Customer under this Agreement."
    },
    "initial_term_number": 24,
    "initial_term_unit": "months",
    "fixed_end_date": "",
    "initial_term_evidence": {
     "doc_id": "D1",
     "quote": "continues for an initial term of twenty-four (24) months from the Service Commencement Date (the \"Initial Term\")."
    }
   },
   "renewal": {
    "mechanism": "automatic",
    "renewal_term_number": 12,
    "renewal_term_unit": "months",
    "if_no_one_acts": "The agreement renews automatically for a further 12 months.",
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
    "summary": "The supplier may revise rates once per year on 30 days' notice, with each revision capped at 6% of the rates then in force.",
    "evidence": {
     "doc_id": "D1",
     "quote": "Supplier may revise the rates once in each year of the term by giving thirty (30) days' notice. No revision shall exceed six percent (6%) of the rates then in force."
    }
   },
   "exit_rights": {
    "customer_can_terminate_for_convenience": "no",
    "convenience_notice_number": 0,
    "convenience_notice_unit": "none",
    "summary": "The customer cannot terminate for convenience during the Initial Term and can exit for uncured material breach or by giving non-renewal notice; convenience rights after the Initial Term are not addressed.",
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
     "why_it_matters": "The schedules are referred to for services and rates and were not provided, so they might contain further pricing terms.",
     "evidence": {
      "doc_id": "D1",
      "quote": "Customer shall pay the per-parcel rates in Schedule 2."
     }
    }
   ],
   "reader_note": "The 24-month term runs from the first delivery day, which is not stated in the documents, so the end date and the non-renewal deadline cannot be fixed yet. The Service Commencement Date needs to be obtained from the parties."
  },
  "meta": {
   "model": "claude-sonnet-5-5",
   "effort": "medium",
   "mode": "prompt",
   "ms": 7868,
   "input_tokens": 6984,
   "output_tokens": 1418,
   "stop_reason": "end_turn",
   "request_id": "req_011ChGjjxpjxsgLqdrUH3rez",
   "ran_at": "2026-11-21T20:53:52.449Z",
   "prompt": "v1"
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
    }
   },
   "renewal": {
    "mechanism": "automatic",
    "renewal_term_number": 12,
    "renewal_term_unit": "months",
    "if_no_one_acts": "The agreement renews automatically for a further twelve months.",
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
     "quote": "Notices must be in writing and sent by registered post to the other party's registered office. Email is not a valid means of giving notice. A notice sent by registered post is deemed received three (3) business days after posting."
    }
   },
   "price_on_renewal": {
    "rule": "capped_increase",
    "cap_percent": 7,
    "summary": "Supplier may raise the fee for a renewal term by up to 7% if it tells the Customer at least 90 days before the renewal term begins.",
    "evidence": {
     "doc_id": "D1",
     "quote": "Supplier may increase the fee for a renewal term by no more than seven percent (7%), by telling Customer at least ninety (90) days before the renewal term begins."
    }
   },
   "exit_rights": {
    "customer_can_terminate_for_convenience": "no",
    "convenience_notice_number": 0,
    "convenience_notice_unit": "none",
    "summary": "The customer can exit only for unremedied material breach (30 days to cure) or by giving timely non-renewal notice; fees paid are not refundable.",
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
   "reader_note": "The 60-day non-renewal notice must go by registered post, which is deemed received three business days after posting, so posting must be earlier than 60 days before term end. The supplier's 90-day price increase notice and the customer's 60-day non-renewal deadline are separate."
  },
  "meta": {
   "model": "claude-sonnet-5-5",
   "effort": "medium",
   "mode": "prompt",
   "ms": 6374,
   "input_tokens": 6586,
   "output_tokens": 1216,
   "stop_reason": "end_turn",
   "request_id": "req_011ChGjkZdFwBM8CFBioV16H",
   "ran_at": "2026-11-21T20:53:59.184Z",
   "prompt": "v1"
  }
 },
 "tallyhand": {
  "result": {
   "contract": {
    "title": "STAFFING SERVICES AGREEMENT",
    "supplier_name": "Tallyhand Staffing Private Limited",
    "customer_name": "Orvanta Commerce Private Limited",
    "contract_type": "staffing agreement for temporary warehouse and customer support staff",
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
    }
   },
   "renewal": {
    "mechanism": "automatic",
    "renewal_term_number": 12,
    "renewal_term_unit": "months",
    "if_no_one_acts": "The agreement renews automatically for a further 12 months.",
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
    "evidence": {
     "doc_id": "D2",
     "quote": "In clause 2.2 of the Agreement, the words \"thirty (30) days\" are deleted and replaced with the words \"ninety (90) days\"."
    },
    "delivery_methods": "In writing, delivered by hand, by courier or by email to the addresses in the agreement.",
    "email_is_valid": "yes",
    "deemed_receipt_number": 1,
    "deemed_receipt_unit": "business_days",
    "notice_address": "22 Residency Road, Bengaluru 560 025 (email: contracts@tallyhand.example)",
    "delivery_evidence": {
     "doc_id": "D1",
     "quote": "Notices shall be in writing and delivered by hand, by courier or by email to the addresses set out below. A notice sent by email is deemed received on the next Business Day."
    }
   },
   "price_on_renewal": {
    "rule": "index_linked",
    "cap_percent": 0,
    "summary": "Rates are fixed for the initial term and for each renewal term rise by the change in the All-India Consumer Price Index over the prior twelve months, with no cap.",
    "evidence": {
     "doc_id": "D1",
     "quote": "For each renewal term the rates increase by the percentage change in the All-India Consumer Price Index over the preceding twelve months."
    }
   },
   "exit_rights": {
    "customer_can_terminate_for_convenience": "not_stated",
    "convenience_notice_number": 0,
    "convenience_notice_unit": "none",
    "summary": "No termination for convenience is stated; the customer can exit by giving non-renewal notice before the term expires.",
    "evidence": {
     "doc_id": "D2",
     "quote": "In clause 2.2 of the Agreement, the words \"thirty (30) days\" are deleted and replaced with the words \"ninety (90) days\"."
    }
   },
   "precedence": {
    "rule": "later_document_prevails",
    "summary": "An amendment prevails over the main agreement if they conflict.",
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
     "basis": "Amendment No. 1 replaces clause 2.1 and states that it prevails over the Agreement."
    },
    {
     "field": "notice_period",
     "earlier_value": "Non-renewal notice of 30 days before expiry.",
     "earlier_evidence": {
      "doc_id": "D1",
      "quote": "unless either party gives written notice of non-renewal not less than thirty (30) days before the expiry of the then-current term."
     },
     "later_value": "Non-renewal notice of 90 days before expiry.",
     "later_evidence": {
      "doc_id": "D2",
      "quote": "In clause 2.2 of the Agreement, the words \"thirty (30) days\" are deleted and replaced with the words \"ninety (90) days\"."
     },
     "which_governs": "later_document",
     "basis": "Amendment No. 1 expressly replaces the words in clause 2.2 and prevails on conflict."
    },
    {
     "field": "other",
     "earlier_value": "Hourly bill rates set out in the original Annexure A.",
     "earlier_evidence": {
      "doc_id": "D1",
      "quote": "Supplier shall supply temporary warehouse and customer support staff to Customer at the hourly bill rates in Annexure A."
     },
     "later_value": "Annexure A is replaced by a revised rate card from 1 January 2026, plus a 4% discount on monthly billings above INR 20,00,000.",
     "later_evidence": {
      "doc_id": "D2",
      "quote": "Annexure A to the Agreement is replaced with the revised rate card attached to this Amendment, with effect from 1 January 2026."
     },
     "which_governs": "later_document",
     "basis": "Amendment No. 1 replaces Annexure A with effect from 1 January 2026."
    }
   ],
   "conflicts": [],
   "missing_documents": [
    {
     "name": "Revised rate card attached to Amendment No. 1",
     "why_it_matters": "The revised rates are not provided, and they could affect pricing during the term.",
     "evidence": {
      "doc_id": "D2",
      "quote": "Annexure A to the Agreement is replaced with the revised rate card attached to this Amendment, with effect from 1 January 2026."
     }
    }
   ],
   "reader_note": "With the 36-month term from 1 July 2024 the initial term ends around 30 June 2027, and the non-renewal notice is now 90 days, not 30. Rates are fixed only for the initial term, and renewal increases follow CPI with no cap."
  },
  "meta": {
   "model": "claude-sonnet-5-5",
   "effort": "medium",
   "mode": "prompt",
   "ms": 10569,
   "input_tokens": 7111,
   "output_tokens": 2112,
   "stop_reason": "end_turn",
   "request_id": "req_011ChGjm4jDUZJh36gggMLW7",
   "ran_at": "2026-11-21T20:54:10.199Z",
   "prompt": "v1"
  }
 },
 "ivyrock": {
  "result": {
   "contract": {
    "title": "FACILITIES MANAGEMENT AGREEMENT",
    "supplier_name": "Ivyrock Facilities Private Limited",
    "customer_name": "Orvanta Commerce Private Limited",
    "contract_type": "facilities management services agreement (housekeeping, pantry and minor maintenance)",
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
    "start_label": "start of term",
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
    }
   },
   "renewal": {
    "mechanism": "one_time_extension_then_ends",
    "renewal_term_number": 6,
    "renewal_term_unit": "months",
    "if_no_one_acts": "The agreement is extended once automatically for six months after the Expiry Date on the same terms and then ends without further notice.",
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
    "evidence": {
     "doc_id": "D1",
     "quote": "Customer may renew this Agreement for a further term of twenty-four (24) months by giving Supplier written notice at least one hundred and twenty (120) days before the Expiry Date."
    },
    "delivery_methods": "In writing, delivered by hand or by courier to the other party's registered office; email copy allowed but not valid alone.",
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
    "summary": "On a renewal by Customer notice the parties renegotiate in good faith, and failing agreement charges rise by 5%; the price for the silent six-month extension is not addressed beyond 'same terms'.",
    "evidence": {
     "doc_id": "D1",
     "quote": "On a renewal under clause 3.2 the parties shall renegotiate the charges in good faith. Failing agreement, the charges increase by five percent (5%)."
    }
   },
   "exit_rights": {
    "customer_can_terminate_for_convenience": "no",
    "convenience_notice_number": 0,
    "convenience_notice_unit": "none",
    "summary": "No termination for convenience is stated; Customer may terminate on 30 days' notice after three failed monthly audits in any six-month period.",
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
     "why_it_matters": "Describes the services and could contain terms affecting scope or charges.",
     "evidence": {
      "doc_id": "D1",
      "quote": "as described in Schedule A"
     }
    },
    {
     "name": "Schedule B",
     "why_it_matters": "Sets service standards that trigger the audit-based termination right.",
     "evidence": {
      "doc_id": "D1",
      "quote": "Supplier shall meet the cleaning and response standards in Schedule B."
     }
    }
   ],
   "reader_note": "Silence does not renew for a long term: it gives only one six-month extension, so Customer must give written notice by hand or courier at least 120 days before 31 March 2027 to secure the 24-month renewal. Note the price quote for 3.2 should read 'clause 2.2' in the document."
  },
  "meta": {
   "model": "claude-sonnet-5-5",
   "effort": "medium",
   "mode": "prompt",
   "ms": 9320,
   "input_tokens": 6730,
   "output_tokens": 1610,
   "stop_reason": "end_turn",
   "request_id": "req_011ChGk93NEho89ADBm5R6Yz",
   "ran_at": "2026-11-21T20:59:06.969Z",
   "prompt": "v2"
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
     "quote": "This Agreement is made on 15 December 2025 between Paper Lantern Creative LLP, 41 Hauz Khas Village, New Delhi 110 016 (\"Agency\") and Orvanta Commerce Private Limited"
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
    }
   },
   "renewal": {
    "mechanism": "mutual_written_agreement",
    "renewal_term_number": 0,
    "renewal_term_unit": "none",
    "if_no_one_acts": "The agreement ends on 31 December 2026 without renewal.",
    "evidence": {
     "doc_id": "D1",
     "quote": "It does not renew automatically. The parties may renew it only by a written agreement signed by both of them before it ends."
    }
   },
   "notice": {
    "period_number": 60,
    "period_unit": "days",
    "purpose": "to_terminate_at_any_time",
    "counted_back_from": "any_time",
    "who_may_give": "either_party",
    "evidence": {
     "doc_id": "D1",
     "quote": "Either party may terminate this Agreement at any time by giving the other sixty (60) days' written notice."
    },
    "delivery_methods": "Notices may be given by email to the addresses in the Schedule.",
    "email_is_valid": "yes",
    "deemed_receipt_number": 0,
    "deemed_receipt_unit": "none",
    "notice_address": "",
    "delivery_evidence": {
     "doc_id": "D1",
     "quote": "Notices may be given by email to the addresses in the Schedule and are deemed received on the day they are sent."
    }
   },
   "price_on_renewal": {
    "rule": "not_addressed",
    "cap_percent": 0,
    "summary": "The agreement does not state any price for a renewal; it sets a monthly retainer for the term only.",
    "evidence": {
     "doc_id": "D1",
     "quote": "Client shall pay a monthly retainer of INR 7,50,000."
    }
   },
   "exit_rights": {
    "customer_can_terminate_for_convenience": "yes",
    "convenience_notice_number": 60,
    "convenience_notice_unit": "days",
    "summary": "The customer may end the agreement at any time by giving 60 days' written notice.",
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
     "why_it_matters": "It holds the email addresses for notices, which are needed to give valid notice, and may contain other terms.",
     "evidence": {
      "doc_id": "D1",
      "quote": "Notices may be given by email to the addresses in the Schedule and are deemed received on the day they are sent."
     }
    }
   ],
   "reader_note": "The agreement mentions a Schedule with notice email addresses that was not provided, and no postal notice address is given for the supplier. The 60-day written termination notice can be given by email and is deemed received the day it is sent."
  },
  "meta": {
   "model": "claude-sonnet-5-5",
   "effort": "medium",
   "mode": "prompt",
   "ms": 6396,
   "input_tokens": 6342,
   "output_tokens": 1213,
   "stop_reason": "end_turn",
   "request_id": "req_011ChGjnTf95eeJ3WFQHs1ni",
   "ran_at": "2026-11-21T20:54:24.946Z",
   "prompt": "v1"
  }
 },
 "quillmark": {
  "result": {
   "contract": {
    "title": "CONSULTING SERVICES MASTER AGREEMENT",
    "supplier_name": "Quillmark Advisory LLP",
    "customer_name": "Orvanta Commerce Private Limited",
    "contract_type": "consulting services master agreement",
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
     "doc_id": "D1",
     "quote": "The term, fees and deliverables for each engagement are set out in the applicable SOW."
    },
    "initial_term_number": 0,
    "initial_term_unit": "none",
    "fixed_end_date": "",
    "initial_term_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement continues for as long as any SOW is in force."
    }
   },
   "renewal": {
    "mechanism": "automatic",
    "renewal_term_number": 0,
    "renewal_term_unit": "none",
    "if_no_one_acts": "Each SOW renews automatically for a period equal to its initial term, which is set in the SOW and not provided.",
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
    "summary": "The consultant may revise its day rates for a renewal period by giving notice before it begins, with no cap or notice length stated.",
    "evidence": {
     "doc_id": "D1",
     "quote": "Consultant may revise its day rates for a renewal period by giving notice before that period begins."
    }
   },
   "exit_rights": {
    "customer_can_terminate_for_convenience": "not_stated",
    "convenience_notice_number": 0,
    "convenience_notice_unit": "none",
    "summary": "No termination for convenience is stated; the client can stop an SOW renewing by giving 45 days' written notice before its term ends.",
    "evidence": {
     "doc_id": "D1",
     "quote": "unless either party gives the other written notice at least forty-five (45) days before the end of its then-current term."
    }
   },
   "precedence": {
    "rule": "later_document_prevails",
    "summary": "If the Agreement and an SOW conflict, the SOW prevails.",
    "evidence": {
     "doc_id": "D1",
     "quote": "If there is a conflict between this Agreement and an SOW, the SOW prevails."
    }
   },
   "changes_by_later_documents": [],
   "conflicts": [],
   "missing_documents": [
    {
     "name": "Statement of Work No. 1 (and any other SOW)",
     "why_it_matters": "The SOWs set each engagement's term, start, fees and notice addresses, and prevail over the Agreement if they conflict.",
     "evidence": {
      "doc_id": "D1",
      "quote": "The term, fees and deliverables for each engagement are set out in the applicable SOW."
     }
    }
   ],
   "reader_note": "The master agreement has no fixed term or start date of its own; all timing sits in the SOWs, which were not provided. Notice addresses are also only in the SOWs."
  },
  "meta": {
   "model": "claude-sonnet-5-5",
   "effort": "medium",
   "mode": "prompt",
   "ms": 7143,
   "input_tokens": 6383,
   "output_tokens": 1302,
   "stop_reason": "end_turn",
   "request_id": "req_011ChGjnx9PpuGzYrjojnhrS",
   "ran_at": "2026-11-21T20:54:32.358Z",
   "prompt": "v1"
  }
 },
 "datavine": {
  "result": {
   "contract": {
    "title": "MASTER SUBSCRIPTION AGREEMENT",
    "supplier_name": "Datavine Analytics Private Limited",
    "customer_name": "Orvanta Commerce Private Limited",
    "contract_type": "software analytics subscription master agreement",
    "signed_status": "signed",
    "agreement_date": "2026-02-20",
    "agreement_date_evidence": {
     "doc_id": "D1",
     "quote": "This Agreement is made on 20 February 2026 between Datavine Analytics Private Limited"
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
    }
   },
   "renewal": {
    "mechanism": "automatic",
    "renewal_term_number": 12,
    "renewal_term_unit": "months",
    "if_no_one_acts": "The subscription renews automatically for another 12 months.",
    "evidence": {
     "doc_id": "D2",
     "quote": "Renewal: This Order Form renews automatically for successive 12 month terms unless either party gives notice of non-renewal at least thirty (30) days before the end of the then-current term."
    }
   },
   "notice": {
    "period_number": 60,
    "period_unit": "days",
    "purpose": "to_prevent_renewal",
    "counted_back_from": "end_of_current_term",
    "who_may_give": "either_party",
    "evidence": {
     "doc_id": "D1",
     "quote": "unless either party gives written notice of non-renewal at least sixty (60) days before the end of the then-current subscription term."
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
    "summary": "The documents do not say what happens to the fee on renewal; the Order Form only states INR 48,00,000 per year.",
    "evidence": {
     "doc_id": "D2",
     "quote": "Fees: INR 48,00,000 per year."
    }
   },
   "exit_rights": {
    "customer_can_terminate_for_convenience": "not_stated",
    "convenience_notice_number": 0,
    "convenience_notice_unit": "none",
    "summary": "No right to terminate without cause is stated; the customer can exit by giving non-renewal notice before the term ends.",
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
     "reading_a": "Non-renewal notice at least 60 days before the end of the term, per the main agreement.",
     "a_number": 60,
     "a_unit": "days",
     "a_date": "",
     "evidence_a": {
      "doc_id": "D1",
      "quote": "unless either party gives written notice of non-renewal at least sixty (60) days before the end of the then-current subscription term."
     },
     "reading_b": "Non-renewal notice at least 30 days before the end of the term, per the Order Form.",
     "b_number": 30,
     "b_unit": "days",
     "b_date": "",
     "evidence_b": {
      "doc_id": "D2",
      "quote": "unless either party gives notice of non-renewal at least thirty (30) days before the end of the then-current term."
     },
     "why_unresolved": "Each document claims to prevail over the other in a conflict, so neither wins."
    },
    {
     "field": "other",
     "reading_a": "The Agreement says it prevails over the Order Form.",
     "a_number": 0,
     "a_unit": "none",
     "a_date": "",
     "evidence_a": {
      "doc_id": "D1",
      "quote": "If there is a conflict between this Agreement and an Order Form, this Agreement prevails."
     },
     "reading_b": "The Order Form says it prevails over the Agreement.",
     "b_number": 0,
     "b_unit": "none",
     "b_date": "",
     "evidence_b": {
      "doc_id": "D2",
      "quote": "Order of precedence: If there is a conflict between this Order Form and the Agreement, this Order Form prevails."
     },
     "why_unresolved": "The two precedence clauses contradict each other and nothing ranks them."
    }
   ],
   "missing_documents": [],
   "reader_note": "The notice period is 60 days in the main agreement and 30 days in the Order Form, with contradictory precedence clauses; the safer course is to give notice at least 60 days before the term ends. The Supplier's notice address is an email address only."
  },
  "meta": {
   "model": "claude-sonnet-5-5",
   "effort": "medium",
   "mode": "prompt",
   "ms": 8655,
   "input_tokens": 6724,
   "output_tokens": 1623,
   "stop_reason": "end_turn",
   "request_id": "req_011ChGjpVwrx19piZxfCg76m",
   "ran_at": "2026-11-21T20:54:54.866Z",
   "prompt": "v1"
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
    "start_basis": "defined_date_stated_in_documents",
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
    }
   },
   "renewal": {
    "mechanism": "continues_until_terminated",
    "renewal_term_number": 0,
    "renewal_term_unit": "none",
    "if_no_one_acts": "The agreement has no fixed end and simply continues until one party terminates it.",
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
    "evidence": {
     "doc_id": "D1",
     "quote": "Either party may terminate it at any time by giving the other thirty (30) days' written notice."
    },
    "delivery_methods": "Notices may be given by email to the Supplier's stated email address.",
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
    "summary": "There is no renewal, but the Supplier may revise the monthly charge at any time on sixty days' written notice, with no cap.",
    "evidence": {
     "doc_id": "D1",
     "quote": "Supplier may revise the charge by giving sixty (60) days' written notice."
    }
   },
   "exit_rights": {
    "customer_can_terminate_for_convenience": "yes",
    "convenience_notice_number": 30,
    "convenience_notice_unit": "days",
    "summary": "The Customer can exit at any time by giving thirty days' written notice.",
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
   "reader_note": "The Supplier can raise the price on 60 days' notice but the Customer needs only 30 days to leave, so the Customer can exit before an increase takes effect. Notice is deemed received on the day it is sent by email, and the contract gives no separate Customer notice address."
  },
  "meta": {
   "model": "claude-sonnet-5-5",
   "effort": "medium",
   "mode": "prompt",
   "ms": 5839,
   "input_tokens": 6308,
   "output_tokens": 1095,
   "stop_reason": "end_turn",
   "request_id": "req_011ChGjqAWM15TfTDCbVgpdn",
   "ran_at": "2026-11-21T20:55:01.075Z",
   "prompt": "v1"
  }
 }
};
