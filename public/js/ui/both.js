import { html, useState, useStore } from "./common.js";
import { resetDemo, setClock, allViews, PEOPLE } from "../store.js";
import { Icon } from "./icons.js";

// Two people, one record. Each frame is the real app, fixed to one role, and both read the same saved record,
// so an action on one side shows on the other at once. Nothing here is a mock-up.
const FLOWS = [
  {
    key: "kestrelway",
    tab: "A date only the owner knows",
    contract: "kestrelway",
    owner: "Meera Nair",
    ownerTitle: "Head of Fulfilment",
    intro: "Kestrelway's term runs from the first delivery, and no document gives that date. Only the budget owner knows it.",
    steps: [
      { who: "Meera, budget owner", text: "Answers when deliveries began: 3 Feb 2025, with what she checked.", done: (v) => Boolean(v.contract.record.answers?.term_start_date) },
      { who: "Priya, procurement", text: "Sees the answer arrive. It is before signing, so she says what she checked it against and confirms it.", done: (v) => v.contract.record.answers?.term_start_date?.procurement === "confirmed" },
      { who: "Priya, procurement", text: "The real deadline was 4 Nov 2026, already gone. She records for Finance what silence has now committed.", done: (v) => Boolean(v.contract.record.missed) },
      { who: "Meera, budget owner", text: "Her inbox shows the outcome under Your other suppliers. Nothing is left for her to do.", done: (v) => Boolean(v.contract.record.missed) },
    ],
  },
  {
    key: "brightdesk",
    tab: "The owner decides, procurement sends",
    contract: "brightdesk",
    owner: "Arjun Mehta",
    ownerTitle: "IT Lead",
    intro: "Brightdesk renews by itself unless notice arrives by 16 Dec 2026. The owner decides; procurement sends the notice and records it.",
    steps: [
      { who: "Arjun, budget owner", text: "Chooses Renew, Renegotiate or Exit, with one line of why.", done: (v) => Boolean(v.contract.record.decision) },
      { who: "Priya, procurement", text: "Her brief moves to Notice: a packet drafted from confirmed facts, ready for a person to send.", done: (v) => Boolean(v.contract.record.decision) },
      { who: "Priya, procurement", text: "Records how it was sent. Try courier first: the contract allows registered post only, so the work stays open.", done: (v) => Boolean(v.contract.record.notice) },
      { who: "Arjun, budget owner", text: "Sees the notice status change in his inbox, without asking anyone.", done: (v) => Boolean(v.contract.record.notice) },
    ],
    skip: { date: "2026-12-17", label: "Skip to 17 Dec 2026, no notice sent", note: "The day after the deadline. The window closes, the item escalates to the head of procurement, and both sides see it." },
  },
];

function frameUrl(view, flow) {
  const base = `${window.location.pathname}?as=${view}${view === "owner" ? `&name=${encodeURIComponent(flow.owner)}` : ""}`;
  return `${base}#/${view === "owner" ? "owner" : `c/${flow.contract}`}`;
}

export function BothSides() {
  const state = useStore();
  const [key, setKey] = useState("kestrelway");
  const [nonce, setNonce] = useState(0);
  const flow = FLOWS.find((f) => f.key === key);
  const v = allViews(state).find((x) => x.contract.id === flow.contract);
  const states = flow.steps.map((st) => (v ? st.done(v) : false));
  const next = states.indexOf(false);
  const restart = () => { resetDemo(); setNonce((n) => n + 1); };
  const choose = (k) => { setKey(k); setNonce((n) => n + 1); };

  return html`
    <div class="both">
      <header class="both-top">
        <a class="both-back" href="#/"><${Icon} name="chevron" size=${16} /> Back to the prototype</a>
        <div class="both-title">Both sides, live: one record, two people</div>
        <div class="both-tabs" role="tablist">
          ${FLOWS.map((f) => html`<button role="tab" aria-selected=${f.key === key} class=${`both-tab ${f.key === key ? "on" : ""}`} onClick=${() => choose(f.key)}>${f.tab}</button>`)}
        </div>
      </header>
      <div class="both-grid">
        <section class="both-pane">
          <div class="both-label"><b>Procurement</b> ${PEOPLE.procurement.name}, ${PEOPLE.procurement.title}</div>
          <iframe key=${`p-${key}-${nonce}`} title=${`Procurement view of ${flow.contract}`} src=${frameUrl("procurement", flow)}></iframe>
        </section>
        <aside class="both-guide">
          <p class="small">${flow.intro}</p>
          <ol class="both-steps">
            ${flow.steps.map((st, i) => html`
              <li class=${states[i] ? "done" : i === next ? "now" : ""}>
                <span class="both-n">${states[i] ? html`<svg width="12" height="12" viewBox="0 0 12 12" aria-label="done"><path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>` : i + 1}</span>
                <div><b>${st.who}.</b> ${st.text}</div>
              </li>`)}
          </ol>
          ${next === -1 && html`<p class="small" style="color:var(--good);font-weight:600">Done. Every step above was saved once and shown to both people.</p>`}
          ${flow.skip && html`
            <div class="both-skip">
              <button class="btn ghost small" onClick=${() => setClock(flow.skip.date)}>${flow.skip.label}</button>
              <p class="small muted">${flow.skip.note}</p>
            </div>`}
          <button class="btn ghost small" onClick=${restart}>Start again</button>
          <p class="small muted">Both frames are the working app, fixed to one person each. Email is simulated, so the handoff appears here instead.</p>
        </aside>
        <section class="both-pane">
          <div class="both-label"><b>Budget owner</b> ${flow.owner}, ${flow.ownerTitle}</div>
          <iframe key=${`o-${key}-${nonce}`} title=${`${flow.owner}'s inbox`} src=${frameUrl("owner", flow)}></iframe>
        </section>
      </div>
    </div>`;
}
