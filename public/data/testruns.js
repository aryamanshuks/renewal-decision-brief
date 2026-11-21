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
  }
 ]
};
