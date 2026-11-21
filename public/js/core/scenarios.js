// Workflow rules, checked on real saved model readings. Pure code: these run in the browser every time the test bench opens.
// Added after an outside review found that the tool could close work the contract still required.

import { PRECOMPUTED } from "../../data/precomputed.js";
import { SAMPLE_FAMILIES, SUPPLIER_MASTER, DEMO_TODAY } from "../../data/samples.js";
import { buildBrief } from "./brief.js";
import { workflowState, decisionBasis } from "./workflow.js";
import { parseISO, toISO } from "./dates.js";

const today = parseISO(DEMO_TODAY);
const people = { procurement: { name: "Priya Menon" }, escalation: { name: "Rohan Kapoor" }, legal: { name: "Anita Desai" } };

function setup(id, record = {}, mutate) {
  const family = SAMPLE_FAMILIES.find((f) => f.id === id);
  const supplier = { ...SUPPLIER_MASTER.find((s) => s.id === family.supplierId), currency: "INR" };
  const extraction = JSON.parse(JSON.stringify(PRECOMPUTED[id].result));
  if (mutate) mutate(extraction);
  const brief = buildBrief({ extraction, documents: family.documents, record, supplier, today });
  const flow = workflowState({ brief, record, supplier, people, today });
  return { brief, flow, supplier };
}

const exitDecision = (id) => {
  const { brief } = setup(id);
  return { choice: "exit", by: "Arjun Mehta", on: "2026-11-23", reason: "Moving to another helpdesk", basis: decisionBasis(brief) };
};

export const SCENARIOS = [
  {
    id: "wrong_method", title: "A notice sent by a method the contract does not allow stays open",
    run() {
      const { flow } = setup("brightdesk", { decision: exitDecision("brightdesk"), notice: { sentOn: "2026-11-24", method: "Courier", proof: "CR-1" } });
      return { pass: flow.label === "Notice may not count" && /allows only registered post/.test(flow.detail), got: `${flow.label}. ${flow.detail}` };
    },
  },
  {
    id: "late_receipt", title: "Posted before the deadline but deemed received after it: not counted",
    run() {
      const { flow } = setup("brightdesk", { decision: exitDecision("brightdesk"), notice: { sentOn: "2026-12-15", method: "Registered post", proof: "RP-1" } });
      return { pass: flow.label === "Notice may not count" && /18 Dec 2026/.test(flow.detail), got: `${flow.label}. ${flow.detail}` };
    },
  },
  {
    id: "valid_notice", title: "A notice by the right method, received in time, closes the work",
    run() {
      const { flow } = setup("brightdesk", { decision: exitDecision("brightdesk"), notice: { sentOn: "2026-12-01", method: "Registered post", proof: "RP-2" } });
      return { pass: flow.label === "Notice valid and on time", got: `${flow.label}. ${flow.detail}` };
    },
  },
  {
    id: "conflict_binding", title: "A chosen reading shows its own passage; the rejected one stays visible",
    run() {
      const { brief } = setup("datavine", { resolutions: { conflicts: { notice_period: { side: "b", reason: "Order form is later and specific", legal: true, by: "Priya Menon", on: "2026-11-23" } } } });
      const f = brief.facts.find((x) => x.key === "notice_period");
      const ok = /thirty \(30\) days/.test(f.evidence.quote) && /sixty \(60\) days/.test(f.rejected?.evidence?.quote || "") && toISO(brief.dates?.cancelBy) === "2027-01-29";
      return { pass: ok, got: `${f.value}; shown passage says ${/thirty/.test(f.evidence.quote) ? "30" : "60"} days; rejected passage kept: ${f.rejected ? "yes" : "no"}` };
    },
  },
  {
    id: "extension_task", title: "\"Renew\" on a contract that simply ends needs a signed extension",
    run() {
      const { brief } = setup("paperlantern");
      const { flow } = setup("paperlantern", { decision: { choice: "renew", by: "Ishita Bose", on: "2026-11-23", reason: "Campaigns run to June", basis: decisionBasis(brief) } });
      return { pass: flow.label === "Signed extension needed", got: `${flow.label}. ${flow.detail}` };
    },
  },
  {
    id: "reopen", title: "If the terms change after a decision, the decision reopens",
    run() {
      const decision = { choice: "renew", by: "Arjun Mehta", on: "2026-11-23", reason: "Team relies on it", basis: decisionBasis(setup("brightdesk").brief) };
      const { flow } = setup("brightdesk", { decision }, (x) => {
        x.renewal.mechanism = "mutual_written_agreement";
        x.renewal.renewal_term_number = 0;
        x.renewal.renewal_term_unit = "none";
        x.renewal.if_no_one_acts = "It ends at the end of the term.";
      });
      return { pass: flow.label === "Terms changed since the decision", got: `${flow.label}. ${flow.detail}` };
    },
  },
  {
    id: "negation", title: "\"Is not extended or renewed\" is not read as a contradiction",
    run() {
      const { brief } = setup("paperlantern", {}, (x) => {
        x.renewal.mechanism = "no_renewal_fixed_term";
        x.renewal.if_no_one_acts = "The agreement ends on 31 December 2026 and is not extended or renewed.";
      });
      const flagged = brief.hard.some((b) => b.type === "inconsistent");
      return { pass: !flagged, got: flagged ? "flagged as a contradiction" : "no contradiction raised" };
    },
  },
  {
    id: "odd_answer", title: "An owner's start date before signing goes to procurement to check",
    run() {
      const { flow } = setup("kestrelway", { answers: { term_start_date: { value: "2025-02-03", by: "Meera Nair", evidenceNote: "" } } });
      return { pass: flow.stage === "check_answer", got: flow.label };
    },
  },
];

export function runScenarios() {
  return SCENARIOS.map((s) => {
    try {
      const r = s.run();
      return { id: s.id, title: s.title, pass: Boolean(r.pass), got: r.got };
    } catch (error) {
      return { id: s.id, title: s.title, pass: false, got: `error: ${error.message}` };
    }
  });
}
