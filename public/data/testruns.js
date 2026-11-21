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
   "note": "Wrong confirmed date. The cheaper model read 'renewed for one additional twelve month period' as renewing every year, so the tool showed a live deadline for a contract that ended in 2020. Sonnet read it correctly. This is the reason the product uses Sonnet, at about 1 US cent more per read.",
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
  }
 ]
};
