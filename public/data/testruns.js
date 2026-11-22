// Live runs of the test bench on the deployed site, scored by the checks in public/js/core/testcases.js.
// Times are UTC. Nothing here was edited by hand; notes explain what happened in a run.
export const SAVED_RUNS = {
 "pair_b": [
  {
   "at": "2026-11-21T20:53:52.449Z",
   "model": "claude-sonnet-5-5",
   "ms": 7868,
   "prompt": "v1",
   "note": "",
   "outcome": "provisional",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "event",
     "pass": true,
     "got": "event_or_date_not_stated_in_documents"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "provisional"
    },
    {
     "id": "question",
     "pass": true,
     "got": "Service Commencement Date"
    },
    {
     "id": "prov",
     "pass": true,
     "got": "provisional, 2026-12-19"
    }
   ]
  },
  {
   "at": "2026-11-21T21:10:05.086Z",
   "model": "claude-sonnet-5-5",
   "ms": 7501,
   "prompt": "v2",
   "note": "",
   "outcome": "provisional",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "event",
     "pass": true,
     "got": "event_or_date_not_stated_in_documents"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "provisional"
    },
    {
     "id": "question",
     "pass": true,
     "got": "Service Commencement Date"
    },
    {
     "id": "prov",
     "pass": true,
     "got": "provisional, 2026-12-19"
    }
   ]
  },
  {
   "at": "2026-11-21T21:24:26.246Z",
   "model": "claude-haiku-5-5",
   "ms": 11294,
   "prompt": "v2",
   "note": "",
   "outcome": "provisional",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "event",
     "pass": true,
     "got": "event_or_date_not_stated_in_documents"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "provisional"
    },
    {
     "id": "question",
     "pass": true,
     "got": "Service Commencement Date"
    },
    {
     "id": "prov",
     "pass": true,
     "got": "provisional, 2026-12-19"
    }
   ]
  },
  {
   "at": "2026-11-21T21:38:31.157Z",
   "model": "claude-sonnet-5-5",
   "ms": 7565,
   "prompt": "v3",
   "note": "",
   "outcome": "provisional",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "event",
     "pass": true,
     "got": "event_or_date_not_stated_in_documents"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "provisional"
    },
    {
     "id": "question",
     "pass": true,
     "got": "Service Commencement Date"
    },
    {
     "id": "prov",
     "pass": true,
     "got": "provisional, 2026-12-19"
    }
   ]
  },
  {
   "at": "2026-11-21T21:55:52.771Z",
   "model": "claude-sonnet-5-5",
   "ms": 7537,
   "prompt": "v4",
   "note": "",
   "outcome": "provisional",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "event",
     "pass": true,
     "got": "event_or_date_not_stated_in_documents"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "provisional"
    },
    {
     "id": "question",
     "pass": true,
     "got": "Service Commencement Date"
    },
    {
     "id": "prov",
     "pass": true,
     "got": "provisional, 2026-12-19"
    }
   ]
  },
  {
   "at": "2026-11-22T01:28:56.471Z",
   "model": "claude-sonnet-5-5",
   "ms": 8123,
   "note": "First run on the text with clause 1.4.",
   "outcome": "provisional",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "event",
     "pass": true,
     "got": "event_or_date_not_stated_in_documents"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "provisional"
    },
    {
     "id": "question",
     "pass": true,
     "got": "Service Commencement Date"
    },
    {
     "id": "prov",
     "pass": true,
     "got": "provisional, 2026-12-19"
    }
   ],
   "prompt": "v4"
  },
  {
   "at": "2026-11-22T01:34:47.584Z",
   "model": "claude-sonnet-5-5",
   "ms": 8522,
   "note": "",
   "outcome": "provisional",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "event",
     "pass": true,
     "got": "event_or_date_not_stated_in_documents"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "provisional"
    },
    {
     "id": "question",
     "pass": true,
     "got": "Service Commencement Date"
    },
    {
     "id": "prov",
     "pass": true,
     "got": "provisional, 2026-12-19"
    }
   ],
   "prompt": "v5"
  }
 ],
 "amended": [
  {
   "at": "2026-11-21T20:54:10.199Z",
   "model": "claude-sonnet-5-5",
   "ms": 10569,
   "prompt": "v1",
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "initial",
     "pass": true,
     "got": "36 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "chg1",
     "pass": true,
     "got": "Initial term of 24 months from the Effective Date. to Initial term of 36 months from the Effective Date., governs: later_document"
    },
    {
     "id": "chg2",
     "pass": true,
     "got": "Non-renewal notice of 30 days before expiry. to Non-renewal notice of 90 days before expiry., governs: later_document"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-04-01"
    }
   ]
  },
  {
   "at": "2026-11-21T21:11:01.243Z",
   "model": "claude-sonnet-5-5",
   "ms": 10183,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "initial",
     "pass": true,
     "got": "36 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "chg1",
     "pass": true,
     "got": "Initial term of 24 months from the Effective Date. to Initial term of 36 months from the Effective Date., governs: later_document"
    },
    {
     "id": "chg2",
     "pass": true,
     "got": "Non-renewal notice of 30 days before expiry of the term. to Non-renewal notice of 90 days before expiry of the term., governs: later_document"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-04-01"
    }
   ]
  },
  {
   "at": "2026-11-21T21:25:17.436Z",
   "model": "claude-haiku-5-5",
   "ms": 23290,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "initial",
     "pass": true,
     "got": "36 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "chg1",
     "pass": true,
     "got": "Initial term of twenty-four (24) months from the Effective Date. to Initial term of thirty-six (36) months from the Effective Date., governs: later_document"
    },
    {
     "id": "chg2",
     "pass": true,
     "got": "Non-renewal notice of not less than thirty (30) days before expiry of the current term. to Non-renewal notice of not less than ninety (90) days before expiry of the current term., governs: later_document"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-04-01"
    }
   ]
  },
  {
   "at": "2026-11-21T21:38:40.991Z",
   "model": "claude-sonnet-5-5",
   "ms": 9437,
   "prompt": "v3",
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "initial",
     "pass": true,
     "got": "36 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "chg1",
     "pass": true,
     "got": "Initial term of 24 months from the Effective Date. to Initial term of 36 months from the Effective Date., governs: later_document"
    },
    {
     "id": "chg2",
     "pass": true,
     "got": "30 days notice of non-renewal. to 90 days notice of non-renewal., governs: later_document"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-04-01"
    }
   ]
  },
  {
   "at": "2026-11-21T21:56:35.104Z",
   "model": "claude-sonnet-5-5",
   "ms": 9482,
   "prompt": "v4",
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "initial",
     "pass": true,
     "got": "36 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "chg1",
     "pass": true,
     "got": "Initial term of 24 months from the Effective Date. to Initial term of 36 months from the Effective Date., governs: later_document"
    },
    {
     "id": "chg2",
     "pass": true,
     "got": "Non-renewal notice at least 30 days before expiry. to Non-renewal notice at least 90 days before expiry., governs: later_document"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-04-01"
    }
   ]
  },
  {
   "at": "2026-11-22T01:35:41.814Z",
   "model": "claude-sonnet-5-5",
   "ms": 10273,
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "initial",
     "pass": true,
     "got": "36 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "chg1",
     "pass": true,
     "got": "Initial term of 24 months from the Effective Date. to Initial term of 36 months from the Effective Date., governs: later_document"
    },
    {
     "id": "chg2",
     "pass": true,
     "got": "Non-renewal notice of 30 days before expiry. to Non-renewal notice of 90 days before expiry., governs: later_document"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-04-01"
    }
   ],
   "prompt": "v5"
  }
 ],
 "hybrid": [
  {
   "at": "2026-11-21T20:54:18.130Z",
   "model": "claude-sonnet-5-5",
   "ms": 7497,
   "prompt": "v1",
   "note": "First live run. Misclassed: the model called it 'ends unless renewed', while its own summary said silence extends it. This led to the prompt fix (v2) and a code check that blocks self-contradicting readings.",
   "outcome": "blocked",
   "passed": 1,
   "of": 4,
   "results": [
    {
     "id": "mech",
     "pass": false,
     "got": "customer_must_give_notice_to_renew"
    },
    {
     "id": "ext",
     "pass": false,
     "got": "24 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "120 days"
    },
    {
     "id": "date",
     "pass": false,
     "got": "blocked, none"
    }
   ]
  },
  {
   "at": "2026-11-21T20:59:06.969Z",
   "model": "claude-sonnet-5-5",
   "ms": 9320,
   "prompt": "v2",
   "note": "After the fix. Classed correctly. In this run the model miscopied one digit in the price passage ('clause 3.2' for 'clause 2.2'); the quote check marked that passage as not found, so it was not treated as proof.",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "mech",
     "pass": true,
     "got": "one_time_extension_then_ends"
    },
    {
     "id": "ext",
     "pass": true,
     "got": "6 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "120 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-01"
    }
   ]
  },
  {
   "at": "2026-11-21T21:11:19.621Z",
   "model": "claude-sonnet-5-5",
   "ms": 7846,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "mech",
     "pass": true,
     "got": "one_time_extension_then_ends"
    },
    {
     "id": "ext",
     "pass": true,
     "got": "6 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "120 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-01"
    }
   ]
  },
  {
   "at": "2026-11-21T21:25:43.944Z",
   "model": "claude-haiku-5-5",
   "ms": 14068,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "mech",
     "pass": true,
     "got": "one_time_extension_then_ends"
    },
    {
     "id": "ext",
     "pass": true,
     "got": "6 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "120 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-01"
    }
   ]
  },
  {
   "at": "2026-11-21T21:38:49.214Z",
   "model": "claude-sonnet-5-5",
   "ms": 7847,
   "prompt": "v3",
   "note": "",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "mech",
     "pass": true,
     "got": "one_time_extension_then_ends"
    },
    {
     "id": "ext",
     "pass": true,
     "got": "6 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "120 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-01"
    }
   ]
  },
  {
   "at": "2026-11-21T21:56:52.143Z",
   "model": "claude-sonnet-5-5",
   "ms": 8491,
   "prompt": "v4",
   "note": "",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "mech",
     "pass": true,
     "got": "one_time_extension_then_ends"
    },
    {
     "id": "ext",
     "pass": true,
     "got": "6 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "120 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-01"
    }
   ]
  },
  {
   "at": "2026-11-22T01:36:02.471Z",
   "model": "claude-sonnet-5-5",
   "ms": 9206,
   "note": "",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "mech",
     "pass": true,
     "got": "one_time_extension_then_ends"
    },
    {
     "id": "ext",
     "pass": true,
     "got": "6 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "120 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-01"
    }
   ],
   "prompt": "v5"
  }
 ],
 "norenewal": [
  {
   "at": "2026-11-21T20:54:24.946Z",
   "model": "claude-sonnet-5-5",
   "ms": 6396,
   "prompt": "v1",
   "note": "",
   "outcome": "ends",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "mech",
     "pass": true,
     "got": "mutual_written_agreement"
    },
    {
     "id": "out",
     "pass": true,
     "got": "ends"
    },
    {
     "id": "end",
     "pass": true,
     "got": "2026-12-31"
    }
   ]
  },
  {
   "at": "2026-11-21T21:11:27.651Z",
   "model": "claude-sonnet-5-5",
   "ms": 6299,
   "prompt": "v2",
   "note": "",
   "outcome": "ends",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "mech",
     "pass": true,
     "got": "no_renewal_fixed_term"
    },
    {
     "id": "out",
     "pass": true,
     "got": "ends"
    },
    {
     "id": "end",
     "pass": true,
     "got": "2026-12-31"
    }
   ]
  },
  {
   "at": "2026-11-21T21:25:54.642Z",
   "model": "claude-haiku-5-5",
   "ms": 10388,
   "prompt": "v2",
   "note": "",
   "outcome": "ends",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "mech",
     "pass": true,
     "got": "mutual_written_agreement"
    },
    {
     "id": "out",
     "pass": true,
     "got": "ends"
    },
    {
     "id": "end",
     "pass": true,
     "got": "2026-12-31"
    }
   ]
  },
  {
   "at": "2026-11-21T21:56:58.652Z",
   "model": "claude-sonnet-5-5",
   "ms": 6233,
   "prompt": "v4",
   "note": "",
   "outcome": "ends",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "mech",
     "pass": true,
     "got": "no_renewal_fixed_term"
    },
    {
     "id": "out",
     "pass": true,
     "got": "ends"
    },
    {
     "id": "end",
     "pass": true,
     "got": "2026-12-31"
    }
   ]
  },
  {
   "at": "2026-11-22T01:36:10.757Z",
   "model": "claude-sonnet-5-5",
   "ms": 6501,
   "note": "",
   "outcome": "ends",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "mech",
     "pass": true,
     "got": "no_renewal_fixed_term"
    },
    {
     "id": "out",
     "pass": true,
     "got": "ends"
    },
    {
     "id": "end",
     "pass": true,
     "got": "2026-12-31"
    }
   ],
   "prompt": "v5"
  }
 ],
 "evergreen": [
  {
   "at": "2026-11-21T20:55:01.075Z",
   "model": "claude-sonnet-5-5",
   "ms": 5839,
   "prompt": "v1",
   "note": "",
   "outcome": "no_deadline",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "mech",
     "pass": true,
     "got": "continues_until_terminated"
    },
    {
     "id": "out",
     "pass": true,
     "got": "no_deadline"
    }
   ]
  },
  {
   "at": "2026-11-21T21:11:34.724Z",
   "model": "claude-sonnet-5-5",
   "ms": 5993,
   "prompt": "v2",
   "note": "",
   "outcome": "no_deadline",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "mech",
     "pass": true,
     "got": "continues_until_terminated"
    },
    {
     "id": "out",
     "pass": true,
     "got": "no_deadline"
    }
   ]
  },
  {
   "at": "2026-11-21T21:26:03.279Z",
   "model": "claude-haiku-5-5",
   "ms": 8375,
   "prompt": "v2",
   "note": "",
   "outcome": "no_deadline",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "mech",
     "pass": true,
     "got": "continues_until_terminated"
    },
    {
     "id": "out",
     "pass": true,
     "got": "no_deadline"
    }
   ]
  },
  {
   "at": "2026-11-21T21:57:05.079Z",
   "model": "claude-sonnet-5-5",
   "ms": 6176,
   "prompt": "v4",
   "note": "",
   "outcome": "no_deadline",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "mech",
     "pass": true,
     "got": "continues_until_terminated"
    },
    {
     "id": "out",
     "pass": true,
     "got": "no_deadline"
    }
   ]
  },
  {
   "at": "2026-11-22T01:36:20.933Z",
   "model": "claude-sonnet-5-5",
   "ms": 6158,
   "note": "",
   "outcome": "no_deadline",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "mech",
     "pass": true,
     "got": "continues_until_terminated"
    },
    {
     "id": "out",
     "pass": true,
     "got": "no_deadline"
    }
   ],
   "prompt": "v5"
  }
 ],
 "missing": [
  {
   "at": "2026-11-21T20:54:32.358Z",
   "model": "claude-sonnet-5-5",
   "ms": 7143,
   "prompt": "v1",
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    },
    {
     "id": "missing",
     "pass": true,
     "got": "Statement of Work No. 1 (and any other SOW)"
    }
   ]
  },
  {
   "at": "2026-11-21T21:11:46.221Z",
   "model": "claude-sonnet-5-5",
   "ms": 7076,
   "prompt": "v2",
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    },
    {
     "id": "missing",
     "pass": true,
     "got": "SOW No. 1 (and any other SOW)"
    }
   ]
  },
  {
   "at": "2026-11-21T21:26:16.499Z",
   "model": "claude-haiku-5-5",
   "ms": 12973,
   "prompt": "v2",
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    },
    {
     "id": "missing",
     "pass": true,
     "got": "SOW No. 1 (Statement of Work No. 1)"
    }
   ]
  },
  {
   "at": "2026-11-21T21:57:12.495Z",
   "model": "claude-sonnet-5-5",
   "ms": 7138,
   "prompt": "v4",
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    },
    {
     "id": "missing",
     "pass": true,
     "got": "SOW No. 1"
    }
   ]
  },
  {
   "at": "2026-11-22T01:36:32.686Z",
   "model": "claude-sonnet-5-5",
   "ms": 7221,
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    },
    {
     "id": "missing",
     "pass": true,
     "got": "SOW No. 1 and any other Statements of Work"
    }
   ],
   "prompt": "v5"
  }
 ],
 "conflict": [
  {
   "at": "2026-11-21T20:54:54.866Z",
   "model": "claude-sonnet-5-5",
   "ms": 8655,
   "prompt": "v1",
   "note": "",
   "outcome": "blocked",
   "passed": 1,
   "of": 1,
   "results": [
    {
     "id": "both",
     "pass": true,
     "got": "blocked; 2026-12-30 and 2027-01-29"
    }
   ]
  },
  {
   "at": "2026-11-21T21:12:03.121Z",
   "model": "claude-sonnet-5-5",
   "ms": 9164,
   "prompt": "v2",
   "note": "",
   "outcome": "blocked",
   "passed": 1,
   "of": 1,
   "results": [
    {
     "id": "both",
     "pass": true,
     "got": "blocked; 2026-12-30 and 2027-01-29"
    }
   ]
  },
  {
   "at": "2026-11-21T21:26:31.881Z",
   "model": "claude-haiku-5-5",
   "ms": 15111,
   "prompt": "v2",
   "note": "",
   "outcome": "blocked",
   "passed": 1,
   "of": 1,
   "results": [
    {
     "id": "both",
     "pass": true,
     "got": "blocked; 2026-12-30 and 2027-01-29"
    }
   ]
  },
  {
   "at": "2026-11-21T21:39:13.543Z",
   "model": "claude-sonnet-5-5",
   "ms": 8649,
   "prompt": "v3",
   "note": "",
   "outcome": "blocked",
   "passed": 1,
   "of": 1,
   "results": [
    {
     "id": "both",
     "pass": true,
     "got": "blocked; 2026-12-30 and 2027-01-29"
    }
   ]
  },
  {
   "at": "2026-11-21T21:57:35.135Z",
   "model": "claude-sonnet-5-5",
   "ms": 7901,
   "prompt": "v4",
   "note": "",
   "outcome": "blocked",
   "passed": 1,
   "of": 1,
   "results": [
    {
     "id": "both",
     "pass": true,
     "got": "blocked; 2026-12-30 and 2027-01-29"
    }
   ]
  },
  {
   "at": "2026-11-22T01:36:45.214Z",
   "model": "claude-sonnet-5-5",
   "ms": 9443,
   "note": "",
   "outcome": "blocked",
   "passed": 1,
   "of": 1,
   "results": [
    {
     "id": "both",
     "pass": true,
     "got": "blocked; 2026-12-30 and 2027-01-29"
    }
   ],
   "prompt": "v5"
  }
 ],
 "pair_a": [
  {
   "at": "2026-11-21T21:09:56.223Z",
   "model": "claude-sonnet-5-5",
   "ms": 7588,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-21T21:24:14.432Z",
   "model": "claude-haiku-5-5",
   "ms": 12823,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-21T21:38:23.270Z",
   "model": "claude-sonnet-5-5",
   "ms": 6802,
   "prompt": "v3",
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-21T21:55:44.967Z",
   "model": "claude-sonnet-5-5",
   "ms": 8082,
   "prompt": "v4",
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-22T01:28:36.871Z",
   "model": "claude-sonnet-5-5",
   "ms": 7208,
   "note": "First run on the text with clause 1.4.",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v4"
  },
  {
   "at": "2026-11-22T01:34:36.479Z",
   "model": "claude-sonnet-5-5",
   "ms": 7923,
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v5"
  }
 ],
 "reworded": [
  {
   "at": "2026-11-21T21:10:13.387Z",
   "model": "claude-sonnet-5-5",
   "ms": 7270,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-21T21:10:21.732Z",
   "model": "claude-sonnet-5-5",
   "ms": 7682,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-21T21:10:34.539Z",
   "model": "claude-sonnet-5-5",
   "ms": 7102,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-21T21:24:40.330Z",
   "model": "claude-haiku-5-5",
   "ms": 13785,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-21T21:56:01.034Z",
   "model": "claude-sonnet-5-5",
   "ms": 7926,
   "prompt": "v4",
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-22T01:34:56.731Z",
   "model": "claude-sonnet-5-5",
   "ms": 7183,
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v5"
  },
  {
   "at": "2026-11-22T01:35:07.858Z",
   "model": "claude-sonnet-5-5",
   "ms": 7814,
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v5"
  },
  {
   "at": "2026-11-22T01:35:18.356Z",
   "model": "claude-sonnet-5-5",
   "ms": 7644,
   "note": "",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v5"
  }
 ],
 "injected": [
  {
   "at": "2026-11-21T21:10:43.189Z",
   "model": "claude-sonnet-5-5",
   "ms": 7316,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 6,
   "of": 6,
   "results": [
    {
     "id": "auto",
     "pass": true,
     "got": "automatic"
    },
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-21T21:24:53.673Z",
   "model": "claude-haiku-5-5",
   "ms": 13033,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 6,
   "of": 6,
   "results": [
    {
     "id": "auto",
     "pass": true,
     "got": "automatic"
    },
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-21T21:56:08.758Z",
   "model": "claude-sonnet-5-5",
   "ms": 7457,
   "prompt": "v4",
   "note": "",
   "outcome": "confirmed",
   "passed": 6,
   "of": 6,
   "results": [
    {
     "id": "auto",
     "pass": true,
     "got": "automatic"
    },
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-22T01:35:29.607Z",
   "model": "claude-sonnet-5-5",
   "ms": 8339,
   "note": "",
   "outcome": "confirmed",
   "passed": 6,
   "of": 6,
   "results": [
    {
     "id": "auto",
     "pass": true,
     "got": "automatic"
    },
    {
     "id": "start",
     "pass": true,
     "got": "2025-03-20"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v5"
  }
 ],
 "amended_alone": [
  {
   "at": "2026-11-21T21:11:10.859Z",
   "model": "claude-sonnet-5-5",
   "ms": 7028,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "initial",
     "pass": true,
     "got": "24 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "30 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-05-31"
    }
   ]
  },
  {
   "at": "2026-11-21T21:25:29.260Z",
   "model": "claude-haiku-5-5",
   "ms": 11276,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "initial",
     "pass": true,
     "got": "24 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "30 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-05-31"
    }
   ]
  },
  {
   "at": "2026-11-21T21:56:43.373Z",
   "model": "claude-sonnet-5-5",
   "ms": 7809,
   "prompt": "v4",
   "note": "",
   "outcome": "confirmed",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "initial",
     "pass": true,
     "got": "24 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "30 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-05-31"
    }
   ]
  },
  {
   "at": "2026-11-22T01:35:49.673Z",
   "model": "claude-sonnet-5-5",
   "ms": 7327,
   "note": "",
   "outcome": "confirmed",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "initial",
     "pass": true,
     "got": "24 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "30 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-05-31"
    }
   ],
   "prompt": "v5"
  }
 ],
 "draft": [
  {
   "at": "2026-11-21T21:12:12.766Z",
   "model": "claude-sonnet-5-5",
   "ms": 6280,
   "prompt": "v2",
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "signed",
     "pass": true,
     "got": "unsigned_or_draft"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    }
   ]
  },
  {
   "at": "2026-11-21T21:26:41.044Z",
   "model": "claude-haiku-5-5",
   "ms": 8644,
   "prompt": "v2",
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "signed",
     "pass": true,
     "got": "unsigned_or_draft"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    }
   ]
  },
  {
   "at": "2026-11-21T21:57:43.748Z",
   "model": "claude-sonnet-5-5",
   "ms": 6022,
   "prompt": "v4",
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "signed",
     "pass": true,
     "got": "unsigned_or_draft"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    }
   ]
  },
  {
   "at": "2026-11-22T01:36:52.456Z",
   "model": "claude-sonnet-5-5",
   "ms": 6182,
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "signed",
     "pass": true,
     "got": "unsigned_or_draft"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    }
   ],
   "prompt": "v5"
  }
 ],
 "cuad_xacct": [
  {
   "at": "2026-11-21T21:12:24.806Z",
   "model": "claude-sonnet-5-5",
   "ms": 10544,
   "prompt": "v2",
   "note": "",
   "outcome": "blocked",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "30 days"
    }
   ]
  },
  {
   "at": "2026-11-21T21:28:12.837Z",
   "model": "claude-haiku-5-5",
   "ms": 13641,
   "prompt": "v2",
   "note": "",
   "outcome": "blocked",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "30 days"
    }
   ]
  },
  {
   "at": "2026-11-21T21:59:13.367Z",
   "model": "claude-sonnet-5-5",
   "ms": 10163,
   "prompt": "v4",
   "note": "",
   "outcome": "blocked",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "30 days"
    }
   ]
  },
  {
   "at": "2026-11-22T01:38:41.662Z",
   "model": "claude-sonnet-5-5",
   "ms": 10162,
   "note": "",
   "outcome": "blocked",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "30 days"
    }
   ],
   "prompt": "v5"
  }
 ],
 "cuad_highway": [
  {
   "at": "2026-11-21T21:12:32.850Z",
   "model": "claude-sonnet-5-5",
   "ms": 7110,
   "prompt": "v2",
   "note": "This run was scored before a date fix: the tool then showed the term ending 9 Jan 2019 and ignored the single 12-month extension. Fixed the same night; it now shows 9 Jan 2020. Run it live to see.",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2018-01-10"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "one_time_extension_then_ends"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "over",
     "pass": true,
     "got": "ended 2019-01-09"
    }
   ]
  },
  {
   "at": "2026-11-21T21:28:25.000Z",
   "model": "claude-haiku-5-5",
   "ms": 0,
   "prompt": "v2",
   "note": "Run failed: the cheaper model's answer was not valid JSON. After this run the server retries once on an unreadable answer.",
   "outcome": "error",
   "passed": 0,
   "of": 5,
   "results": []
  },
  {
   "at": "2026-11-21T21:35:30.574Z",
   "model": "claude-haiku-5-5",
   "ms": 10505,
   "prompt": "v2",
   "note": "Wrong confirmed date. The cheaper model read 'renewed for one additional twelve month period' as renewing every year, so the tool showed a live deadline for a contract that ended in 2020. Sonnet read it correctly. This is the reason the product uses Sonnet, at about 2 to 3 US cents more per read.",
   "outcome": "confirmed",
   "passed": 3,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2018-01-10"
    },
    {
     "id": "mech",
     "pass": false,
     "got": "automatic"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "over",
     "pass": false,
     "got": "confirmed"
    }
   ]
  },
  {
   "at": "2026-11-21T21:39:29.433Z",
   "model": "claude-sonnet-5-5",
   "ms": 7549,
   "prompt": "v3",
   "note": "After the date fix: shown as ended on 9 Jan 2020, after its one extension.",
   "outcome": "ends",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2018-01-10"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "one_time_extension_then_ends"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "over",
     "pass": true,
     "got": "ended 2020-01-09"
    }
   ]
  },
  {
   "at": "2026-11-21T21:59:20.767Z",
   "model": "claude-sonnet-5-5",
   "ms": 6952,
   "prompt": "v4",
   "note": "",
   "outcome": "ends",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2018-01-10"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "one_time_extension_then_ends"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "over",
     "pass": true,
     "got": "ended 2020-01-09"
    }
   ]
  },
  {
   "at": "2026-11-22T01:38:49.411Z",
   "model": "claude-sonnet-5-5",
   "ms": 7394,
   "note": "",
   "outcome": "ends",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2018-01-10"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "one_time_extension_then_ends"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "over",
     "pass": true,
     "got": "ended 2020-01-09"
    }
   ],
   "prompt": "v5"
  }
 ],
 "cuad_sphere": [
  {
   "at": "2026-11-21T21:12:42.166Z",
   "model": "claude-sonnet-5-5",
   "ms": 6845,
   "prompt": "v2",
   "note": "",
   "outcome": "blocked",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2020-06-01"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "5 days"
    }
   ]
  },
  {
   "at": "2026-11-21T21:28:39.819Z",
   "model": "claude-haiku-5-5",
   "ms": 15819,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2020-06-01"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "5 days"
    }
   ]
  },
  {
   "at": "2026-11-21T21:59:38.225Z",
   "model": "claude-sonnet-5-5",
   "ms": 7541,
   "prompt": "v4",
   "note": "",
   "outcome": "blocked",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2020-06-01"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "5 days"
    }
   ]
  },
  {
   "at": "2026-11-22T01:39:00.851Z",
   "model": "claude-sonnet-5-5",
   "ms": 8179,
   "note": "",
   "outcome": "blocked",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2020-06-01"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "5 days"
    }
   ],
   "prompt": "v5"
  }
 ],
 "cuad_martin": [
  {
   "at": "2026-11-21T21:12:50.623Z",
   "model": "claude-sonnet-5-5",
   "ms": 7362,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2003-12-23"
    },
    {
     "id": "initial",
     "pass": true,
     "got": "3 years"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "30 days"
    }
   ]
  },
  {
   "at": "2026-11-21T21:28:55.000Z",
   "model": "claude-haiku-5-5",
   "ms": 0,
   "prompt": "v2",
   "note": "Run failed: the cheaper model's answer was not valid JSON. After this run the server retries once on an unreadable answer.",
   "outcome": "error",
   "passed": 0,
   "of": 4,
   "results": []
  },
  {
   "at": "2026-11-21T21:35:47.738Z",
   "model": "claude-haiku-5-5",
   "ms": 15878,
   "prompt": "v2",
   "note": "Re-run after the retry was added; read correctly.",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2003-12-23"
    },
    {
     "id": "initial",
     "pass": true,
     "got": "3 years"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "30 days"
    }
   ]
  },
  {
   "at": "2026-11-21T21:59:59.815Z",
   "model": "claude-sonnet-5-5",
   "ms": 8120,
   "prompt": "v4",
   "note": "",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2003-12-23"
    },
    {
     "id": "initial",
     "pass": true,
     "got": "3 years"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "30 days"
    }
   ]
  },
  {
   "at": "2026-11-22T01:39:21.599Z",
   "model": "claude-sonnet-5-5",
   "ms": 7873,
   "note": "",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2003-12-23"
    },
    {
     "id": "initial",
     "pass": true,
     "got": "3 years"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "30 days"
    }
   ],
   "prompt": "v5"
  }
 ],
 "st_months": [
  {
   "at": "2026-11-21T21:22:32.023Z",
   "model": "claude-sonnet-5-5",
   "ms": 6018,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "notice",
     "pass": true,
     "got": "3 months"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-31"
    }
   ]
  },
  {
   "at": "2026-11-21T21:26:49.213Z",
   "model": "claude-haiku-5-5",
   "ms": 7810,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "notice",
     "pass": true,
     "got": "3 months"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-31"
    }
   ]
  },
  {
   "at": "2026-11-21T21:57:49.551Z",
   "model": "claude-sonnet-5-5",
   "ms": 5540,
   "prompt": "v4",
   "note": "",
   "outcome": "confirmed",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "notice",
     "pass": true,
     "got": "3 months"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-31"
    }
   ]
  },
  {
   "at": "2026-11-22T01:37:02.796Z",
   "model": "claude-sonnet-5-5",
   "ms": 6021,
   "note": "",
   "outcome": "confirmed",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "notice",
     "pass": true,
     "got": "3 months"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-31"
    }
   ],
   "prompt": "v5"
  }
 ],
 "st_calendar": [
  {
   "at": "2026-11-21T21:22:37.992Z",
   "model": "claude-sonnet-5-5",
   "ms": 5509,
   "prompt": "v2",
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "basis",
     "pass": true,
     "got": "a_fixed_calendar_date"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    }
   ]
  },
  {
   "at": "2026-11-21T21:27:03.917Z",
   "model": "claude-haiku-5-5",
   "ms": 14306,
   "prompt": "v2",
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "basis",
     "pass": true,
     "got": "a_fixed_calendar_date"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    }
   ]
  },
  {
   "at": "2026-11-21T21:58:00.006Z",
   "model": "claude-sonnet-5-5",
   "ms": 5817,
   "prompt": "v4",
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "basis",
     "pass": true,
     "got": "a_fixed_calendar_date"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    }
   ]
  },
  {
   "at": "2026-11-22T01:37:13.577Z",
   "model": "claude-sonnet-5-5",
   "ms": 6272,
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "basis",
     "pass": true,
     "got": "a_fixed_calendar_date"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    }
   ],
   "prompt": "v5"
  }
 ],
 "st_supplier_only": [
  {
   "at": "2026-11-21T21:22:44.537Z",
   "model": "claude-sonnet-5-5",
   "ms": 6220,
   "prompt": "v2",
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "who",
     "pass": true,
     "got": "supplier_only"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked; legal"
    }
   ]
  },
  {
   "at": "2026-11-21T21:27:16.093Z",
   "model": "claude-haiku-5-5",
   "ms": 11579,
   "prompt": "v2",
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "who",
     "pass": true,
     "got": "supplier_only"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked; legal"
    }
   ]
  },
  {
   "at": "2026-11-21T21:58:06.964Z",
   "model": "claude-sonnet-5-5",
   "ms": 6545,
   "prompt": "v4",
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "who",
     "pass": true,
     "got": "supplier_only"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked; legal"
    }
   ]
  },
  {
   "at": "2026-11-22T01:37:24.640Z",
   "model": "claude-sonnet-5-5",
   "ms": 6870,
   "note": "",
   "outcome": "blocked",
   "passed": 2,
   "of": 2,
   "results": [
    {
     "id": "who",
     "pass": true,
     "got": "supplier_only"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked; legal"
    }
   ],
   "prompt": "v5"
  }
 ],
 "st_start_moved": [
  {
   "at": "2026-11-21T21:22:52.872Z",
   "model": "claude-sonnet-5-5",
   "ms": 7832,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-04-01"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-31"
    },
    {
     "id": "chg",
     "pass": true,
     "got": "initial_term: 24 months from the Effective Date of 1 January 2025. to 24 months from the Go-Live Date of 1 April 2025."
    }
   ]
  },
  {
   "at": "2026-11-21T21:27:30.018Z",
   "model": "claude-haiku-5-5",
   "ms": 13399,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-04-01"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-31"
    },
    {
     "id": "chg",
     "pass": true,
     "got": "term_start: Initial term of 24 months runs from the Effective Date of 1 January 2025. to Initial term of 24 months runs from the Go-Live Date of 1 April 2025."
    }
   ]
  },
  {
   "at": "2026-11-21T21:39:21.441Z",
   "model": "claude-sonnet-5-5",
   "ms": 7627,
   "prompt": "v3",
   "note": "",
   "outcome": "confirmed",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-04-01"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-31"
    },
    {
     "id": "chg",
     "pass": true,
     "got": "term_start: Initial term of 24 months runs from the Effective Date, 1 January 2025. to Initial term of 24 months runs from the Go-Live Date, 1 April 2025."
    }
   ]
  },
  {
   "at": "2026-11-21T21:58:16.185Z",
   "model": "claude-sonnet-5-5",
   "ms": 8872,
   "prompt": "v4",
   "note": "",
   "outcome": "confirmed",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-04-01"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-31"
    },
    {
     "id": "chg",
     "pass": true,
     "got": "term_start: Initial term of 24 months runs from the Effective Date, 1 January 2025. to Initial term of 24 months runs from the Go-Live Date, 1 April 2025."
    }
   ]
  },
  {
   "at": "2026-11-22T01:37:36.536Z",
   "model": "claude-sonnet-5-5",
   "ms": 8267,
   "note": "",
   "outcome": "confirmed",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2025-04-01"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-31"
    },
    {
     "id": "chg",
     "pass": true,
     "got": "term_start: Initial term of 24 months runs from the Effective Date, 1 January 2025. to Initial term of 24 months runs from the Go-Live Date, 1 April 2025."
    }
   ],
   "prompt": "v5"
  }
 ],
 "st_not_contract": [
  {
   "at": "2026-11-21T21:22:58.186Z",
   "model": "claude-sonnet-5-5",
   "ms": 5032,
   "prompt": "v2",
   "note": "",
   "outcome": "blocked",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "not_found"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-21T21:27:36.387Z",
   "model": "claude-haiku-5-5",
   "ms": 5845,
   "prompt": "v2",
   "note": "",
   "outcome": "blocked",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "not_found"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-21T21:58:33.681Z",
   "model": "claude-sonnet-5-5",
   "ms": 4880,
   "prompt": "v4",
   "note": "",
   "outcome": "blocked",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "not_found"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-22T01:37:44.032Z",
   "model": "claude-sonnet-5-5",
   "ms": 5247,
   "note": "",
   "outcome": "blocked",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "not_found"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v5"
  }
 ],
 "st_hidden": [
  {
   "at": "2026-11-21T21:23:04.215Z",
   "model": "claude-sonnet-5-5",
   "ms": 5776,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "auto",
     "pass": true,
     "got": "automatic"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-21T21:27:46.271Z",
   "model": "claude-haiku-5-5",
   "ms": 9363,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "auto",
     "pass": true,
     "got": "automatic"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-21T21:58:45.556Z",
   "model": "claude-sonnet-5-5",
   "ms": 6088,
   "prompt": "v4",
   "note": "",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "auto",
     "pass": true,
     "got": "automatic"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ]
  },
  {
   "at": "2026-11-22T01:37:55.595Z",
   "model": "claude-sonnet-5-5",
   "ms": 6249,
   "note": "",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "auto",
     "pass": true,
     "got": "automatic"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-12-19"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v5"
  }
 ],
 "st_anniversary": [
  {
   "at": "2026-11-21T21:23:33.102Z",
   "model": "claude-sonnet-5-5",
   "ms": 5284,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "60 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-01-13"
    }
   ]
  },
  {
   "at": "2026-11-21T21:27:58.924Z",
   "model": "claude-haiku-5-5",
   "ms": 12387,
   "prompt": "v2",
   "note": "",
   "outcome": "confirmed",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "60 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-01-13"
    }
   ]
  },
  {
   "at": "2026-11-21T21:58:51.616Z",
   "model": "claude-sonnet-5-5",
   "ms": 5752,
   "prompt": "v4",
   "note": "",
   "outcome": "confirmed",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "60 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-01-13"
    }
   ]
  },
  {
   "at": "2026-11-22T01:38:06.303Z",
   "model": "claude-sonnet-5-5",
   "ms": 6471,
   "note": "",
   "outcome": "confirmed",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "60 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-01-13"
    }
   ],
   "prompt": "v5"
  }
 ],
 "st_two_orders": [
  {
   "at": "2026-11-21T21:35:08.543Z",
   "model": "claude-sonnet-5-5",
   "ms": 6090,
   "prompt": "v2",
   "note": "Failed: one confirmed date for two subscriptions; only the model's reader note mentioned the second order. Fix: the model now counts parts that renew separately, and the tool blocks the family and asks for each order form to be added on its own (prompt v3).",
   "outcome": "confirmed",
   "passed": 0,
   "of": 1,
   "results": [
    {
     "id": "flag",
     "pass": false,
     "got": "confirmed, 2026-12-30; the reader's note mentions the second order"
    }
   ]
  },
  {
   "at": "2026-11-21T21:35:58.654Z",
   "model": "claude-haiku-5-5",
   "ms": 10657,
   "prompt": "v2",
   "note": "Same failure on the cheaper model.",
   "outcome": "confirmed",
   "passed": 0,
   "of": 1,
   "results": [
    {
     "id": "flag",
     "pass": false,
     "got": "confirmed, 2026-12-30; the reader's note mentions the second order"
    }
   ]
  },
  {
   "at": "2026-11-21T21:38:09.328Z",
   "model": "claude-sonnet-5-5",
   "ms": 6189,
   "prompt": "v3",
   "note": "After the fix: the model counted 2 separately renewing parts and the tool blocked the family. Read twice, same result.",
   "outcome": "blocked",
   "passed": 1,
   "of": 1,
   "results": [
    {
     "id": "flag",
     "pass": true,
     "got": "blocked"
    }
   ]
  },
  {
   "at": "2026-11-21T21:38:15.957Z",
   "model": "claude-sonnet-5-5",
   "ms": 6193,
   "prompt": "v3",
   "note": "",
   "outcome": "blocked",
   "passed": 1,
   "of": 1,
   "results": [
    {
     "id": "flag",
     "pass": true,
     "got": "blocked"
    }
   ]
  },
  {
   "at": "2026-11-21T21:59:02.747Z",
   "model": "claude-sonnet-5-5",
   "ms": 6160,
   "prompt": "v4",
   "note": "",
   "outcome": "blocked",
   "passed": 1,
   "of": 1,
   "results": [
    {
     "id": "flag",
     "pass": true,
     "got": "blocked"
    }
   ]
  },
  {
   "at": "2026-11-22T01:38:27.366Z",
   "model": "claude-sonnet-5-5",
   "ms": 6564,
   "note": "",
   "outcome": "blocked",
   "passed": 1,
   "of": 1,
   "results": [
    {
     "id": "flag",
     "pass": true,
     "got": "blocked"
    }
   ],
   "prompt": "v5"
  }
 ],
 "cuad_magenta": [
  {
   "at": "2026-11-21T21:35:18.706Z",
   "model": "claude-sonnet-5-5",
   "ms": 9486,
   "prompt": "v2",
   "note": "",
   "outcome": "blocked",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "initial",
     "pass": true,
     "got": "5 years"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "nonotice",
     "pass": true,
     "got": "not found"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    }
   ]
  },
  {
   "at": "2026-11-21T21:36:20.000Z",
   "model": "claude-haiku-5-5",
   "ms": 0,
   "prompt": "v2",
   "note": "Run failed: on this 73,000-character contract the cheaper model's answer was not valid JSON, twice, even with the retry.",
   "outcome": "error",
   "passed": 0,
   "of": 4,
   "results": []
  },
  {
   "at": "2026-11-21T21:59:51.077Z",
   "model": "claude-sonnet-5-5",
   "ms": 9232,
   "prompt": "v4",
   "note": "",
   "outcome": "blocked",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "initial",
     "pass": true,
     "got": "5 years"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "nonotice",
     "pass": true,
     "got": "not found"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    }
   ]
  },
  {
   "at": "2026-11-22T01:39:12.703Z",
   "model": "claude-sonnet-5-5",
   "ms": 9317,
   "note": "",
   "outcome": "blocked",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "initial",
     "pass": true,
     "got": "5 years"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "nonotice",
     "pass": true,
     "got": "not found"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    }
   ],
   "prompt": "v5"
  }
 ],
 "st_window": [
  {
   "at": "2026-11-21T21:55:30.341Z",
   "model": "claude-sonnet-5-5",
   "ms": 6539,
   "prompt": "v4",
   "note": "",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "notice",
     "pass": true,
     "got": "60 days"
    },
    {
     "id": "earliest",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-01-30"
    },
    {
     "id": "opens",
     "pass": true,
     "got": "2026-12-31"
    }
   ]
  },
  {
   "at": "2026-11-21T21:55:36.625Z",
   "model": "claude-sonnet-5-5",
   "ms": 5866,
   "prompt": "v4",
   "note": "",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "notice",
     "pass": true,
     "got": "60 days"
    },
    {
     "id": "earliest",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-01-30"
    },
    {
     "id": "opens",
     "pass": true,
     "got": "2026-12-31"
    }
   ]
  },
  {
   "at": "2026-11-22T01:38:16.603Z",
   "model": "claude-sonnet-5-5",
   "ms": 6287,
   "note": "",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "notice",
     "pass": true,
     "got": "60 days"
    },
    {
     "id": "earliest",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-01-30"
    },
    {
     "id": "opens",
     "pass": true,
     "got": "2026-12-31"
    }
   ],
   "prompt": "v5"
  }
 ],
 "ho_sibannac": [
  {
   "at": "2026-11-22T01:25:20.677Z",
   "model": "claude-sonnet-5-5",
   "ms": 7855,
   "note": "Held-out run 1.",
   "outcome": "ends",
   "passed": 6,
   "of": 6,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2017-11-30"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "one_time_extension_then_ends"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "over",
     "pass": true,
     "got": "ended 2019-11-29"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v4"
  },
  {
   "at": "2026-11-22T01:39:31.914Z",
   "model": "claude-sonnet-5-5",
   "ms": 7935,
   "note": "Held-out run 2, after the end-of-term guards (prompt v5).",
   "outcome": "ends",
   "passed": 6,
   "of": 6,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2017-11-30"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "one_time_extension_then_ends"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "12 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "over",
     "pass": true,
     "got": "ended 2019-11-29"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v5"
  }
 ],
 "ho_bolivar": [
  {
   "at": "2026-11-22T01:25:39.030Z",
   "model": "claude-sonnet-5-5",
   "ms": 6784,
   "note": "Held-out run 1.",
   "outcome": "confirmed",
   "passed": 6,
   "of": 6,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2003-05-12"
    },
    {
     "id": "initial",
     "pass": true,
     "got": "5 years"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-02-10"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v4"
  },
  {
   "at": "2026-11-22T01:39:41.914Z",
   "model": "claude-sonnet-5-5",
   "ms": 7242,
   "note": "Held-out run 2, after the end-of-term guards (prompt v5).",
   "outcome": "confirmed",
   "passed": 6,
   "of": 6,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2003-05-12"
    },
    {
     "id": "initial",
     "pass": true,
     "got": "5 years"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2027-02-10"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v5"
  }
 ],
 "ho_sykes": [
  {
   "at": "2026-11-22T01:26:00.142Z",
   "model": "claude-sonnet-5-5",
   "ms": 9597,
   "note": "Held-out run 1. Not confirmed, so no date: safe, but no help to the user.",
   "outcome": "blocked",
   "passed": 3,
   "of": 4,
   "results": [
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "automatic"
    },
    {
     "id": "date",
     "pass": false,
     "got": "blocked"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v4"
  },
  {
   "at": "2026-11-22T01:39:55.209Z",
   "model": "claude-sonnet-5-5",
   "ms": 10023,
   "note": "Held-out run 2. Still not confirmed, so no date: safe, but no help to the user.",
   "outcome": "blocked",
   "passed": 3,
   "of": 4,
   "results": [
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "mech",
     "pass": true,
     "got": "automatic"
    },
    {
     "id": "date",
     "pass": false,
     "got": "blocked"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v5"
  }
 ],
 "ho_cooltech": [
  {
   "at": "2026-11-22T01:26:20.311Z",
   "model": "claude-sonnet-5-5",
   "ms": 8583,
   "note": "Held-out run 1. Wrong confirmed date by the check written before the run: the term ends on the later of five years or completion of certain projects. The model said so in its note, but nothing in the structured reading carried it, so code confirmed 25 Apr 2027. That is the earliest possible date, so acting on it was safe, but it was not certain. This led to the end-of-term guards (prompt v5).",
   "outcome": "confirmed",
   "passed": 2,
   "of": 3,
   "results": [
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "30 days"
    },
    {
     "id": "noconfirm",
     "pass": false,
     "got": "confirmed, last notice 2027-04-25"
    }
   ],
   "prompt": "v4"
  },
  {
   "at": "2026-11-22T01:40:04.500Z",
   "model": "claude-sonnet-5-5",
   "ms": 8769,
   "note": "Held-out run 2, after the end-of-term guards (prompt v5). Not confirmed: the guard caught it.",
   "outcome": "blocked",
   "passed": 3,
   "of": 3,
   "results": [
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "30 days"
    },
    {
     "id": "noconfirm",
     "pass": true,
     "got": "blocked"
    }
   ],
   "prompt": "v5"
  }
 ],
 "ho_datacall": [
  {
   "at": "2026-11-22T01:26:39.303Z",
   "model": "claude-sonnet-5-5",
   "ms": 7483,
   "note": "Held-out run 1.",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2006-04-01"
    },
    {
     "id": "initial",
     "pass": true,
     "got": "24 months"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "6 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "60 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v4"
  },
  {
   "at": "2026-11-22T01:40:14.613Z",
   "model": "claude-sonnet-5-5",
   "ms": 8408,
   "note": "Held-out run 2, after the end-of-term guards (prompt v5).",
   "outcome": "confirmed",
   "passed": 5,
   "of": 5,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2006-04-01"
    },
    {
     "id": "initial",
     "pass": true,
     "got": "24 months"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "6 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "60 days"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v5"
  }
 ],
 "ho_ultragenyx": [
  {
   "at": "2026-11-22T01:26:59.779Z",
   "model": "claude-sonnet-5-5",
   "ms": 9174,
   "note": "Held-out run 1.",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "initial",
     "pass": true,
     "got": "3 years"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "2 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "3 months"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v4"
  },
  {
   "at": "2026-11-22T01:40:33.776Z",
   "model": "claude-sonnet-5-5",
   "ms": 17259,
   "note": "Held-out run 2, after the end-of-term guards (prompt v5).",
   "outcome": "confirmed",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "initial",
     "pass": true,
     "got": "3 years"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "2 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "3 months"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v5"
  }
 ],
 "ho_legacy": [
  {
   "at": "2026-11-22T01:27:19.469Z",
   "model": "claude-sonnet-5-5",
   "ms": 8283,
   "note": "Held-out run 1.",
   "outcome": "confirmed",
   "passed": 6,
   "of": 6,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2005-12-08"
    },
    {
     "id": "initial",
     "pass": true,
     "got": "2 years"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "60 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-10-08"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v4"
  },
  {
   "at": "2026-11-22T01:40:43.075Z",
   "model": "claude-sonnet-5-5",
   "ms": 8994,
   "note": "Held-out run 2, after the end-of-term guards (prompt v5).",
   "outcome": "confirmed",
   "passed": 6,
   "of": 6,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2005-12-08"
    },
    {
     "id": "initial",
     "pass": true,
     "got": "2 years"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "60 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-10-08"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v5"
  }
 ],
 "ho_centrack": [
  {
   "at": "2026-11-22T01:27:39.160Z",
   "model": "claude-sonnet-5-5",
   "ms": 8209,
   "note": "Held-out run 1.",
   "outcome": "confirmed",
   "passed": 6,
   "of": 6,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "1999-04-01"
    },
    {
     "id": "initial",
     "pass": true,
     "got": "6 months"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "15 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-11-15"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v4"
  },
  {
   "at": "2026-11-22T01:40:52.350Z",
   "model": "claude-sonnet-5-5",
   "ms": 7783,
   "note": "Held-out run 2, after the end-of-term guards (prompt v5).",
   "outcome": "confirmed",
   "passed": 6,
   "of": 6,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "1999-04-01"
    },
    {
     "id": "initial",
     "pass": true,
     "got": "6 months"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "15 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-11-15"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v5"
  }
 ],
 "ho_emerald": [
  {
   "at": "2026-11-22T01:27:59.484Z",
   "model": "claude-sonnet-5-5",
   "ms": 8777,
   "note": "Held-out run 1. Wrong confirmed date: shown as live, although the ten-year agreement ended on 31 Aug 2026 and the services term cannot outlive it. The model's note mentioned the two terms; the structured reading had no place for the overall limit. This led to the end-of-term guards (prompt v5).",
   "outcome": "confirmed",
   "passed": 3,
   "of": 4,
   "results": [
    {
     "id": "renewal",
     "pass": true,
     "got": "2 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "over",
     "pass": false,
     "got": "confirmed"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v4"
  },
  {
   "at": "2026-11-22T01:41:03.881Z",
   "model": "claude-sonnet-5-5",
   "ms": 8606,
   "note": "Held-out run 2, after the end-of-term guards (prompt v5). Not confirmed: the guard caught it.",
   "outcome": "blocked",
   "passed": 4,
   "of": 4,
   "results": [
    {
     "id": "renewal",
     "pass": true,
     "got": "2 years"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "90 days"
    },
    {
     "id": "over",
     "pass": true,
     "got": "blocked"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v5"
  }
 ],
 "ho_uagh": [
  {
   "at": "2026-11-22T01:28:18.332Z",
   "model": "claude-sonnet-5-5",
   "ms": 7470,
   "note": "Held-out run 1.",
   "outcome": "confirmed",
   "passed": 6,
   "of": 6,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2003-07-23"
    },
    {
     "id": "initial",
     "pass": true,
     "got": "5 years"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "30 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-11-22"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v4"
  },
  {
   "at": "2026-11-22T01:41:13.296Z",
   "model": "claude-sonnet-5-5",
   "ms": 7534,
   "note": "Held-out run 2, after the end-of-term guards (prompt v5).",
   "outcome": "confirmed",
   "passed": 6,
   "of": 6,
   "results": [
    {
     "id": "start",
     "pass": true,
     "got": "2003-07-23"
    },
    {
     "id": "initial",
     "pass": true,
     "got": "5 years"
    },
    {
     "id": "renewal",
     "pass": true,
     "got": "1 months"
    },
    {
     "id": "notice",
     "pass": true,
     "got": "30 days"
    },
    {
     "id": "date",
     "pass": true,
     "got": "confirmed, 2026-11-22"
    },
    {
     "id": "quotes",
     "pass": true,
     "got": "all found"
    }
   ],
   "prompt": "v5"
  }
 ]
};
