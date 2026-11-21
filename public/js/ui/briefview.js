import { html, useState, useEffect, useRef, useStore, go, fdate, daysText, Stamp, Tone, Passage, Runway, Spinner, Field, openDoc, copyText } from "./common.js";
import {
  viewOf, readContract, setRole, setOwnerName, acceptQuestion, declineQuestion, reassignQuestion, answerQuestion, recordDecision,
  clearDecision, confirmAnswer, returnAnswer, resolveConflict, escalateToLegal, setPassageCheck, markNoticeSent, owners, PEOPLE, CUSTOMER,
  updateDocumentText, updateCustomSupplier, removeContract, markGuideDone, addDocument,
} from "../store.js";
import { fileToText } from "../files.js";
import { TEXT_QUILLMARK_SOW } from "../../data/samples.js";
import { toISO, parseISO, formatDate, daysBetween, describeDuration } from "../core/dates.js";
import { formatMoney, MECHANISM_LABEL, CATEGORIES, LEAD_DAYS } from "../core/rules.js";
import { noticeNeededFor, noticeKindFor, CHOICE_LABEL } from "../core/workflow.js";
import { draftNotice, noticeChecklist } from "../core/notice.js";

const FIELD_LABEL = {
  term_start: "when the term starts", initial_term: "the length of the term", renewal_mechanism: "how it renews",
  renewal_term: "the renewal period", notice_period: "the notice period", notice_delivery: "how notice is sent",
  price_on_renewal: "price on renewal", exit_rights: "exit rights", other: "another term", signed_status: "signed copy",
};

export function BriefView({ id }) {
  const state = useStore();
  const v = viewOf(id, state);
  useEffect(() => { window.scrollTo(0, 0); }, [id]);
  if (!v) {
    return html`<div class="page page-narrow"><p>That contract is not in this browser's portfolio. <a href="#/">Back to the portfolio</a></p></div>`;
  }
  const { contract, supplier, brief, flow, today } = v;
  const documents = contract.documents;

  return html`
    <div class="page">
      <div class="crumbs"><a href="#/">Portfolio</a> / ${supplier.short || supplier.name}</div>
      <div class="spread">
        <div>
          <h1 class="h1">${supplier.name}</h1>
          <p class="lede">
            ${supplier.appliesTo ? `${supplier.appliesTo}. ` : ""}${supplier.category}. Budget owner: ${contract.record.ownerOverride || supplier.owner}${supplier.ownerTitle ? `, ${supplier.ownerTitle}` : ""}.
            ${supplier.annualValue ? ` ${formatMoney(supplier.annualValue, supplier.currency)} a year.` : ""}
          </p>
        </div>
        <${ReadStatus} contract=${contract} />
      </div>

      ${contract.reading && html`<div class="banner info" style="margin-top:14px"><${Spinner} label="Reading the documents with the live model. This usually takes 10 to 60 seconds." /></div>`}
      ${contract.error && html`<${ReadError} contract=${contract} />`}

      ${!brief && !contract.reading && html`
        <div class="panel" style="margin-top:18px">
          <h2 class="h2">Not read yet</h2>
          <p class="lede">The documents are loaded. Nothing has been read by the model.</p>
          <div style="margin-top:12px"><button class="btn" onClick=${() => readContract(id)}>Read with AI</button></div>
        </div>`}

      ${brief && html`
        <div class="brief-grid">
          <div>
            <${Slip} v=${v} role=${state.role} me=${state.ownerName} />
          </div>
          <div>
            ${brief.blockers.filter((b) => b.soft).map((b) => html`<div class="banner bad" style="margin-bottom:14px">${b.message}</div>`)}
            <${Facts} brief=${brief} documents=${documents} />
            <${Working} brief=${brief} supplier=${supplier} />
            ${brief.changes.length > 0 && html`<${Changes} brief=${brief} documents=${documents} />`}
            ${brief.missing.length > 0 && html`<${Missing} brief=${brief} documents=${documents} />`}
            <${Documents} contract=${contract} />
            ${contract.history && contract.history.length > 0 && html`<${WhatChanged} contract=${contract} supplier=${supplier} today=${today} current=${brief} />`}
            <${Activity} contract=${contract} />
          </div>
        </div>`}
    </div>`;
}

function ReadStatus({ contract }) {
  const meta = contract.meta;
  return html`
    <div class="small" style="text-align:right;max-width:340px">
      ${meta
        ? html`<div class="muted">
            ${meta.source === "live" ? "Read live" : "Saved reading"} by <b>${meta.model}</b>${meta.ran_at ? `, ${formatDate(parseISO(meta.ran_at.slice(0, 10)))}` : ""}${meta.ms ? `, ${(meta.ms / 1000).toFixed(1)} s` : ""}.
            ${meta.source !== "live" ? " Shown instantly so the page is not waiting on the model." : ""}
          </div>`
        : null}
      <div style="margin-top:6px">
        <button class="btn ghost small" disabled=${contract.reading} onClick=${() => readContract(contract.id)}>${contract.extraction ? "Read again live" : "Read with AI"}</button>
      </div>
    </div>`;
}

function ReadError({ contract }) {
  const e = contract.error;
  const wait = e.retryAfter ? ` Try again in about ${e.retryAfter} seconds.` : "";
  return html`
    <div class="banner bad" style="margin-top:14px">
      <b>The live read did not finish.</b> ${e.message}${wait}
      ${contract.extraction ? " The reading below is the last one that succeeded, and is labelled as such." : ""}
      ${e.detail && html`<details style="margin-top:6px"><summary>Technical detail</summary><div class="small" style="margin-top:4px;word-break:break-word">${e.code}: ${e.detail}</div></details>`}
    </div>`;
}

// ---------- The decision slip ----------
function Slip({ v, role, me }) {
  const { brief, flow, today, supplier, contract } = v;
  const d = brief.dates;
  const p = brief.provisional?.dates || null;
  const renewsBySilence = brief.mechanism === "automatic";
  const toRenew = brief.mechanism === "customer_must_give_notice_to_renew" || brief.mechanism === "one_time_extension_then_ends";
  let tone = "good";
  let question = renewsBySilence ? "Last safe date to say no" : toRenew ? "Last date to give notice to renew" : "Term ends";
  let big = null;
  let bigClass = "";
  let under = null;

  if (brief.outcome === "confirmed" && d) {
    if (d.expired) {
      tone = "bad";
      question = "The term in these documents has ended";
      big = fdate(d.termEnd, true);
      under = html`<${Tone} tone="bad">Ended ${daysText(today, d.termEnd)}</${Tone}>`;
    } else if (d.windowClosed) {
      tone = "bad";
      big = fdate(d.cancelBy, true);
      under = html`<${Tone} tone="bad">Window closed ${daysText(today, d.cancelBy)}</${Tone}>`;
    } else {
      const left = daysBetween(today, d.cancelBy);
      tone = left <= 30 ? "warn" : "good";
      big = fdate(d.cancelBy, true);
      under = html`<${Tone} tone="good">Confirmed</${Tone}> <span class="small muted">${daysText(today, d.cancelBy)}</span>`;
    }
  } else if (brief.outcome === "ends" && d) {
    tone = d.expired ? "bad" : "warn";
    question = "Ends on";
    big = fdate(d.termEnd, true);
    under = html`<${Tone} tone="info">No automatic renewal</${Tone}> <span class="small muted">${daysText(today, d.termEnd)}</span>`;
  } else if (brief.outcome === "provisional") {
    tone = "warn";
    question = "No confirmed date yet";
    big = p && (p.cancelBy || p.termEnd) ? fdate(p.cancelBy || p.termEnd, true) : "Date not known";
    bigClass = p ? "prov" : "none";
    under = html`<${Tone} tone="warn">${brief.pending[0].type === "awaiting_confirmation" ? "Answer needs a check" : "Needs one answer"}</${Tone}>`;
  } else if (brief.outcome === "no_deadline") {
    tone = "good";
    question = "Renewal";
    big = "No renewal date";
    bigClass = "none";
    under = html`<${Tone} tone="info">Runs until terminated</${Tone}>`;
  } else {
    tone = "bad";
    question = "No date can be confirmed";
    const first = brief.hard[0];
    big = first?.type === "inconsistent" ? "Reading contradicts itself" : first?.type === "unsigned" ? "Not a signed copy" : first?.type === "conflict" ? "Conflicting terms" : first?.type === "unverified" ? "Passage not verified" : first?.type === "legal" ? "Needs legal review" : "Not found in these documents";
    bigClass = "none";
  }

  const shown = d || p;
  return html`
    <div class=${`slip ${tone}`}>
      <div class="slip-q">${question}</div>
      <div class=${`bigdate ${bigClass}`}>${big}</div>
      <div>${under}</div>

      ${brief.outcome === "provisional" && brief.provisional && html`
        <p class="small" style="margin-top:8px;color:var(--warn)">Provisional, ${brief.provisional.basis}. Do not act on it.</p>`}
      ${brief.outcome === "provisional" && !brief.provisional && html`
        <p class="small muted" style="margin-top:8px">Not even a provisional date can be worked out from these documents.</p>`}
      ${brief.outcome === "blocked" && brief.alternatives.length > 0 && html`
        <div class="small" style="margin-top:10px">
          ${brief.alternatives.map((a) => html`<div style="margin-top:4px"><b>Reading ${a.side.toUpperCase()}:</b> ${a.dates?.cancelBy ? fdate(a.dates.cancelBy, true) : "no date"} <span class="muted">(${a.reading})</span></div>`)}
        </div>`}
      ${d && d.windowClosed && !d.expired && html`
        <p class="small" style="margin-top:8px">
          ${d.renewsOn ? html`It renews on <b>${fdate(d.renewsOn)}</b>.` : ""}
          ${d.nextCancelBy ? html` The next chance to say no is <b>${fdate(d.nextCancelBy)}</b>.` : ""}
        </p>`}

      ${shown && (shown.cancelBy || shown.termEnd) && brief.outcome !== "blocked" && html`
        <div class="dates">
          ${shown.decideBy && html`<div><span>${brief.outcome === "ends" ? "Start talks by" : "Decide by"} (house rule)</span><b>${fdate(shown.decideBy)}</b></div>`}
          ${shown.sendBy && html`<div><span>Send notice by</span><b>${fdate(shown.sendBy)}</b></div>`}
          ${shown.termEnd && html`<div><span>Current term ends</span><b>${fdate(shown.termEnd)}</b></div>`}
          ${shown.renewsOn && brief.mechanism === "automatic" && html`<div><span>Renews on</span><b>${fdate(shown.renewsOn)}</b></div>`}
        </div>
        <${Runway} dates=${shown} today=${today} provisional=${!d} hasNotice=${Boolean(shown.cancelBy)} />`}

      ${brief.silence.text && html`
        <div class="silence">
          ${brief.silence.amountText && html`<div class="amt">${brief.silence.amountText}</div>`}
          <div class="small">${brief.silence.text} ${brief.silence.upliftText ? `${cap(brief.silence.upliftText)}.` : ""}</div>
        </div>`}

      <div class="next">
        <div class="row" style="gap:8px"><span class="h3">Next step</span><${Tone} tone=${flow.tone}>${flow.label}</${Tone}></div>
        <p class="small" style="margin-top:6px;color:var(--ink-2)">${flow.detail}</p>
        <${Actions} v=${v} role=${role} me=${me} />
      </div>
    </div>`;
}

function cap(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

// ---------- What each role can do at each step ----------
function Actions({ v, role, me }) {
  const { flow, brief, contract, supplier, today } = v;
  const id = contract.id;
  const owner = contract.record.question?.to || contract.record.ownerOverride || supplier.owner;
  const asOwner = role === "owner" && me === owner;
  const whyNot = role === "owner" ? `You are viewing as ${me}. This one belongs to ${owner}.` : "You are viewing as procurement. Email is simulated in this prototype, so switch role to play the owner.";
  const switchToOwner = html`<button class="btn ghost small" onClick=${() => setOwnerName(owner)}>Switch to ${owner}'s view</button>`;
  const switchToProcurement = html`<button class="btn ghost small" onClick=${() => setRole("procurement")}>Switch to procurement's view</button>`;

  if (flow.stage === "question") {
    if (flow.actorRole === "procurement") {
      return role === "procurement" ? html`<${Reassign} id=${id} current=${owner} />` : html`<p class="small muted" style="margin-top:8px">Waiting for procurement to name the right owner.</p><div style="margin-top:8px">${switchToProcurement}</div>`;
    }
    if (asOwner) return html`<${QuestionForm} v=${v} />`;
    return html`
      <div class="stack" style="margin-top:10px">
        <div class="small muted">Only the owner can answer. ${whyNot}</div>
        <div>${switchToOwner}</div>
      </div>`;
  }

  if (flow.stage === "check_answer") {
    if (role !== "procurement") return html`<p class="small muted" style="margin-top:8px">Your answer is with procurement for a check.</p><div style="margin-top:8px">${switchToProcurement}</div>`;
    return html`<${CheckAnswer} v=${v} />`;
  }

  if (flow.stage === "blocked") {
    if (role !== "procurement") return html`<p class="small muted" style="margin-top:8px">Procurement has to settle this before a date reaches you.</p><div style="margin-top:8px">${switchToProcurement}</div>`;
    return html`<${Blockers} v=${v} />`;
  }

  if (flow.stage === "decision") {
    if (asOwner) return html`<${DecisionForm} v=${v} />`;
    return html`
      <div class="stack" style="margin-top:10px">
        <div class="small muted">The decision belongs to the budget owner. ${whyNot}</div>
        <div>${switchToOwner}</div>
      </div>`;
  }

  if (flow.stage === "notice") {
    if (role !== "procurement") return html`<p class="small muted" style="margin-top:8px">Your decision is recorded. Procurement prepares the notice and a person sends it.</p><div style="margin-top:8px">${switchToProcurement}</div>`;
    return html`<${NoticePanel} v=${v} />`;
  }

  if (flow.stage === "window_closed") {
    return html`
      <div class="small" style="margin-top:10px">
        What is still possible: ask the supplier in writing for a late exit or better terms before the renewal starts, and check the other exit rights listed on the right.
        ${brief.dates?.nextCancelBy ? ` Otherwise the next decision date is set from ${fdate(brief.dates.nextCancelBy)}.` : ""}
      </div>`;
  }

  if (flow.stage === "done" && contract.record.decision && role === "procurement") {
    return html`<div style="margin-top:10px"><button class="btn ghost small" onClick=${() => clearDecision(id)}>Reopen the decision</button></div>`;
  }
  return null;
}

function CheckAnswer({ v }) {
  const { brief, contract } = v;
  const id = contract.id;
  const a = contract.record.answers.term_start_date;
  const block = brief.pending.find((b) => b.type === "awaiting_confirmation");
  const p = brief.provisional?.dates;
  const [checked, setChecked] = useState("");
  return html`
    <div class="stack" style="margin-top:10px">
      <div class="small">${a.by} answered <b>${formatDate(parseISO(a.value))}</b>. ${block?.reasons?.join(" ")}</div>
      <div class="small">Evidence offered: ${a.evidenceNote ? html`<b>${a.evidenceNote}</b>` : html`<span style="color:var(--bad)">none</span>`}</div>
      ${p?.cancelBy && html`<div class="small">If the answer is right, the last notice date is <b>${fdate(p.cancelBy)}</b>${p.windowClosed ? html`, which has <b style="color:var(--bad)">already passed</b>` : ""}.</div>`}
      <${Field} label="What did you check it against? (required)" hint=${contract.id === "kestrelway" ? "Suggestion for this demo: First invoice, dated 28 Feb 2025, covering deliveries from 3 Feb." : "For example: first invoice, delivery report, supplier's commencement letter."}>
        <input class="input" value=${checked} onInput=${(e) => setChecked(e.target.value)} />
      </${Field}>
      <div class="row">
        <button class="btn small" disabled=${checked.trim().length < 5} onClick=${() => { confirmAnswer(id, checked.trim()); markGuideDone("check"); }}>Confirm the answer</button>
        <button class="btn ghost small" onClick=${() => returnAnswer(id, "Please attach the first delivery report or first invoice.")}>Send back to owner</button>
      </div>
    </div>`;
}

function QuestionForm({ v }) {
  const { brief, contract } = v;
  const id = contract.id;
  const q = contract.record.question || {};
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  return html`
    <div class="stack" style="margin-top:10px">
      <div class="small"><b>${brief.question.text}</b></div>
      <div class="small muted">${brief.question.why}</div>
      ${q.note && html`<div class="banner small">Procurement sent this back: ${q.note}</div>`}
      ${q.state === "sent" && html`<div class="row">
        <button class="btn ghost small" onClick=${() => acceptQuestion(id)}>Accept, I will answer</button>
        <button class="btn ghost small" onClick=${() => setDeclining(!declining)}>This is not mine</button>
      </div>`}
      ${declining && html`<div class="stack">
        <${Field} label="Who should get it, or why is it not yours?"><input class="input" value=${reason} onInput=${(e) => setReason(e.target.value)} placeholder="For example: fulfilment moved to Karan's team in June" /></${Field}>
        <div><button class="btn small" onClick=${() => declineQuestion(id, reason)}>Send back to procurement</button></div>
      </div>`}
      ${!declining && html`
        <${Field} label="Date" hint=${contract.id === "kestrelway" ? "Suggestion for this demo: try 3 February 2025. Deliveries began before the contract was signed." : ""}><input class="input" type="date" value=${value} onInput=${(e) => setValue(e.target.value)} /></${Field}>
        <${Field} label="What shows this? (optional)" hint="For example: first delivery report, first invoice, supplier's commencement notice."><input class="input" value=${note} onInput=${(e) => setNote(e.target.value)} /></${Field}>
        <div><button class="btn small" disabled=${!parseISO(value)} onClick=${() => { answerQuestion(id, { value, evidenceNote: note }); markGuideDone("answer"); }}>Submit answer</button></div>`}
    </div>`;
}

function Reassign({ id, current }) {
  const list = owners().filter((o) => o.name !== current);
  const [name, setName] = useState(list[0]?.name || "");
  return html`
    <div class="stack" style="margin-top:10px">
      <${Field} label="Send the question to">
        <select class="select" value=${name} onChange=${(e) => setName(e.target.value)}>${list.map((o) => html`<option value=${o.name}>${o.name}, ${o.title}</option>`)}</select>
      </${Field}>
      <div><button class="btn small" onClick=${() => reassignQuestion(id, name)}>Reassign</button></div>
    </div>`;
}

function Blockers({ v }) {
  const { brief, contract } = v;
  const id = contract.id;
  const documents = contract.documents;
  return html`
    <div class="stack" style="margin-top:10px">
      ${brief.hard.map((b) => {
        if (b.type === "conflict" && b.conflict) {
          const alts = brief.alternatives.filter((a) => a.field === b.field);
          const sent = contract.record.legal?.[b.field];
          return html`
            <div class="stack">
              <div class="small"><b>Two readings of ${FIELD_LABEL[b.field] || b.field}.</b> ${b.conflict.why_unresolved}</div>
              ${alts.map((a) => html`
                <div>
                  <div class="small"><b>Reading ${a.side.toUpperCase()}:</b> ${a.reading}. ${a.dates?.cancelBy ? html`Last notice date would be <b>${fdate(a.dates.cancelBy)}</b>.` : ""}</div>
                  <${Passage} evidence=${a.evidence} documents=${documents} />
                </div>`)}
              <div class="row">
                <button class="btn small" onClick=${() => { resolveConflict(id, b.field, "a"); markGuideDone("conflict"); }}>Reading A governs</button>
                <button class="btn small" onClick=${() => { resolveConflict(id, b.field, "b"); markGuideDone("conflict"); }}>Reading B governs</button>
                <button class="btn ghost small" disabled=${Boolean(sent)} onClick=${() => escalateToLegal(id, b.field)}>${sent ? `With ${PEOPLE.legal.name} since ${fdate(parseISO(sent.on))}` : `Ask ${PEOPLE.legal.name}, Legal`}</button>
              </div>
              <div class="small muted">Until someone with authority chooses, plan against the earlier date.</div>
            </div>`;
        }
        if (b.type === "conflict") {
          return html`<div class="small">${b.message}</div>`;
        }
        if (b.type === "unsigned") {
          return html`
            <div class="stack">
              <div class="small"><b>Is this the signed version?</b> ${b.message}</div>
              <div class="row">
                <button class="btn small" onClick=${() => setPassageCheck(id, "signed_status", "confirmed")}>I checked. This is the signed version</button>
              </div>
              <div class="small muted">If it is a draft, find the signed copy and add that instead.</div>
            </div>`;
        }
        if (b.type === "inconsistent") {
          const f = brief.facts.find((x) => x.key === b.field);
          return html`
            <div class="stack">
              <div class="small"><b>Check how this renews.</b> ${b.message}</div>
              ${f && html`<${Passage} evidence=${f.evidence} documents=${documents} />`}
              <div class="row">
                <button class="btn small" onClick=${() => setPassageCheck(id, b.field, "confirmed")}>I read the clause. The classification is right</button>
                <button class="btn ghost small" disabled=${contract.reading} onClick=${() => readContract(id)}>Read it again live</button>
              </div>
            </div>`;
        }
        if (b.type === "unverified") {
          const f = brief.facts.find((x) => x.key === b.field);
          return html`
            <div class="stack">
              <div class="small"><b>Check ${FIELD_LABEL[b.field] || b.field} yourself.</b> The model says: ${f?.value || "nothing"}. Its quoted passage is not in the uploaded text.</div>
              ${f && html`<${Passage} evidence=${f.evidence} documents=${documents} />`}
              <div class="row">
                <button class="btn small" onClick=${() => setPassageCheck(id, b.field, "confirmed")}>I read the document. The reading is right</button>
                <button class="btn ghost small" onClick=${() => setPassageCheck(id, b.field, "rejected")}>The reading is wrong</button>
              </div>
            </div>`;
        }
        return html`<div class="small"><b>${cap(FIELD_LABEL[b.field] || b.field)}:</b> ${b.message}${brief.missing.length ? " See the missing documents on the right, add them, and read again." : ""}</div>`;
      })}
    </div>`;
}

function DecisionForm({ v }) {
  const { brief, contract, today } = v;
  const id = contract.id;
  const opened = useRef(Date.now());
  const [choice, setChoice] = useState("");
  const [reason, setReason] = useState("");
  const options = brief.mechanism === "automatic"
    ? [["renew", "Renew", "Let it renew. No notice is sent."], ["renegotiate", "Renegotiate", "Send notice of non-renewal now to keep leverage, and negotiate new terms."], ["exit", "Exit", "Send notice of non-renewal and plan the handover."]]
    : brief.mechanism === "customer_must_give_notice_to_renew" || brief.mechanism === "one_time_extension_then_ends"
      ? [["renew", "Renew", "Send notice of renewal before the date above."], ["renegotiate", "Renegotiate", "Do not send notice yet. Agree new terms first."], ["exit", "Exit", "Send nothing. Plan the handover."]]
      : [["renew", "Renew", "Agree a renewal in writing before it ends."], ["renegotiate", "Renegotiate", "Agree new terms before it ends."], ["exit", "Exit", "Let it end and plan the handover."]];
  const ok = choice && reason.trim().length >= 12;
  return html`
    <div class="stack" style="margin-top:10px">
      <div class="small muted">Read the terms on the right first. A decision needs one line of reasoning, so that "renew" is a choice and not a click.</div>
      ${options.map(([key, label, effect]) => html`
        <label class="row" style="align-items:flex-start;gap:8px;cursor:pointer">
          <input type="radio" name="choice" checked=${choice === key} onChange=${() => setChoice(key)} style="margin-top:4px" />
          <span><b>${label}.</b> <span class="small" style="color:var(--ink-2)">${effect}</span></span>
        </label>`)}
      <${Field} label="Why (one line, required)"><input class="input" value=${reason} onInput=${(e) => setReason(e.target.value)} placeholder="For example: on-time rate fell below 94% in three of the last six months" /></${Field}>
      <div><button class="btn small" disabled=${!ok} onClick=${() => { recordDecision(id, { choice, reason: reason.trim(), secondsOpen: Math.round((Date.now() - opened.current) / 1000) }); markGuideDone("decide"); }}>Record decision</button></div>
    </div>`;
}

function NoticePanel({ v }) {
  const { brief, contract, supplier, today } = v;
  const id = contract.id;
  const decision = contract.record.decision;
  const kind = noticeKindFor(decision.choice, brief.mechanism);
  const letter = draftNotice({ brief, supplier, customerName: contract.custom ? "" : CUSTOMER, choice: decision.choice, today, kind });
  const [sentOn, setSentOn] = useState(toISO(today));
  const [proof, setProof] = useState("");
  const [copied, setCopied] = useState(false);
  return html`
    <div class="stack" style="margin-top:10px">
      <ul class="small" style="margin:0;padding-left:18px">${noticeChecklist(brief).map((line) => html`<li>${line}</li>`)}</ul>
      <details>
        <summary class="small" style="cursor:pointer;font-weight:600">Draft notice (filled in by code from confirmed facts)</summary>
        <pre class="letter">${letter}</pre>
        <button class="btn ghost small" style="margin-top:6px" onClick=${() => { setCopied(copyText(letter)); }}>${copied ? "Copied" : "Copy the draft"}</button>
      </details>
      <div class="small muted">This tool never sends anything to a supplier. A person with signing authority sends the notice, then records it here.</div>
      <div class="row" style="align-items:flex-end">
        <${Field} label="Sent on"><input class="input" type="date" value=${sentOn} onInput=${(e) => setSentOn(e.target.value)} /></${Field}>
        <${Field} label="Proof of sending"><input class="input" value=${proof} onInput=${(e) => setProof(e.target.value)} placeholder="Registered post receipt number" /></${Field}>
      </div>
      <div><button class="btn small" disabled=${!parseISO(sentOn) || proof.trim().length < 3} onClick=${() => { markNoticeSent(id, { sentOn, proof: proof.trim() }); markGuideDone("notice"); }}>Record notice as sent</button></div>
    </div>`;
}

// ---------- Evidence ----------
function Facts({ brief, documents }) {
  // One clause often proves several facts. Show it once and point back to it after that.
  const shown = [];
  const earlier = (f) => {
    const q = f.evidence?.quote || "";
    if (!q || !["exact", "relaxed"].includes(f.evidence.level)) return null;
    const hit = shown.find((s) => s.docId === f.evidence.docId && (s.quote === q || s.quote.includes(q)));
    if (!hit) shown.push({ quote: q, docId: f.evidence.docId, label: f.label });
    return hit || null;
  };
  const rows = brief.facts.map((f) => ({ f, same: earlier(f) }));
  return html`
    <div class="panel">
      <div class="spread"><h2 class="h2">What the documents say</h2><span class="small muted">Serif text is quoted from the contract. Yellow means code found it there.</span></div>
      <table class="facts" style="margin-top:6px">
        <tbody>
          ${rows.map(({ f, same }) => html`
            <tr>
              <td class="k">${f.label}</td>
              <td>
                <div class="row" style="gap:8px;align-items:baseline">
                  <span class="v">${f.value || html`<span class="muted" style="font-weight:400">Nothing found</span>`}</span>
                  <${Stamp} status=${f.status} />
                </div>
                ${f.note && html`<div class="note">${f.note}</div>`}
                ${same
                  ? html`<div class="passage-meta">Proved by the passage shown above under "${same.label}".</div>`
                  : html`<${Passage} evidence=${f.evidence} documents=${documents} />`}
              </td>
            </tr>`)}
        </tbody>
      </table>
      ${brief.readerNote && html`<p class="small" style="margin-top:8px;color:var(--ink-2)"><b>Reader's note from the model:</b> ${brief.readerNote}</p>`}
    </div>`;
}

function Working({ brief, supplier }) {
  if (!brief.calc.length && !brief.assumptions.length) return null;
  return html`
    <div class="panel">
      <h2 class="h2">How the dates were worked out</h2>
      <p class="small muted" style="margin-top:2px">Plain code, not the model. ${brief.dates ? "" : "These are provisional and shown only so you can see the arithmetic."}</p>
      <ol class="calc">${brief.calc.map((line) => html`<li>${line}</li>`)}</ol>
      ${brief.assumptions.length > 0 && html`<div class="banner" style="margin-top:10px">${brief.assumptions.map((a) => html`<div>${a}</div>`)}</div>`}
      <p class="small muted" style="margin-top:10px">House rule for time to decide, by category: ${Object.entries(LEAD_DAYS).map(([k, n]) => `${k} ${n} days`).join(", ")}. This is an assumption about the company, listed in About.</p>
    </div>`;
}

function Changes({ brief, documents }) {
  return html`
    <div class="panel info">
      <h2 class="h2">Changed by a later document</h2>
      <p class="small muted" style="margin-top:2px">The first passage is real and still in the file. It no longer governs.</p>
      ${brief.changes.map((c) => html`
        <div style="margin-top:12px">
          <div><b>${cap(FIELD_LABEL[c.field] || c.field)}:</b> <s class="muted">${c.earlier}</s> now <b>${c.later}</b></div>
          <div class="small" style="color:var(--ink-2)">${c.governs === "later_document" ? "The later document governs." : c.governs === "earlier_document" ? "The earlier document still governs." : "It is unclear which governs."} ${c.basis}</div>
          <${Passage} evidence=${c.earlierEvidence} documents=${documents} />
          <${Passage} evidence=${c.laterEvidence} documents=${documents} />
        </div>`)}
    </div>`;
}

function Missing({ brief, documents }) {
  return html`
    <div class="panel warn">
      <h2 class="h2">Referred to, but not in the repository</h2>
      <p class="small muted" style="margin-top:2px">"Not found" here means not found in these documents. It does not mean the term does not exist.</p>
      ${brief.missing.map((m) => html`
        <div style="margin-top:10px">
          <div><b>${m.name}</b></div>
          <div class="small" style="color:var(--ink-2)">${m.why}</div>
          <${Passage} evidence=${m.evidence} documents=${documents} />
        </div>`)}
    </div>`;
}

function Documents({ contract }) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  return html`
    <div class="panel">
      <h2 class="h2">Documents in this contract family</h2>
      <p class="small muted" style="margin-top:2px">${contract.custom ? "Your own text. Edit one detail and read again to see the result change." : "Synthetic sample written for this prototype. You can still edit a detail and read again."}</p>
      ${contract.documents.map((d) => html`
        <div style="margin-top:10px">
          <div class="row" style="justify-content:space-between">
            <div><b>${d.name}</b> <span class="small muted">${d.text.length.toLocaleString("en-IN")} characters, read in full</span></div>
            <div class="row" style="gap:8px">
              <button class="btn ghost small" onClick=${() => openDoc({ name: d.name, text: d.text, start: -1, end: -1 })}>Open</button>
              <button class="btn ghost small" onClick=${() => { setEditing(editing === d.id ? null : d.id); setDraft(d.text); }}>${editing === d.id ? "Cancel" : "Edit text"}</button>
            </div>
          </div>
          ${editing === d.id && html`
            <div class="stack" style="margin-top:8px">
              <textarea class="textarea" value=${draft} onInput=${(e) => setDraft(e.target.value)}></textarea>
              <div class="row">
                <button class="btn small" disabled=${contract.reading} onClick=${() => { updateDocumentText(contract.id, d.id, draft); setEditing(null); readContract(contract.id); markGuideDone("edit"); }}>Save and read again live</button>
                <span class="small muted">The previous reading is kept so you can compare.</span>
              </div>
            </div>`}
        </div>`)}
      <${AddDocument} contract=${contract} />
      ${contract.custom && html`
        <hr class="hr" />
        <${CustomDetails} contract=${contract} />`}
    </div>`;
}

function AddDocument({ contract }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const full = contract.documents.length >= 6;
  const hasSampleSow = contract.id === "quillmark" && contract.documents.length === 1;
  async function onFile(file) {
    if (!file) return;
    setError("");
    try {
      const out = await fileToText(file);
      setName(out.name);
      setText(out.text);
    } catch (e) {
      setError(e.message || "That file could not be read.");
    }
  }
  if (!open) {
    return html`<div style="margin-top:12px"><button class="btn ghost small" disabled=${full} onClick=${() => setOpen(true)}>Add an amendment, order form or statement of work</button></div>`;
  }
  return html`
    <div class="stack" style="margin-top:12px">
      <hr class="hr" />
      <div class="h3">Add a document to this family</div>
      ${hasSampleSow && html`<div><button class="chip" onClick=${() => { setName("Quillmark SOW No. 1 (5 May 2025).pdf"); setText(TEXT_QUILLMARK_SOW); }}>Use the sample SOW No. 1 for this demo</button></div>`}
      <div class="row" style="align-items:flex-end">
        <${Field} label="Name"><input class="input" value=${name} onInput=${(e) => setName(e.target.value)} placeholder="Amendment No. 2" /></${Field}>
        <${Field} label="Upload a PDF, Word or text file"><input class="input" type="file" accept=".pdf,.docx,.txt,.md,text/plain,application/pdf" onChange=${(e) => onFile(e.target.files[0])} /></${Field}>
      </div>
      <${Field} label="Text" hint=${`${text.length.toLocaleString("en-IN")} characters`}><textarea class="textarea" style="min-height:140px" value=${text} onInput=${(e) => setText(e.target.value)} placeholder="Paste the document text here"></textarea></${Field}>
      ${error && html`<div class="banner bad">${error}</div>`}
      <div class="row">
        <button class="btn small" disabled=${text.trim().length < 40 || contract.reading} onClick=${() => { addDocument(contract.id, { name, text }); setOpen(false); setName(""); setText(""); readContract(contract.id); }}>Add and read the family again live</button>
        <button class="btn ghost small" onClick=${() => setOpen(false)}>Cancel</button>
      </div>
    </div>`;
}

function CustomDetails({ contract }) {
  const s = contract.supplier;
  return html`
    <div class="row" style="align-items:flex-end">
      <${Field} label="Category (sets time to decide)">
        <select class="select" value=${s.category} onChange=${(e) => updateCustomSupplier(contract.id, { category: e.target.value })}>${CATEGORIES.map((c) => html`<option value=${c}>${c}</option>`)}</select>
      </${Field}>
      <${Field} label="Annual value, INR">
        <input class="input" type="number" min="0" value=${s.annualValue || ""} onInput=${(e) => updateCustomSupplier(contract.id, { annualValue: Number(e.target.value) || 0 })} />
      </${Field}>
      <button class="btn ghost small" onClick=${() => { removeContract(contract.id); go("#/"); }}>Remove from this browser</button>
    </div>`;
}

function WhatChanged({ contract, supplier, today, current }) {
  const prev = contract.history[0];
  if (!prev || !prev.extraction) return null;
  const pick = (x) => ({
    "Renewal": MECHANISM_LABEL[x.renewal?.mechanism] || x.renewal?.mechanism || "",
    "Term counted from": x.term?.start_basis === "event_or_date_not_stated_in_documents" ? `${x.term?.start_label} (no date in documents)` : `${x.term?.start_label || ""} ${x.term?.start_date || ""}`.trim(),
    "Initial term": x.term?.fixed_end_date ? `until ${x.term.fixed_end_date}` : describeDuration(Number(x.term?.initial_term_number) || 0, x.term?.initial_term_unit),
    "Notice period": describeDuration(Number(x.notice?.period_number) || 0, x.notice?.period_unit),
    "Renewal period": describeDuration(Number(x.renewal?.renewal_term_number) || 0, x.renewal?.renewal_term_unit),
  });
  const before = pick(prev.extraction);
  const after = pick(contract.extraction);
  const rows = Object.keys(after).map((k) => ({ k, before: before[k], after: after[k], changed: before[k] !== after[k] }));
  const any = rows.some((r) => r.changed);
  return html`
    <div class="panel">
      <h2 class="h2">What changed since the previous read</h2>
      <p class="small muted" style="margin-top:2px">${any ? "The reading moved with the text." : "Same reading as before. Rewording that does not change the meaning should land here."}</p>
      <div class="scroll-x"><table class="table" style="margin-top:8px">
        <thead><tr><th></th><th>Previous read</th><th>This read</th></tr></thead>
        <tbody>${rows.map((r) => html`<tr><td>${r.k}</td><td class=${r.changed ? "" : "muted"}>${r.before || "none"}</td><td style=${r.changed ? "font-weight:650;background:var(--hi)" : ""}>${r.after || "none"}</td></tr>`)}</tbody>
      </table></div>
    </div>`;
}

function Activity({ contract }) {
  const log = contract.record.log || [];
  if (!log.length) return null;
  return html`
    <div class="panel">
      <h2 class="h2">Record of who did what</h2>
      <ul class="log">${log.map((l) => html`<li><b>${l.who}</b>, ${formatDate(parseISO(l.on))}: ${l.text}</li>`)}</ul>
    </div>`;
}
