import { html, useState, useRef, useStore, go, fdate, daysText, Tone, Passage } from "./common.js";
import { allViews, owners, setOwnerName, PEOPLE, answerQuestion, recordDecision, markGuideDone } from "../store.js";
import { formatMoney } from "../core/rules.js";
import { daysBetween } from "../core/dates.js";
import { Icon, Avatar } from "./icons.js";

// The budget owner's side of the same record: one card per thing only they can do, done right here.
// Email is simulated: each card is what the message would carry.
export function OwnerInbox() {
  const state = useStore();
  const me = state.ownerName;
  const list = owners();
  const views = allViews(state);
  const mine = views.filter((v) => {
    if (!v.flow) return false;
    const owner = v.contract.record.question?.to || v.contract.record.ownerOverride || v.supplier.owner;
    return owner === me;
  });
  const waiting = mine.filter((v) => v.flow.actorRole === "owner");
  const others = mine.filter((v) => v.flow.actorRole !== "owner");
  const meTitle = list.find((o) => o.name === me)?.title || "";

  return html`
    <div class="page page-narrow">
      <div class="owner-head">
        <${Avatar} name=${me} tone="lg" />
        <div>
          <h1 class="h1">${waiting.length === 0 ? "Nothing needs you" : waiting.length === 1 ? "One thing needs you" : `${waiting.length} things need you`}, ${me.split(" ")[0]}</h1>
          <p class="lede">You hold the budget. Procurement keeps the record. You are asked only for what the documents cannot say, and for the decision.</p>
        </div>
      </div>
      <div class="row small" style="margin-top:12px">
        <label class="muted" for="who">Acting as</label>
        <select id="who" class="select" style="max-width:320px" value=${me} onChange=${(e) => setOwnerName(e.target.value)}>
          ${list.map((o) => html`<option value=${o.name}>${o.name}, ${o.title}</option>`)}
        </select>
        <span class="muted">No login in this prototype, so you choose who you are.</span>
      </div>

      ${waiting.map((v) => (v.flow.stage === "question" ? html`<${QuestionCard} v=${v} me=${me} key=${v.contract.id} />` : html`<${DecisionCard} v=${v} me=${me} key=${v.contract.id} />`))}

      ${others.length > 0 && html`
        <h2 class="h2" style="margin-top:34px">Your other suppliers</h2>
        <div class="mini-list">
          ${others.map((v) => html`
            <a class="mini" href=${`#/c/${v.contract.id}`}>
              <span class="mini-name">${v.supplier.short || v.supplier.name}</span>
              <${Tone} tone=${v.flow.tone}>${v.flow.label}</${Tone}>
              <span class="mini-detail">${v.flow.detail}</span>
            </a>`)}
        </div>`}
    </div>`;
}

function CardHead({ v, kind }) {
  const { supplier, flow } = v;
  return html`
    <div class="ocard-head">
      <div>
        <div class="ocard-kind">${kind}</div>
        <h2 class="ocard-title">${supplier.short || supplier.name}</h2>
        <div class="small muted">${supplier.appliesTo}${supplier.annualValue ? `. ${formatMoney(supplier.annualValue, supplier.currency)} a year` : ""}</div>
      </div>
      <div class="ocard-due">
        ${flow.due && html`<span>Reply by</span><b>${fdate(flow.due)}</b>`}
        ${flow.overdue && html`<${Tone} tone="bad">Overdue, copied to ${flow.escalatedTo}</${Tone}>`}
      </div>
    </div>`;
}

function QuestionCard({ v, me }) {
  const { brief, contract } = v;
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [clause, setClause] = useState(false);
  return html`
    <section class="ocard">
      <${CardHead} v=${v} kind="One question" />
      <p class="ocard-q">${brief.question.text}</p>
      <p class="small muted">${brief.question.why}</p>
      <button class="linkbtn small" style="margin-top:6px" onClick=${() => setClause(!clause)} aria-expanded=${clause}>${clause ? "Hide the clause" : "Show the clause it comes from"}</button>
      ${clause && html`<${Passage} evidence=${brief.question.evidence} documents=${contract.documents} />`}
      <div class="ocard-form">
        <label class="field"><span>Date</span><input class="input" type="date" value=${value} onInput=${(e) => setValue(e.target.value)} /></label>
        <label class="field grow"><span>How do you know? (optional)</span><input class="input" value=${note} onInput=${(e) => setNote(e.target.value)} placeholder="For example: first delivery manifest" /></label>
        <button class="btn" disabled=${!value} onClick=${() => { answerQuestion(contract.id, { value, evidenceNote: note.trim() }); markGuideDone("answer"); }}>Send answer</button>
      </div>
      ${contract.id === "kestrelway" && html`<p class="small muted" style="margin-top:8px">For this demo, try 3 February 2025: deliveries began before the contract was signed.</p>`}
      <p class="small muted" style="margin-top:8px">Procurement checks any answer that looks odd before it counts. <a href=${`#/c/${contract.id}`}>Open the full record</a></p>
    </section>`;
}

function DecisionCard({ v, me }) {
  const { brief, contract, today } = v;
  const opened = useRef(Date.now());
  const [choice, setChoice] = useState("");
  const [reason, setReason] = useState("");
  const d = brief.dates;
  const auto = brief.mechanism === "automatic";
  const options = auto
    ? [["renew", "Renew", "Let it renew. Nothing is sent."], ["renegotiate", "Renegotiate", "Procurement sends notice now to keep leverage."], ["exit", "Exit", "Procurement sends notice and plans the handover."]]
    : brief.mechanism === "customer_must_give_notice_to_renew" || brief.mechanism === "one_time_extension_then_ends"
      ? [["renew", "Renew", "Procurement sends notice of renewal."], ["renegotiate", "Renegotiate", "Agree new terms first."], ["exit", "Exit", "Send nothing. Plan the handover."]]
      : [["renew", "Renew", "Agree a renewal in writing before it ends."], ["renegotiate", "Renegotiate", "Agree new terms before it ends."], ["exit", "Exit", "Let it end and plan the handover."]];
  const ok = choice && reason.trim().length >= 12;
  const left = d?.sendBy ? daysBetween(today, d.sendBy) : null;
  return html`
    <section class="ocard">
      <${CardHead} v=${v} kind="Your decision" />
      <div class="ocard-facts">
        ${d?.sendBy && html`<div><span>Notice must be sent by</span><b>${fdate(d.sendBy)}</b><em>${left >= 0 ? `${left} days left` : "Send today"}</em></div>`}
        ${!d?.sendBy && d?.termEnd && html`<div><span>It ends on</span><b>${fdate(d.termEnd)}</b><em>${daysText(today, d.termEnd)}</em></div>`}
        <div><span>If nobody acts</span><b>${brief.silence.amount ? formatMoney(brief.silence.amount) : "It ends"}</b><em>${brief.silence.text.replace(/^If nobody acts, /, "").replace(/^./, (c) => c.toUpperCase())}</em></div>
      </div>
      <div class="choice-row" role="radiogroup" aria-label="Decision">
        ${options.map(([key, label, effect]) => html`
          <button role="radio" aria-checked=${choice === key} class=${`choice ${choice === key ? "on" : ""} c-${key}`} onClick=${() => setChoice(key)}>
            <b>${label}</b><span>${effect}</span>
          </button>`)}
      </div>
      <div class="ocard-form">
        <label class="field grow"><span>Why, in one line</span><input class="input" value=${reason} onInput=${(e) => setReason(e.target.value)} placeholder="For example: on-time rate fell below 94% in three of the last six months" /></label>
        <button class="btn" disabled=${!ok} onClick=${() => { recordDecision(contract.id, { choice, reason: reason.trim(), secondsOpen: Math.round((Date.now() - opened.current) / 1000) }); markGuideDone("decide"); }}>Record decision</button>
      </div>
      <p class="small muted" style="margin-top:8px">One line of reasoning makes "renew" a choice, not a click. The tool never contacts the supplier: procurement sends any notice. <a href=${`#/c/${contract.id}`}>Read the full record first</a></p>
    </section>`;
}
