import { html, useState, useEffect, useStore, openDoc, Spinner, Tone } from "./common.js";
import { TEST_CASES, evaluateCase, DATE_CRITICAL, loadDocuments } from "../core/testcases.js";
import { runScenarios } from "../core/scenarios.js";
import { SAVED_RUNS } from "../../data/testruns.js";
import { saveTestRun } from "../store.js";
import { extract } from "../api.js";

const GROUPS = [...new Set(TEST_CASES.map((c) => c.group))];

function istTime(iso) {
  try {
    return new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return iso;
  }
}

let running = false;
const statusListeners = new Set();
let status = { busy: false, current: "", note: "" };
function setStatus(patch) {
  status = { ...status, ...patch };
  statusListeners.forEach((fn) => fn(status));
}

async function runCase(tc) {
  const times = tc.runs || 1;
  for (let i = 0; i < times; i += 1) {
    setStatus({ current: `${tc.title}${times > 1 ? `, read ${i + 1} of ${times}` : ""}` });
    let attempt = 0;
    for (;;) {
      try {
        await loadDocuments(tc);
        const { result, meta } = await extract(tc.documents);
        const ev = evaluateCase(tc, result);
        saveTestRun(tc.id, { at: meta.ran_at, model: meta.model, ms: meta.ms, prompt: "live", note: "", outcome: ev.outcome, passed: ev.passed, of: ev.of, results: ev.results });
        break;
      } catch (error) {
        const wait = error.retryAfter && error.retryAfter <= 90 ? error.retryAfter : 0;
        if (wait && attempt < 2) {
          attempt += 1;
          setStatus({ note: `The demo allows 6 live reads a minute. Waiting ${wait} seconds.` });
          await new Promise((r) => setTimeout(r, (wait + 1) * 1000));
          setStatus({ note: "" });
          continue;
        }
        saveTestRun(tc.id, { at: new Date().toISOString(), model: "", ms: 0, prompt: "live", note: `Run failed: ${error.message}`, outcome: "error", passed: 0, of: tc.expected.length, results: [] });
        if (["no_key", "spend_limit", "no_credit", "spend_cap", "network"].includes(error.code)) return false;
        break;
      }
    }
  }
  return true;
}

async function runMany(cases) {
  if (running) return;
  running = true;
  setStatus({ busy: true, note: "" });
  try {
    for (const tc of cases) {
      const ok = await runCase(tc);
      if (!ok) break;
    }
  } finally {
    running = false;
    setStatus({ busy: false, current: "", note: "" });
  }
}

function useRunStatus() {
  const [s, setS] = useState(status);
  useEffect(() => {
    statusListeners.add(setS);
    return () => statusListeners.delete(setS);
  }, []);
  return s;
}

export function TestBench() {
  const state = useStore();
  const run = useRunStatus();
  const live = state.testRuns || {};
  const saved = SAVED_RUNS || {};
  const savedRuns = Object.values(saved).flat();
  const savedPassed = savedRuns.reduce((n, r) => n + r.passed, 0);
  const savedOf = savedRuns.reduce((n, r) => n + r.of, 0);
  const liveRuns = Object.values(live).flat().filter((r) => r.outcome !== "error");
  const casesRun = TEST_CASES.filter((c) => (saved[c.id] || []).length > 0).length;
  // The safety number: a date shown as confirmed that the expected answer says is wrong.
  const confirmed = savedRuns.filter((r) => r.outcome === "confirmed");
  const wrongConfirmed = confirmed.filter((r) => r.results.some((x) => DATE_CRITICAL.has(x.id) && !x.pass));
  const wrongByModel = {};
  for (const r of wrongConfirmed) wrongByModel[r.model] = (wrongByModel[r.model] || 0) + 1;
  const models = [...new Set(savedRuns.map((r) => r.model).filter(Boolean))];

  return html`
    <div class="page">
      <h1 class="h1">Test bench</h1>
      <p class="lede">${TEST_CASES.length} contract families, each with the right answer written down before any run, as checks in code. ${TEST_CASES.filter((c) => c.kind === "synthetic").length} are samples written to break the tool, ${TEST_CASES.filter((c) => c.group.startsWith("Stress")).length} of them added in a second, harsher pass. ${TEST_CASES.filter((c) => c.kind === "real").length} are real contracts from public filings, with labels by legal experts to compare against.</p>

      <div class="coverage" style="margin-top:14px">
        <strong>Saved runs:</strong> ${casesRun} of ${TEST_CASES.length} cases run on the live site, ${savedRuns.length} reads, ${savedPassed} of ${savedOf} checks passed. Failures are kept, with a note on what happened.
        <div style="margin-top:4px"><strong>Wrong confirmed dates: ${wrongConfirmed.length}</strong> of ${confirmed.length} reads that ended with a confirmed date${wrongConfirmed.length ? ` (${Object.entries(wrongByModel).map(([m, n]) => `${modelLabel(m)}: ${n}`).join("; ")})` : ""}${models.length > 1 ? `, across ${models.map(modelLabel).join(" and ")}` : ""}. This is the number that matters most: a wrong date shown as confirmed is worse than no date.</div>
        ${liveRuns.length > 0 && html`<div style="margin-top:4px"><strong>Your live runs in this browser:</strong> ${liveRuns.length} reads, ${liveRuns.reduce((n, r) => n + r.passed, 0)} of ${liveRuns.reduce((n, r) => n + r.of, 0)} checks passed.</div>`}
        <div style="margin-top:6px" class="row">
          <button class="btn small" disabled=${run.busy} onClick=${() => runMany(TEST_CASES)}>Run all live now</button>
          <span class="small muted">About ${TEST_CASES.reduce((n, c) => n + (c.runs || 1), 0)} reads, 3 to 5 minutes, a few US cents each.</span>
        </div>
        ${run.busy && html`<div style="margin-top:6px"><${Spinner} label=${`Running: ${run.current}`} /> ${run.note && html`<span class="small muted">${run.note}</span>`}</div>`}
      </div>

      <${WorkflowRules} />

      <p class="small muted" style="margin-top:10px">How to read a check: <span class="pass">Pass</span> or <span class="fail">Fail</span>, then what the tool actually produced. "Saved" runs were made by me on the live site; "live" runs are yours, from this browser. Dates use the demo date, 23 Nov 2026.</p>

      ${GROUPS.map((g) => html`
        <section style="margin-top:22px">
          <div class="band-title"><span>${g}</span></div>
          <div style="margin-top:10px">
            ${TEST_CASES.filter((c) => c.group === g).map((c) => html`<${Case} tc=${c} saved=${saved[c.id] || []} live=${live[c.id] || []} busy=${run.busy} />`)}
          </div>
        </section>`)}

      <p class="footer">What I would add with more time: the other 104 CUAD contracts that have both labels, scored automatically against the lawyers' answers; and a second reader model, so that disagreement between two reads becomes a reason to ask a person.</p>
    </div>`;
}

function WorkflowRules() {
  const results = runScenarios();
  const passed = results.filter((r) => r.pass).length;
  return html`
    <section style="margin-top:18px">
      <div class="band-title"><span>Workflow rules, checked in your browser now</span><span class=${passed === results.length ? "pass" : "fail"}>${passed} of ${results.length} pass</span></div>
      <p class="small muted" style="margin-top:6px">Two independent reviews of earlier versions found that the tool could close work the contract still required: a notice by the wrong method, received too late or too early, or dated in the future; a conflict choice shown against the other document's passage; a decision left standing after an amendment; two end dates for one extension. These rules now run on the saved real readings every time this page opens.</p>
      <ul class="checks">
        ${results.map((r) => html`<li><span class=${r.pass ? "pass" : "fail"}>${r.pass ? "Pass" : "Fail"}</span><span>${r.title}<div class="small muted">${r.got}</div></span></li>`)}
      </ul>
    </section>`;
}

function Case({ tc, saved, live, busy }) {
  const [open, setOpen] = useState(false);
  const runs = [...saved.map((r) => ({ ...r, src: "Saved" })), ...live.slice().reverse().map((r) => ({ ...r, src: "Live" }))];
  const last = runs[runs.length - 1];
  const verdict = !last ? html`<${Tone} tone="neutral">Not run yet</${Tone}>` : last.outcome === "error" ? html`<${Tone} tone="bad">Run failed</${Tone}>` : last.passed === last.of ? html`<${Tone} tone="good">${last.passed} of ${last.of} passed</${Tone}>` : html`<${Tone} tone="bad">${last.passed} of ${last.of} passed</${Tone}>`;
  return html`
    <div class="case">
      <div class="spread">
        <div style="max-width:72ch">
          <div class="row" style="gap:8px"><span class="h3">${tc.title}</span><span class=${`tag ${tc.kind === "real" ? "outside" : "assume"}`}>${tc.kind === "real" ? "Real public contract" : "Synthetic sample"}</span>${tc.runs > 1 ? html`<span class="small muted">read ${tc.runs} times per run</span>` : ""}</div>
          <div class="small" style="color:var(--ink-2);margin-top:2px">${tc.tests}</div>
        </div>
        <div class="row" style="gap:8px">
          ${verdict}
          <button class="btn ghost small" onClick=${() => setOpen(!open)}>${open ? "Hide detail" : "Detail"}</button>
          <button class="btn ghost small" disabled=${busy} onClick=${() => runMany([tc])}>Run live</button>
        </div>
      </div>

      ${open && html`
        <div class="scroll-x" style="margin-top:10px">
          <table class="table">
            <thead><tr><th style="min-width:240px">Expected, written before the run</th>${runs.map((r) => html`<th style="min-width:130px">${r.src}${r.model && r.model !== "claude-sonnet-5-5" ? `, ${modelLabel(r.model)}` : ""}${r.prompt && r.prompt !== "live" ? `, prompt ${r.prompt}` : ""}<div class="small muted" style="font-weight:400">${istTime(r.at)} IST</div></th>`)}</tr></thead>
            <tbody>
              ${tc.expected.map((e) => html`
                <tr>
                  <td>${e.text}</td>
                  ${runs.map((r) => {
                    const x = r.results.find((y) => y.id === e.id);
                    if (!x) return html`<td class="small muted">${r.outcome === "error" ? "Run failed" : "Not checked"}</td>`;
                    return html`<td class="small"><span class=${x.pass ? "pass" : "fail"}>${x.pass ? "Pass" : "Fail"}</span><div class="muted">${x.got}</div></td>`;
                  })}
                </tr>`)}
            </tbody>
          </table>
        </div>
        ${runs.filter((r) => r.note).map((r) => html`<div class="banner" style="margin-top:8px"><b>${r.src} run, ${istTime(r.at)} IST.</b> ${r.note}</div>`)}
        ${tc.labels && html`
          <div style="margin-top:10px">
            <div class="small" style="font-weight:650">What the lawyers labelled (CUAD)</div>
            ${["Renewal Term", "Notice Period To Terminate Renewal", "Expiration Date"].filter((k) => (tc.labels[k] || []).length).map((k) => html`
              <div style="margin-top:6px"><div class="small muted">${k}</div>${tc.labels[k].map((t) => html`<blockquote class="passage">${t}</blockquote>`)}</div>`)}
          </div>`}
        <div class="row" style="margin-top:10px;align-items:flex-start">
          <div class="small" style="flex:1;min-width:260px"><b>Check it by hand.</b> ${tc.hand}</div>
          <div class="row" style="gap:6px">${tc.documents
            ? tc.documents.map((d) => html`<button class="btn ghost small" onClick=${() => openDoc({ name: d.name, text: d.text, start: -1, end: -1 })}>Open ${tc.documents.length > 1 ? d.name : "the text"}</button>`)
            : html`<button class="btn ghost small" onClick=${async () => { const [d] = await loadDocuments(tc); openDoc({ name: d.name, text: d.text, start: -1, end: -1 }); }}>Open the text</button>`}</div>
        </div>`}
    </div>`;
}

// Used during the build to run a chosen set of cases on the live site.
window.rdbRunCases = (ids) => runMany(TEST_CASES.filter((c) => ids.includes(c.id)));

function modelLabel(m) {
  const parts = String(m || "").replace(/^claude-/, "").split("-");
  const name = parts[0] ? parts[0][0].toUpperCase() + parts[0].slice(1) : "";
  const version = parts.slice(1).join(".");
  return version ? `${name} ${version}` : name;
}
