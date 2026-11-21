import { html, useState, useEffect, useRef } from "../../vendor/htm-preact.js";
import { getState, subscribe } from "../store.js";
import { formatDate, daysBetween } from "../core/dates.js";
import { STATUS_LABEL } from "../core/rules.js";
import { isVerified } from "../core/verify.js";

export { html, useState, useEffect, useRef };

export function useStore() {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);
  return getState();
}

export function go(hash) {
  window.location.hash = hash;
}

export function fdate(date, weekday = false) {
  return date ? formatDate(date, { weekday }) : "";
}

export function daysText(from, to) {
  if (!from || !to) return "";
  const n = daysBetween(from, to);
  if (n === 0) return "today";
  if (n > 0) return `in ${n} day${n === 1 ? "" : "s"}`;
  return `${-n} day${n === -1 ? "" : "s"} ago`;
}

const STATUS_TONE = {
  confirmed: "good", owner_confirmed: "good", procurement_confirmed: "good",
  needs_answer: "warn", awaiting_confirmation: "warn",
  conflict: "bad", unverified: "bad", not_found: "neutral", not_applicable: "neutral",
};

export function Stamp({ status }) {
  return html`<span class=${`stamp ${STATUS_TONE[status] || "neutral"}`}>${STATUS_LABEL[status] || status}</span>`;
}

export function Tone({ tone = "neutral", children }) {
  return html`<span class=${`stamp ${tone}`}>${children}</span>`;
}

// ---------- Document viewer (one shared drawer) ----------
let viewer = null;
const viewerListeners = new Set();
export function openDoc(payload) {
  viewer = payload;
  viewerListeners.forEach((fn) => fn(viewer));
}
export function closeDoc() {
  viewer = null;
  viewerListeners.forEach((fn) => fn(viewer));
}

export function DocDrawer() {
  const [current, setCurrent] = useState(viewer);
  const markRef = useRef(null);
  useEffect(() => {
    viewerListeners.add(setCurrent);
    return () => viewerListeners.delete(setCurrent);
  }, []);
  useEffect(() => {
    if (current && markRef.current) markRef.current.scrollIntoView({ block: "center" });
    const onKey = (e) => { if (e.key === "Escape") closeDoc(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current]);
  if (!current) return null;
  const { name, text, start, end } = current;
  const has = start >= 0 && end > start;
  return html`
    <div class="veil" onClick=${(e) => { if (e.target === e.currentTarget) closeDoc(); }}>
      <aside class="drawer" role="dialog" aria-label=${`Document: ${name}`}>
        <div class="drawer-head">
          <div>
            <div class="h3">${name}</div>
            <div class="small muted">${text.length.toLocaleString("en-IN")} characters. ${has ? "The highlighted passage is the one the model relied on." : "Full text as uploaded."}</div>
          </div>
          <button class="btn ghost small" onClick=${closeDoc}>Close</button>
        </div>
        <div class="drawer-body">
          ${has
            ? html`${text.slice(0, start)}<mark class="hi" ref=${markRef}>${text.slice(start, end)}</mark>${text.slice(end)}`
            : text}
        </div>
      </aside>
    </div>`;
}

// ---------- A quoted passage with its proof status ----------
export function Passage({ evidence, documents, compact = false }) {
  if (!evidence || !evidence.quote) return null;
  const ok = isVerified(evidence);
  const doc = (documents || []).find((d) => d.id === evidence.docId);
  const open = () => doc && openDoc({ name: doc.name, text: doc.text, start: ok ? evidence.start : -1, end: ok ? evidence.end : -1 });
  return html`
    <div>
      <blockquote class=${`passage ${ok ? "" : "unverified"}`}>
        ${ok ? html`<mark>${evidence.quote}</mark>` : html`<span class="q">${evidence.quote}</span>`}
      </blockquote>
      ${!compact && html`<div class="passage-meta">
        ${ok
          ? html`Found in ${doc ? html`<button class="linkbtn" onClick=${open}>${doc.name}</button>` : "the document"}${evidence.level === "relaxed" ? " (matched ignoring punctuation)" : ""}${evidence.movedFromNamedDoc ? ". The model named a different document; code found it here." : ""}`
          : html`<span style="color:var(--bad);font-weight:600">Not found in the uploaded text.</span> Code could not match this passage, so it is not treated as proof.${doc ? html` <button class="linkbtn" onClick=${open}>Open ${doc.name}</button>` : ""}`}
      </div>`}
    </div>`;
}

// ---------- The runway to the point of no return ----------
export function Runway({ dates, today, provisional = false, hasNotice = true }) {
  if (!dates || !dates.termEnd) return null;
  const end = dates.renewsOn || dates.termEnd;
  const points = [today, dates.decideBy, dates.sendBy, dates.cancelBy, end].filter(Boolean).map((d) => d.getTime());
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(max - min, 86400000);
  const pad = span * 0.04;
  const lo = min - pad;
  const hi = max + pad;
  const pos = (d) => `${(((d.getTime() - lo) / (hi - lo)) * 100).toFixed(2)}%`;
  const width = (a, b) => `${(((b.getTime() - a.getTime()) / (hi - lo)) * 100).toFixed(2)}%`;
  const segs = [];
  if (hasNotice && dates.cancelBy) {
    const first = new Date(lo);
    if (dates.decideBy && dates.decideBy.getTime() > lo) segs.push(["", first, dates.decideBy]);
    if (dates.decideBy && dates.cancelBy > dates.decideBy) segs.push(["margin", dates.decideBy.getTime() > lo ? dates.decideBy : first, dates.cancelBy]);
    if (end > dates.cancelBy) segs.push(["closed", dates.cancelBy, end]);
  } else {
    segs.push(["", new Date(lo), end]);
  }
  const todayAt = (today.getTime() - lo) / (hi - lo);
  return html`
    <div class=${`runway ${provisional ? "prov" : ""}`} aria-hidden="true">
      <div class="runway-track">
        <div class="runway-line"></div>
        ${segs.map(([cls, a, b]) => html`<div class=${`runway-fill ${cls}`} style=${`left:${pos(a)};width:${width(a, b)}`}></div>`)}
        ${[dates.decideBy, dates.sendBy, dates.cancelBy, end].filter(Boolean).map((d) => html`<div class="runway-tick" style=${`left:${pos(d)}`}></div>`)}
        <div class="runway-tick today" style=${`left:${pos(today)}`}></div>
        <div class=${`runway-lab today ${todayAt < 0.12 ? "l" : todayAt > 0.88 ? "r" : ""}`} style=${`left:${pos(today)}`}>Today, ${fdate(today)}</div>
      </div>
      ${hasNotice && dates.cancelBy && html`<div class="small muted" style="margin-top:2px">
        <span style="color:var(--good);font-weight:650">Green</span> is time to decide.
        ${" "}<span style="color:var(--warn);font-weight:650">Amber</span> is time to send notice.
        ${" "}<span style="color:var(--bad);font-weight:650">Red</span> is after the last notice date.
      </div>`}
    </div>`;
}

export function Spinner({ label }) {
  return html`<span><span class="spinner" role="status" aria-label="Working"></span> ${label}</span>`;
}

export function Field({ label, children, hint }) {
  return html`<label class="field"><span>${label}</span>${children}${hint && html`<div class="small muted" style="margin-top:3px">${hint}</div>`}</label>`;
}

export function copyText(text) {
  try {
    navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
