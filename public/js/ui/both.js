import { html, useState, useStore, useEffect, useRef } from "./common.js";
import { resetDemo, setClock, allViews, PEOPLE } from "../store.js";
import { Icon, Avatar } from "./icons.js";
import { formatDate, parseISO } from "../core/dates.js";

// Two people, one record. Each frame is the real app, fixed to one role, and both read the same saved record,
// so an action on one side shows on the other at once. Nothing here is a mock-up.

// ---------- Helpers that act inside a frame as a person would: fill a field or point at a button, never submit ----------
function fieldByLabel(doc, label) {
  const span = [...doc.querySelectorAll(".field span, .field-l span")].find((s) => s.textContent.trim().startsWith(label));
  return span ? span.parentElement.querySelector("input, select, textarea") : null;
}
function buttonByText(doc, text) {
  return [...doc.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith(text)) || null;
}
function setValue(win, el, value) {
  if (!el) return false;
  const proto = el.tagName === "SELECT" ? win.HTMLSelectElement.prototype : win.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
  el.dispatchEvent(new win.Event("input", { bubbles: true }));
  el.dispatchEvent(new win.Event("change", { bubbles: true }));
  return true;
}
function pointAt(el) {
  if (!el) return false;
  // Scroll only inside the frame, so the page around it stays put.
  const win = el.ownerDocument.defaultView;
  const top = el.getBoundingClientRect().top + win.scrollY - win.innerHeight / 2 + el.offsetHeight / 2;
  win.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  try { el.focus({ preventScroll: true }); } catch { /* not focusable */ }
  el.classList.remove("demo-point");
  void el.offsetWidth;
  el.classList.add("demo-point");
  setTimeout(() => el.classList.remove("demo-point"), 2600);
  return true;
}

const FLOWS = [
  {
    key: "kestrelway",
    n: 1,
    name: "Kestrelway",
    sub: "Missing start date, odd answer checked",
    contract: "kestrelway",
    owner: "Meera Nair",
    ownerTitle: "Head of Fulfilment",
    intro: "Kestrelway's term runs from the first delivery, and no document gives that date. Only the budget owner knows it.",
    steps: [
      {
        who: "Meera, budget owner", text: "Answers when deliveries began: 3 Feb 2025, with what she checked.",
        done: (v) => Boolean(v.contract.record.answers?.term_start_date),
        fill: { label: "Fill in the sample answer", side: "owner", run: ({ owner }) => {
          const a = setValue(owner.win, fieldByLabel(owner.doc, "Date"), "2025-02-03");
          const b = setValue(owner.win, fieldByLabel(owner.doc, "How do you know?"), "First delivery manifest, dated 3 Feb 2025");
          return a && b && pointAt(buttonByText(owner.doc, "Send answer"));
        } },
      },
      {
        who: "Priya, procurement", text: "Sees the answer arrive. It is before signing, so she says what she checked it against and confirms it.",
        done: (v) => v.contract.record.answers?.term_start_date?.procurement === "confirmed",
        fill: { label: "Fill in what she checked", side: "procurement", run: ({ procurement: p }) =>
          setValue(p.win, fieldByLabel(p.doc, "What did you check it against?"), "First invoice, dated 28 Feb 2025, covering deliveries from 3 Feb") && pointAt(buttonByText(p.doc, "Confirm the answer")) },
      },
      {
        who: "Priya, procurement", text: "The real deadline was 4 Nov 2026, already gone. She records for Finance what silence has now committed.",
        done: (v) => Boolean(v.contract.record.missed),
        fill: { label: "Show me where", side: "procurement", run: ({ procurement: p }) => pointAt(buttonByText(p.doc, "Record for Finance")) },
      },
      {
        who: "Meera, budget owner", text: "Her inbox shows the outcome under Your other suppliers. Nothing is left for her to do.",
        done: (v) => Boolean(v.contract.record.missed),
        fill: { label: "Show me where", side: "owner", run: ({ owner }) => pointAt(owner.doc.querySelector(".mini")) },
      },
    ],
  },
  {
    key: "brightdesk",
    n: 2,
    name: "Brightdesk",
    sub: "Decision, notice method check, missed window",
    contract: "brightdesk",
    owner: "Arjun Mehta",
    ownerTitle: "IT Lead",
    intro: "Brightdesk renews by itself unless notice arrives by 16 Dec 2026. The owner decides; procurement sends the notice and records it.",
    steps: [
      {
        who: "Arjun, budget owner", text: "Chooses Renew, Renegotiate or Exit, with one line of why.",
        done: (v) => Boolean(v.contract.record.decision),
        fill: { label: "Fill in a sample decision", side: "owner", run: ({ owner }) => {
          const exit = owner.doc.querySelector(".choice.c-exit");
          if (!exit) return false;
          exit.click();
          return setValue(owner.win, fieldByLabel(owner.doc, "Why, in one line"), "Moving to the group-wide helpdesk from April 2027") && pointAt(buttonByText(owner.doc, "Record decision"));
        } },
      },
      {
        who: "Priya, procurement", text: "Her brief moves to Notice: a packet drafted from confirmed facts, ready for a person to send.",
        done: (v) => Boolean(v.contract.record.decision),
        fill: { label: "Show me where", side: "procurement", run: ({ procurement: p }) => pointAt(p.doc.querySelector(".packet")) },
      },
      {
        who: "Priya, procurement", text: "Records how it was sent. Try courier first: the contract allows registered post only, so the work stays open.",
        done: (v) => Boolean(v.contract.record.notice),
        fill: { label: "Fill in a courier notice", side: "procurement", run: ({ procurement: p }) =>
          setValue(p.win, fieldByLabel(p.doc, "Sent by"), "Courier") && setValue(p.win, fieldByLabel(p.doc, "Proof of sending"), "Courier receipt BLR-55120") && pointAt(buttonByText(p.doc, "Record what was sent")) },
      },
      {
        who: "Arjun, budget owner", text: "Sees the notice status change in his inbox, without asking anyone.",
        done: (v) => Boolean(v.contract.record.notice),
        fill: { label: "Show me where", side: "owner", run: ({ owner }) => pointAt([...owner.doc.querySelectorAll(".mini")].find((m) => /Brightdesk/.test(m.textContent)) || owner.doc.querySelector(".mini")) },
      },
    ],
    skip: { date: "2026-12-17", label: "Skip to 17 Dec 2026, no notice sent", note: "The day after the deadline. The window closes, the item escalates to the head of procurement, and both sides see it." },
  },
];

function frameUrl(view, flow) {
  const base = `${window.location.pathname}?as=${view}${view === "owner" ? `&name=${encodeURIComponent(flow.owner)}` : ""}`;
  return `${base}#/${view === "owner" ? "owner" : `c/${flow.contract}`}`;
}

function Arrow({ dir }) {
  return html`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" class="sync-arrow"><path d=${dir === "left" ? "M13 8H3M7 4L3 8l4 4" : "M3 8h10M9 4l4 4-4 4"} fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>`;
}

function PaneHead({ name, role, pulse }) {
  return html`
    <div class=${`both-head ${pulse ? "pulse" : ""}`}>
      <${Avatar} name=${name} />
      <div class="both-who"><b>${name}</b><span>${role}</span></div>
      <span class="both-live"><i></i>${pulse ? "Updated" : "Live"}</span>
    </div>`;
}

export function BothSides() {
  const state = useStore();
  const [key, setKey] = useState("kestrelway");
  const [nonce, setNonce] = useState(0);
  const [guideOpen, setGuideOpen] = useState(true);
  const [sync, setSync] = useState(null);
  const [miss, setMiss] = useState("");
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const seen = useRef({ key: "", nonce: -1, top: "" });
  const timers = useRef([]);
  const flow = FLOWS.find((f) => f.key === key);
  const v = allViews(state).find((x) => x.contract.id === flow.contract);
  const log = v?.contract.record.log || [];
  const states = flow.steps.map((st) => (v ? st.done(v) : false));
  const next = states.indexOf(false);

  const flash = (s) => {
    timers.current.forEach(clearTimeout);
    setSync({ ...s, at: Date.now() });
    timers.current = [
      setTimeout(() => setSync((x) => (x ? { ...x, ring: false } : x)), 1500),
      setTimeout(() => setSync(null), 4500),
    ];
  };

  // A new entry on the shared record came from one person; the other person's pane is the one that just changed.
  // Compared by the newest entry's time, not the count, so a record reset elsewhere cannot hide or fake a sync.
  const top = log[0];
  useEffect(() => {
    const prev = seen.current;
    const fresh = top && top.at !== prev.top && top.who !== "System";
    if (prev.key === key && prev.nonce === nonce && fresh && (!prev.top || top.at > prev.top)) {
      const fromProcurement = top.who === PEOPLE.procurement.name;
      flash({
        to: fromProcurement ? "owner" : "procurement",
        ring: true,
        text: fromProcurement ? `Synced to ${flow.owner.split(" ")[0]}'s inbox` : `Synced to ${PEOPLE.procurement.name.split(" ")[0]}'s view`,
      });
    }
    seen.current = { key, nonce, top: top?.at || "" };
  }, [top?.at, key, nonce]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const restart = () => { resetDemo(); setSync(null); setMiss(""); setNonce((n) => n + 1); };
  const choose = (k) => { if (k === key) return; setKey(k); setSync(null); setMiss(""); setNonce((n) => n + 1); };
  const skip = () => {
    setClock(flow.skip.date);
    flash({ to: "both", ring: true, text: `Both views moved to ${formatDate(parseISO(flow.skip.date))}` });
  };
  const fill = (step) => {
    const frames = {
      procurement: { win: leftRef.current?.contentWindow, doc: leftRef.current?.contentDocument },
      owner: { win: rightRef.current?.contentWindow, doc: rightRef.current?.contentDocument },
    };
    let ok = false;
    try { ok = Boolean(step.fill.run(frames)); } catch { ok = false; }
    setMiss(ok ? "" : "That part is not on screen yet. Finish the step before, or scroll that side back to the top.");
  };

  const ringOn = (side) => Boolean(sync?.ring && (sync.to === side || sync.to === "both"));

  return html`
    <div class="both">
      <header class="both-top">
        <a class="both-back" href="#/"><${Icon} name="back" size=${16} /> Back to the prototype</a>
        <div class="both-title">Both sides, live <span>One record, two people. Act on either side and watch the other.</span></div>
      </header>
      <div class="both-switch" role="tablist" aria-label="Choose a story">
        ${FLOWS.map((f) => html`
          <button role="tab" aria-selected=${f.key === key} class=${`flowseg ${f.key === key ? "on" : ""}`} onClick=${() => choose(f.key)}>
            <span class="flowseg-n">${f.n}</span>
            <span class="flowseg-t"><b>${f.name}</b><em>${f.sub}</em></span>
          </button>`)}
      </div>
      <div class=${`both-grid ${guideOpen ? "" : "guide-closed"}`}>
        <section class="both-pane">
          <${PaneHead} name=${PEOPLE.procurement.name} role=${`Procurement, ${PEOPLE.procurement.title}`} pulse=${ringOn("procurement")} />
          <div class="both-frame">
            <iframe ref=${leftRef} key=${`p-${key}-${nonce}`} title=${`Procurement view of ${flow.name}`} src=${frameUrl("procurement", flow)}></iframe>
            ${ringOn("procurement") && html`<span class="pane-ring" key=${sync.at} aria-hidden="true"></span>`}
          </div>
        </section>

        ${guideOpen
          ? html`
            <aside class="both-guide" aria-label="Guide">
              <div class="both-guide-head">
                <span class="h3">Try it</span>
                <button class="linkbtn small" onClick=${() => setGuideOpen(false)}>Hide guide</button>
              </div>
              <div class="sync-slot" role="status" aria-live="polite">
                ${sync && html`
                  <div class=${`sync-pill to-${sync.to}`} key=${sync.at}>
                    ${sync.to === "procurement" && html`<${Arrow} dir="left" />`}
                    <span>${sync.text}</span>
                    ${sync.to === "owner" && html`<${Arrow} dir="right" />`}
                  </div>`}
              </div>
              <p class="small">${flow.intro}</p>
              <ol class="both-steps">
                ${flow.steps.map((st, i) => html`
                  <li class=${states[i] ? "done" : i === next ? "now" : ""}>
                    <span class="both-n">${states[i] ? html`<svg width="12" height="12" viewBox="0 0 12 12" aria-label="done"><path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>` : i + 1}</span>
                    <div>
                      <b>${st.who}.</b> ${st.text}
                      ${i === next && st.fill && html`
                        <div class="both-fill-row">
                          <button class="both-fill" onClick=${() => fill(st)}>${st.fill.label}</button>
                          <span class="small muted">${st.fill.side === "owner" ? "On the right" : "On the left"}${/^Fill/.test(st.fill.label) ? ". You still press the button." : ""}</span>
                        </div>
                        ${miss && html`<div class="small" style="color:var(--warn);margin-top:4px">${miss}</div>`}`}
                    </div>
                  </li>`)}
              </ol>
              ${next === -1 && html`<p class="small" style="color:var(--good);font-weight:600">Done. Every step above was saved once, on one record, and shown to both people.</p>`}
              ${log.length > 0 && html`
                <div class="both-record">
                  <div class="both-record-h">The shared record</div>
                  ${log.slice(0, 3).map((e, i) => html`
                    <div class=${`rec ${i === 0 && sync ? "fresh" : ""}`} key=${`${e.at}-${i}`}>
                      <${Avatar} name=${e.who === "System" ? "The tool" : e.who} />
                      <div><b>${e.who === "System" ? "The tool" : e.who}</b><span>${e.text.length > 110 ? `${e.text.slice(0, 108)}...` : e.text}</span></div>
                    </div>`)}
                </div>`}
              ${flow.skip && html`
                <div class="both-skip">
                  <button class="btn ghost small" onClick=${skip}>${flow.skip.label}</button>
                  <p class="small muted">${flow.skip.note}</p>
                </div>`}
              <button class="btn ghost small" onClick=${restart}>Start again</button>
              <p class="small muted">Both frames are the working app, fixed to one person each. Email is simulated, so the handoff shows here instead.</p>
            </aside>`
          : html`
            <aside class="both-rail">
              <button class="both-rail-btn" onClick=${() => setGuideOpen(true)} aria-label="Show the guide">
                <span class="q">?</span><span class="v">Guide</span>
              </button>
              ${sync && html`<span class=${`rail-dot to-${sync.to}`} title=${sync.text}></span>`}
            </aside>`}

        <section class="both-pane">
          <${PaneHead} name=${flow.owner} role=${`Budget owner, ${flow.ownerTitle}`} pulse=${ringOn("owner")} />
          <div class="both-frame">
            <iframe ref=${rightRef} key=${`o-${key}-${nonce}`} title=${`${flow.owner}'s inbox`} src=${frameUrl("owner", flow)}></iframe>
            ${ringOn("owner") && html`<span class="pane-ring" key=${sync.at} aria-hidden="true"></span>`}
          </div>
        </section>
      </div>
    </div>`;
}
