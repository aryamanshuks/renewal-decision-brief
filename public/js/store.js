// One shared record for both roles, kept in this browser.
// Procurement and the business owner act on the same data, so a change made as one is what the other sees.

import { SAMPLE_FAMILIES, SUPPLIER_MASTER, PEOPLE, DEMO_TODAY } from "../data/samples.js";
import { PRECOMPUTED } from "../data/precomputed.js";
import { buildBrief } from "./core/brief.js";
import { workflowState, newQuestion, priorityBand, decisionBasis } from "./core/workflow.js";
import { parseISO, toISO, formatDate } from "./core/dates.js";
import { extract } from "./api.js";

const STORAGE_KEY = "rdb-state-v4";
const CUSTOMER = "Orvanta Commerce Private Limited";

function supplierById(id) {
  return SUPPLIER_MASTER.find((s) => s.id === id) || null;
}

function freshContract(family) {
  const pre = PRECOMPUTED[family.id] || null;
  return {
    id: family.id,
    supplierId: family.supplierId,
    custom: false,
    documents: family.documents.map((d) => ({ ...d })),
    extraction: pre ? pre.result : null,
    meta: pre ? { ...pre.meta, source: "precomputed" } : null,
    record: { answers: {}, resolutions: { conflicts: {}, passages: {} }, log: [] },
    history: [],
    reading: false,
    error: null,
  };
}

function initialState() {
  const contracts = {};
  const order = [];
  for (const family of SAMPLE_FAMILIES) {
    contracts[family.id] = freshContract(family);
    order.push(family.id);
  }
  return {
    role: "procurement",
    ownerName: "Meera Nair",
    clock: { pinned: true, date: DEMO_TODAY },
    contracts,
    order,
    guide: { open: true, done: {} },
    testRuns: {},
    health: null,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || !saved.contracts) return null;
    // Sample text and precomputed readings always come from the shipped files, so a new deployment is never masked by old browser data.
    const base = initialState();
    for (const id of Object.keys(base.contracts)) {
      const old = saved.contracts[id];
      if (!old) continue;
      const fresh = base.contracts[id];
      fresh.record = old.record || fresh.record;
      if (old.edited && Array.isArray(old.documents) && old.documents.length) {
        // The visitor changed this sample (edited text or added a document). Keep their version until they reset the demo.
        base.contracts[id] = { ...fresh, ...old, reading: false, error: null };
        continue;
      }
      if (old.meta && old.meta.source === "live" && old.extraction && sameDocs(old.documents, fresh.documents)) {
        fresh.extraction = old.extraction;
        fresh.meta = old.meta;
        fresh.history = old.history || [];
      }
    }
    for (const id of saved.order || []) {
      if (!base.contracts[id] && saved.contracts[id]) {
        base.contracts[id] = { ...saved.contracts[id], reading: false, error: null };
        base.order.push(id);
      }
    }
    base.role = saved.role || base.role;
    base.ownerName = saved.ownerName || base.ownerName;
    base.clock = saved.clock || base.clock;
    base.guide = saved.guide || base.guide;
    base.testRuns = saved.testRuns || {};
    return base;
  } catch {
    return null;
  }
}

function sameDocs(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  return a.every((d, i) => d.id === b[i].id && d.text === b[i].text);
}

let state = load() || initialState();
const listeners = new Set();

function persist() {
  try {
    const slim = { ...state, health: null };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  } catch {
    // Storage can be unavailable or full. The app still works for this visit.
  }
}

function emit() {
  persist();
  for (const fn of listeners) fn(state);
}

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function set(mutator) {
  mutator(state);
  state = { ...state };
  emit();
}

// ---------- Clock ----------
export function today(s = state) {
  if (s.clock.pinned) return parseISO(s.clock.date) || parseISO(DEMO_TODAY);
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function setClock(dateIso) {
  if (!parseISO(dateIso)) return;
  set((s) => { s.clock = { pinned: true, date: dateIso }; });
  ensureQuestions();
}

export function useRealClock() {
  set((s) => { s.clock = { pinned: false, date: s.clock.date }; });
  ensureQuestions();
}

export function resetClock() {
  set((s) => { s.clock = { pinned: true, date: DEMO_TODAY }; });
}

// ---------- Roles ----------
export function setRole(role) {
  set((s) => { s.role = role; });
}

export function setOwnerName(name) {
  set((s) => { s.ownerName = name; s.role = "owner"; });
}

export function actorName(s = state) {
  return s.role === "owner" ? s.ownerName : PEOPLE.procurement.name;
}

// ---------- Views ----------
export function supplierFor(contract) {
  if (contract.custom) return contract.supplier;
  const base = supplierById(contract.supplierId) || {};
  return { ...base, currency: "INR" };
}

export function viewOf(id, s = state) {
  const contract = s.contracts[id];
  if (!contract) return null;
  const supplier = supplierFor(contract);
  const now = today(s);
  const brief = contract.extraction
    ? buildBrief({ extraction: contract.extraction, documents: contract.documents, record: contract.record, supplier, today: now })
    : null;
  const flow = brief ? workflowState({ brief, record: contract.record, supplier, people: PEOPLE, today: now }) : null;
  const band = brief ? priorityBand({ brief, flow, today: now }) : 1;
  return { contract, supplier, brief, flow, band, today: now };
}

export function allViews(s = state) {
  return s.order.map((id) => viewOf(id, s)).filter(Boolean);
}

export function owners() {
  const names = new Map();
  for (const sup of SUPPLIER_MASTER) if (!names.has(sup.owner)) names.set(sup.owner, sup.ownerTitle);
  for (const id of state.order) {
    const c = state.contracts[id];
    if (c.custom && c.supplier?.owner && !names.has(c.supplier.owner)) names.set(c.supplier.owner, "Budget owner");
  }
  return [...names.entries()].map(([name, title]) => ({ name, title }));
}

export function suppliersWithoutContract(s = state) {
  const have = new Set(s.order.map((id) => s.contracts[id].supplierId).filter(Boolean));
  return SUPPLIER_MASTER.filter((sup) => !have.has(sup.id));
}

export { PEOPLE, CUSTOMER, SUPPLIER_MASTER };

// ---------- Record keeping ----------
function log(contract, text, who) {
  contract.record.log = contract.record.log || [];
  contract.record.log.unshift({ on: toISO(today()), at: new Date().toISOString(), who: who || actorName(), text });
}

// A question exists from the moment the reading shows a date that only a person can supply.
function ensureQuestions() {
  let changed = false;
  for (const id of state.order) {
    const v = viewOf(id);
    if (!v || !v.brief) continue;
    const needs = v.brief.hard.length === 0 && v.brief.pending.some((b) => b.type === "needs_answer");
    if (needs && !v.contract.record.question) {
      v.contract.record.question = newQuestion(v.supplier.owner || "the budget owner", v.today);
      log(v.contract, `Question sent to ${v.contract.record.question.to}: ${v.brief.question.text}`, "System");
      changed = true;
    }
  }
  if (changed) {
    state = { ...state };
    emit();
  }
}

// ---------- Reading with the model ----------
export async function readContract(id, options = {}) {
  const contract = state.contracts[id];
  if (!contract || contract.reading) return;
  set((s) => { s.contracts[id] = { ...s.contracts[id], reading: true, error: null }; });
  try {
    const { result, meta } = await extract(state.contracts[id].documents, options);
    set((s) => {
      const c = { ...s.contracts[id] };
      if (c.extraction) c.history = [{ extraction: c.extraction, meta: c.meta, documents: c.previousDocuments || null }, ...(c.history || [])].slice(0, 4);
      c.extraction = result;
      c.meta = { ...meta, source: "live" };
      c.reading = false;
      c.error = null;
      c.previousDocuments = c.documents.map((d) => ({ ...d }));
      log(c, `Read live by ${meta.model} in ${(meta.ms / 1000).toFixed(1)} s.`, "System");
      s.contracts[id] = c;
    });
    ensureQuestions();
    return true;
  } catch (error) {
    set((s) => {
      s.contracts[id] = { ...s.contracts[id], reading: false, error: { code: error.code || "error", message: error.message || "The read failed.", detail: error.detail || "", retryAfter: error.retryAfter || 0 } };
    });
    return false;
  }
}

export function addContract({ documents, supplier }) {
  const id = `c${Date.now().toString(36)}`;
  set((s) => {
    s.contracts[id] = {
      id, supplierId: supplier.supplierId || null, custom: true,
      supplier: { name: supplier.name || "Your contract", short: supplier.short || supplier.name || "Your contract", category: supplier.category || "Other", annualValue: Number(supplier.annualValue) || 0, currency: supplier.currency || "INR", owner: supplier.owner || "You", ownerTitle: supplier.ownerTitle || "Budget owner", appliesTo: supplier.appliesTo || "" },
      documents: documents.map((d, i) => ({ id: `D${i + 1}`, name: d.name || `Document ${i + 1}`, text: d.text })),
      extraction: null, meta: null,
      record: { answers: {}, resolutions: { conflicts: {}, passages: {} }, log: [] },
      history: [], reading: false, error: null,
    };
    s.order = [id, ...s.order];
  });
  return id;
}

export function updateCustomSupplier(id, patch) {
  set((s) => {
    const c = s.contracts[id];
    if (!c || !c.custom) return;
    s.contracts[id] = { ...c, supplier: { ...c.supplier, ...patch } };
  });
}

export function updateDocumentText(id, docId, text) {
  set((s) => {
    const c = s.contracts[id];
    if (!c) return;
    s.contracts[id] = { ...c, edited: true, documents: c.documents.map((d) => (d.id === docId ? { ...d, text } : d)) };
    log(s.contracts[id], `Edited the text of ${c.documents.find((d) => d.id === docId)?.name || docId}.`);
  });
}

export function addDocument(id, { name, text }) {
  if (!text || !text.trim()) return;
  set((s) => {
    const c = s.contracts[id];
    if (!c) return;
    const next = c.documents.reduce((n, d) => Math.max(n, Number(String(d.id).replace(/\D/g, "")) || 0), 0) + 1;
    const label = (name || "").trim() || `Document ${next}`;
    s.contracts[id] = { ...c, edited: true, documents: [...c.documents, { id: `D${next}`, name: label, text }] };
    log(s.contracts[id], `Added a document to the family: ${label}.`);
  });
}

// One contract per separately renewing part: the main agreement plus that one order form or statement of work.
export function splitFamily(id) {
  const c = state.contracts[id];
  if (!c || c.documents.length < 2) return [];
  const supplier = supplierFor(c);
  const main = c.documents[0];
  const ids = [];
  set((s) => {
    const parts = c.documents.slice(1);
    parts.forEach((doc, i) => {
      const nid = `${id}p${i + 1}`;
      s.contracts[nid] = {
        id: nid, supplierId: c.supplierId || null, custom: true, splitFrom: id,
        supplier: { ...supplier, short: `${supplier.short || supplier.name}, ${doc.name}`, annualValue: 0, appliesTo: `Split from one family. The value of this part is not known yet: enter it below` },
        documents: [{ ...main, id: "D1" }, { ...doc, id: "D2" }],
        extraction: null, meta: null,
        record: { answers: {}, resolutions: { conflicts: {}, passages: {} }, log: [{ on: toISO(today()), at: new Date().toISOString(), who: actorName(), text: `Split from a family with ${parts.length} separately renewing parts.` }] },
        history: [], reading: false, error: null,
      };
      ids.push(nid);
    });
    const at = s.order.indexOf(id);
    s.order = [...s.order.slice(0, at + 1), ...ids, ...s.order.slice(at + 1)];
    if (c.custom) {
      delete s.contracts[id];
      s.order = s.order.filter((x) => x !== id);
    }
  });
  return ids;
}

// Reads every contract that has no reading yet, one at a time, waiting when the server asks for a pause.
let bulkRunning = false;
export async function readAllUnread() {
  if (bulkRunning) return;
  bulkRunning = true;
  try {
    for (const id of [...state.order]) {
      const c = state.contracts[id];
      if (!c || c.extraction) continue;
      let ok = await readContract(id);
      const err = state.contracts[id]?.error;
      if (!ok && err && ["rate_limited", "demo_rate_limit"].includes(err.code) && err.retryAfter > 0 && err.retryAfter <= 90) {
        await new Promise((r) => setTimeout(r, (err.retryAfter + 1) * 1000));
        ok = await readContract(id);
      }
      if (!ok && ["no_key", "key_rejected", "key_forbidden", "spend_limit", "no_credit", "spend_cap", "network"].includes(state.contracts[id]?.error?.code)) break;
    }
  } finally {
    bulkRunning = false;
  }
}

export function removeContract(id) {
  set((s) => {
    if (!s.contracts[id] || !s.contracts[id].custom) return;
    delete s.contracts[id];
    s.order = s.order.filter((x) => x !== id);
  });
}

// ---------- Owner actions ----------
export function acceptQuestion(id) {
  set((s) => {
    const c = s.contracts[id];
    c.record = { ...c.record, question: { ...c.record.question, state: "accepted", acceptedOn: toISO(today()) } };
    log(c, "Accepted the question.");
  });
}

export function declineQuestion(id, reason) {
  set((s) => {
    const c = s.contracts[id];
    c.record = { ...c.record, question: { ...c.record.question, state: "declined", declinedReason: reason || "", declinedOn: toISO(today()) } };
    log(c, `Declined the question${reason ? `: ${reason}` : ""}.`);
  });
}

export function reassignQuestion(id, ownerName) {
  set((s) => {
    const c = s.contracts[id];
    c.record = { ...c.record, ownerOverride: ownerName, question: newQuestion(ownerName, today()) };
    log(c, `Reassigned the question to ${ownerName}.`);
  });
}

export function answerQuestion(id, { value, evidenceNote }) {
  if (!parseISO(value)) return;
  set((s) => {
    const c = s.contracts[id];
    const by = actorName();
    c.record = {
      ...c.record,
      answers: { ...c.record.answers, term_start_date: { value, by, on: toISO(today()), evidenceNote: evidenceNote || "" } },
      question: { ...(c.record.question || {}), state: "answered", answeredOn: toISO(today()) },
    };
    log(c, `Answered: the term started on ${formatDate(parseISO(value))}${evidenceNote ? `. Evidence: ${evidenceNote}` : ". No evidence attached"}.`);
  });
}

export function recordDecision(id, { choice, reason, secondsOpen }) {
  const v = viewOf(id);
  const basis = v && v.brief ? decisionBasis(v.brief) : null;
  set((s) => {
    const c = s.contracts[id];
    const previous = c.record.decision ? [c.record.decision, ...(c.record.previousDecisions || [])].slice(0, 5) : c.record.previousDecisions || [];
    const record = { ...c.record, decision: { choice, reason: reason || "", by: actorName(), on: toISO(today()), secondsOpen: secondsOpen || 0, basis }, previousDecisions: previous };
    // A notice or extension recorded for an earlier decision no longer applies to a new one.
    if (c.record.decision && c.record.decision.choice !== choice) delete record.notice;
    c.record = record;
    log(c, `Decided to ${choice}${reason ? `: ${reason}` : ""}.`);
  });
}

export function clearDecision(id) {
  set((s) => {
    const c = s.contracts[id];
    const record = { ...c.record };
    delete record.decision;
    delete record.notice;
    c.record = record;
    log(c, "Reopened the decision.");
  });
}

// ---------- Procurement actions ----------
export function confirmAnswer(id, checkedAgainst) {
  set((s) => {
    const c = s.contracts[id];
    const answer = c.record.answers.term_start_date;
    if (!answer) return;
    c.record = { ...c.record, answers: { ...c.record.answers, term_start_date: { ...answer, procurement: "confirmed", checkedBy: actorName(), checkedOn: toISO(today()), checkedAgainst: checkedAgainst || "" } } };
    log(c, `Confirmed the owner's answer. Checked against: ${checkedAgainst || "not recorded"}.`);
  });
}

export function returnAnswer(id, note) {
  set((s) => {
    const c = s.contracts[id];
    const answers = { ...c.record.answers };
    delete answers.term_start_date;
    const to = c.record.question?.to || supplierFor(c).owner;
    c.record = { ...c.record, answers, question: { ...newQuestion(to, today()), note: note || "" } };
    log(c, `Sent the answer back to ${to}${note ? `: ${note}` : ""}.`);
  });
}

export function resolveConflict(id, field, side, { reason = "", legal = false } = {}) {
  set((s) => {
    const c = s.contracts[id];
    const conflicts = { ...(c.record.resolutions?.conflicts || {}) };
    if (side) conflicts[field] = { side, reason, legal, by: actorName(), on: toISO(today()) };
    else delete conflicts[field];
    c.record = { ...c.record, resolutions: { ...(c.record.resolutions || {}), conflicts } };
    log(c, side ? `Chose reading ${side.toUpperCase()} for ${field.replace(/_/g, " ")}${reason ? `: ${reason}` : ""}${legal ? ". Legal approval recorded" : ""}.` : `Reopened the conflict on ${field.replace(/_/g, " ")}.`);
  });
}

export function escalateToLegal(id, field) {
  set((s) => {
    const c = s.contracts[id];
    c.record = { ...c.record, legal: { ...(c.record.legal || {}), [field]: { on: toISO(today()), by: actorName() } } };
    log(c, `Escalated ${field.replace(/_/g, " ")} to ${PEOPLE.legal.name}.`);
  });
}

export function setPassageCheck(id, field, value) {
  set((s) => {
    const c = s.contracts[id];
    const passages = { ...(c.record.resolutions?.passages || {}) };
    if (value) passages[field] = value;
    else delete passages[field];
    c.record = { ...c.record, resolutions: { ...(c.record.resolutions || {}), passages } };
    log(c, value === "confirmed" ? `Read the document and confirmed the reading for ${field.replace(/_/g, " ")}.` : `Rejected the reading for ${field.replace(/_/g, " ")}.`);
  });
}

export function markNoticeSent(id, { sentOn, proof, method, deliveredOn, kind }) {
  if (!parseISO(sentOn)) return;
  set((s) => {
    const c = s.contracts[id];
    const history = c.record.notice ? [c.record.notice, ...(c.record.noticeHistory || [])].slice(0, 5) : c.record.noticeHistory || [];
    c.record = { ...c.record, notice: { sentOn, proof: proof || "", method: method || "", deliveredOn: deliveredOn || "", kind: kind || "", by: actorName() }, noticeHistory: history };
    log(c, kind === "extension"
      ? `Recorded a signed extension, signed ${formatDate(parseISO(sentOn))}${proof ? `. Reference: ${proof}` : ""}.`
      : `Recorded what was sent: notice on ${formatDate(parseISO(sentOn))}${method ? ` by ${method.toLowerCase()}` : ""}${deliveredOn ? `, delivered ${formatDate(parseISO(deliveredOn))}` : ""}${proof ? `. Proof: ${proof}` : ""}.`);
  });
}

// ---------- Guide, tests, health, reset ----------
export function setGuide(patch) {
  set((s) => { s.guide = { ...s.guide, ...patch }; });
}

export function markGuideDone(step) {
  if (state.guide.done[step]) return;
  set((s) => { s.guide = { ...s.guide, done: { ...s.guide.done, [step]: true } }; });
}

export function saveTestRun(caseId, run) {
  set((s) => { s.testRuns = { ...s.testRuns, [caseId]: [run, ...(s.testRuns[caseId] || [])].slice(0, 5) }; });
}

export function setHealth(health) {
  state = { ...state, health };
  for (const fn of listeners) fn(state);
}

export function resetDemo() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  state = initialState();
  emit();
  ensureQuestions();
}

ensureQuestions();
