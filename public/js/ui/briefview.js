import { html, useState, useEffect, useRef, useStore, go, fdate, daysText, Stamp, Tone, Passage, Runway, Spinner, Field, openDoc, copyText } from "./common.js";
import {
  viewOf, readContract, setRole, setOwnerName, acceptQuestion, declineQuestion, reassignQuestion, answerQuestion, recordDecision,
  clearDecision, confirmAnswer, returnAnswer, resolveConflict, escalateToLegal, setPassageCheck, markNoticeSent, owners, PEOPLE, CUSTOMER,
  updateDocumentText, updateCustomSupplier, removeContract, markGuideDone, addDocument, splitFamily, readAllUnread, recordMissedWindow, confirmNoticePosted,
} from "../store.js";
import { fileToText } from "../files.js";
import { TEXT_QUILLMARK_SOW } from "../../data/samples.js";
import { toISO, parseISO, formatDate, daysBetween, describeDuration, nonWorkingNote } from "../core/dates.js";
import { formatMoney, MECHANISM_LABEL, CATEGORIES, LEAD_DAYS, SAFETY_MARGIN_BUSINESS_DAYS, READING_VERSION } from "../core/rules.js";
import { Icon } from "./icons.js";
import { emph } from "./portfolio.js";
import { noticeNeededFor, noticeKindFor, CHOICE_LABEL, afterWindow } from "../core/workflow.js";
import { draftNotice, draftLateRequest, noticeChecklist, allowedMethods, assessNotice, METHODS } from "../core/notice.js";
import { reminderPlan, calendarFile } from "../core/reminders.js";

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
      <div class="page-head">
        <div>
          <div class="title-row"><h1 class="h1">${supplier.name}</h1>${flow && html`<${Tone} tone=${flow.tone}>${flow.label}</${Tone}>`}</div>
          <p class="lede">
            ${supplier.appliesTo ? `${supplier.appliesTo}. ` : ""}${supplier.category}. Budget owner: ${contract.record.ownerOverride || supplier.owner}${supplier.ownerTitle ? `, ${supplier.ownerTitle}` : ""}.
            ${supplier.annualValue ? ` ${formatMoney(supplier.annualValue, supplier.currency)} a year.` : ""}
          </p>
        </div>
        <${ReadStatus} contract=${contract} />
      </div>
      <${Family} contract=${contract} />

      ${contract.reading && html`<div class="banner info" style="margin-top:14px"><${Spinner} label="Reading the documents with the live model. This usually takes 10 to 60 seconds." /></div>`}
      ${contract.error && html`<${ReadError} contract=${contract} />`}

      ${!brief && !contract.reading && html`
        <div class="panel" style="margin-top:18px">
          <h2 class="h2">Not read yet</h2>
          <p class="lede">The documents are loaded. Nothing has been read by the model.</p>
          <div style="margin-top:12px"><button class="btn" onClick=${() => readContract(id)}>Read with AI</button></div>
        </div>`}

      ${brief && html`
        <${Steps} v=${v} />
        <${Hero} v=${v} />
        <div class="brief-grid">
          <div>
            <${NextStep} v=${v} role=${state.role} me=${state.ownerName} />
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
    <div class="small reading-meta">
      ${meta
        ? html`<div class="muted">
            ${meta.source === "live" ? "Read live" : "Saved reading"} by <b>${meta.model}</b>${meta.ran_at ? `, ${istStamp(meta.ran_at)}` : ""}${meta.ms ? `, took ${(meta.ms / 1000).toFixed(1)} s` : ""}.
            ${meta.source !== "live" ? " A real model reading, saved so this page opens instantly." : ""}
          </div>
          ${meta.prompt !== READING_VERSION && html`<div class="stale-note">Read with earlier reading instructions${meta.prompt ? ` (${meta.prompt})` : ""}. Checks added since may rely on facts that reading did not report. Read again live to apply them.</div>`}`
        : null}
      <div style="margin-top:6px">
        <button class="btn ghost small" disabled=${contract.reading} onClick=${() => readContract(contract.id)}>${contract.extraction ? "Read again live" : "Read with AI"}</button>
      </div>
    </div>`;
}

function istStamp(iso) {
  try {
    return `${new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })} IST`;
  } catch {
    return iso.slice(0, 10);
  }
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

// ---------- The decision: the date, the sum behind it, what silence costs ----------
function headline(v) {
  const { brief, today } = v;
  const d = brief.dates;
  const p = brief.provisional?.dates || null;
  const renewsBySilence = brief.mechanism === "automatic";
  const toRenew = brief.mechanism === "customer_must_give_notice_to_renew" || brief.mechanism === "one_time_extension_then_ends";
  let tone = "good";
  let question = renewsBySilence ? "Last safe date to send notice, to stop it renewing" : toRenew ? "Last safe date to send notice, to renew" : "Term ends";
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
      question = "Last day for notice to arrive";
      big = fdate(d.cancelBy, true);
      under = html`<${Tone} tone="bad">Window closed ${daysText(today, d.cancelBy)}</${Tone}>`;
    } else if (today > d.sendBy) {
      tone = "bad";
      question = "Safe send date passed. Notice must arrive by";
      big = fdate(d.cancelBy, true);
      under = html`<${Tone} tone="bad">Send today</${Tone}> <span class="small muted">safe send date was ${fdate(d.sendBy)}</span>`;
    } else {
      const left = daysBetween(today, d.sendBy);
      tone = left <= 14 ? "bad" : left <= 45 ? "warn" : "good";
      big = fdate(d.sendBy, true);
      const deemed = brief.notice.deemedNumber > 0 ? describeDuration(brief.notice.deemedNumber, brief.notice.deemedUnit) : "";
      under = html`
        <span class="countdown">${left} day${left === 1 ? "" : "s"} left to send</span>
        <div class="hero-arrive"><span>Must arrive by <b>${fdate(d.cancelBy, true)}</b></span><${Tone} tone="good">Confirmed from the documents</${Tone}></div>
        <div class="hero-why">The send-by date allows ${deemed ? `${deemed} for delivery, as the contract says, ` : ""}plus ${SAFETY_MARGIN_BUSINESS_DAYS} working days of company buffer.</div>`;
    }
  } else if (brief.outcome === "ends" && d) {
    tone = d.expired ? "bad" : "warn";
    question = "Ends on";
    big = fdate(d.termEnd, true);
    under = html`<${Tone} tone="info">No automatic renewal</${Tone}> <span class="countdown">${daysText(today, d.termEnd)}</span>`;
  } else if (brief.outcome === "provisional") {
    tone = "prov";
    question = "Provisional. No confirmed date yet";
    big = p && (p.sendBy || p.termEnd) ? fdate(p.sendBy || p.termEnd, true) : "Date not known";
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
    big = first?.type === "split" ? "Several renewal dates" : first?.type === "inconsistent" ? "Reading contradicts itself" : first?.type === "unsigned" ? "Not a signed copy" : first?.type === "conflict" ? "Conflicting terms" : first?.type === "unverified" ? "Passage not verified" : first?.type === "legal" ? "Needs legal review" : first?.type === "conditional" ? "End depends on an event" : first?.type === "limit" ? "Agreement ends first" : "Not found in these documents";
    bigClass = "none";
  }
  return { tone, question, big, bigClass, under };
}

// Where the work stands, as steps.
function Steps({ v }) {
  const { brief, flow, contract } = v;
  const rec = contract.record || {};
  const factsOk = ["confirmed", "ends", "no_deadline"].includes(brief.outcome);
  const decided = Boolean(rec.decision?.choice);
  const needNotice = decided && noticeNeededFor(rec.decision.choice, brief.mechanism);
  const closed = flow.stage === "window_closed";
  const steps = [
    { label: "Read and checked", state: "done", note: "" },
    { label: "Facts proven", state: factsOk ? "done" : "now", note: factsOk ? "" : flow.label },
    { label: "Owner decides", state: decided ? "done" : !factsOk ? "todo" : closed ? "missed" : flow.stage === "done" ? "skip" : "now", note: decided ? CHOICE_LABEL[rec.decision.choice] : flow.stage === "done" ? "Not needed" : factsOk && !closed ? flow.label : "" },
    { label: "Notice", state: closed ? "missed" : flow.stage === "done" && !needNotice ? "skip" : !decided ? "todo" : !needNotice ? "skip" : flow.stage === "done" ? "done" : "now", note: closed ? "Window closed" : (decided || flow.stage === "done") && !needNotice ? "Not needed" : needNotice && flow.stage !== "done" ? flow.label : "" },
    { label: "Done", state: flow.stage === "done" ? "done" : "todo", note: "" },
  ];
  return html`
    <ol class="steps" aria-label="Progress">
      ${steps.map((st) => html`<li class=${`st-${st.state}`} aria-current=${st.state === "now" ? "step" : undefined}>
        <span class="st-dot" aria-hidden="true">${st.state === "done" ? "✓" : st.state === "missed" ? "!" : ""}</span>
        <span class="st-text"><b>${st.label}</b>${st.note && html`<span>${st.note}</span>`}</span>
      </li>`)}
    </ol>`;
}

// The documents in this contract family, oldest first.
function Family({ contract }) {
  const docs = contract.documents || [];
  if (!docs.length) return null;
  return html`
    <div class="family">
      <span class="family-l">Contract family</span>
      ${docs.map((d, i) => html`${i > 0 && html`<${Icon} name="chevron" size=${16} cls="family-sep" />`}<button class="family-doc" onClick=${() => openDoc({ name: d.name, text: d.text, start: -1, end: -1 })}><${Icon} name="doc" size=${15} />${d.name}</button>`)}
    </div>`;
}

const jump = (key) => (e) => {
  e.preventDefault();
  const el = document.getElementById(`fact-${key}`);
  if (el) { el.scrollIntoView({ block: "center" }); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1400); }
};

// The arithmetic behind the headline date, as a visible sum. Each part links to the clause it rests on.
function DateSum({ brief, dates, provisional }) {
  if (!dates || !dates.termEnd || !dates.cancelBy || !dates.sendBy) return null;
  const fact = (k) => brief.facts.find((f) => f.key === k);
  const noticeText = String(fact("notice_period")?.value || "");
  const noticeShort = (noticeText.match(/^\s*(\d+\s+(?:working |business |calendar )?(?:days?|weeks?|months?))/i) || [])[1] || noticeText.split(" before")[0] || "Notice period";
  const n = Number(brief.notice.deemedNumber) || 0;
  const unit = String(brief.notice.deemedUnit || "").includes("business") ? "working day" : "day";
  const termFact = dates.renewalsPassed > 0 ? fact("renewal_term") : fact("initial_term");
  const tok = (label, value, link, cls = "") => html`
    <div class=${`sum-tok ${cls}`}>
      <span class="sum-l">${label}</span><b>${value}</b>
      ${link && html`<a class="sum-src" href="#" onClick=${jump(link[0])}>${link[1]}</a>`}
    </div>`;
  const op = (c) => html`<span class="sum-op" aria-hidden="true">${c}</span>`;
  return html`
    <div class=${`sum ${provisional ? "prov" : ""}`} aria-label="How the date is worked out">
      ${tok(dates.renewalsPassed > 0 ? "Current term ends" : "Term ends", fdate(dates.termEnd), [termFact?.key || "initial_term", provisional ? `if it began ${fdate(dates.termStart)}` : (String(termFact?.value || "").match(/^\d+\s+(?:months?|years?|days?|weeks?)/i) ? `${String(termFact.value).match(/^\d+\s+(?:months?|years?|days?|weeks?)/i)[0]} from ${fdate(dates.termStart)}` : `started ${fdate(dates.termStart)}`)])}
      ${op("−")}
      ${tok("Notice period", noticeShort, ["notice_period", "the clause"])}
      ${op("=")}
      ${tok("Must arrive by", fdate(dates.cancelBy), null, "mid")}
      ${op("−")}
      ${tok("Delivery time", n ? `${n} ${unit}${n === 1 ? "" : "s"}` : "None stated", ["notice_delivery", "deemed receipt"])}
      ${op("−")}
      ${tok("Company buffer", `${SAFETY_MARGIN_BUSINESS_DAYS} working days`, null)}
      ${op("=")}
      ${tok("Send by", fdate(dates.sendBy), null, "res")}
    </div>
`;
}

// What silence does, in money where the documents allow it, in words where they do not.
function silenceCell(brief, supplier) {
  const s = brief.silence;
  const what = s.text.replace(/^If nobody acts, /, "").replace(/^./, (c) => c.toUpperCase());
  if (s.amount) return html`<div class="m-cell hot"><span>If nobody acts</span><b>${formatMoney(s.amount, supplier.currency)}</b><em>${what}</em></div>`;
  if (brief.mechanism === "continues_until_terminated") return html`<div class="m-cell"><span>If nobody acts</span><b>${s.amountText ? s.amountText.replace(/ while it runs$/, "") : "It keeps running"}</b><em>${what}</em></div>`;
  if (brief.mechanism === "automatic" || brief.mechanism === "one_time_extension_then_ends") return html`<div class="m-cell hot"><span>If nobody acts</span><b>It renews</b><em>For how long, the documents on file do not say.</em></div>`;
  return html`<div class="m-cell"><span>If nobody acts</span><b>It ends</b><em>${what}</em></div>`;
}

function Money({ brief, supplier }) {
  const s = brief.silence;
  const annual = Number(supplier.annualValue) || 0;
  return html`
    <div class="money-grid">
      <div class="m-cell"><span>Annual value</span><b>${annual ? formatMoney(annual, supplier.currency) : "Not given"}</b></div>
      ${silenceCell(brief, supplier)}
      ${s.uplift
        ? html`<div class="m-cell"><span>Price on renewal</span><b>+${s.uplift.amountText}</b><em>${s.uplift.noticeBy
            ? s.uplift.noticePassed
              ? `Only if ${supplier.short || supplier.name} announced the ${s.uplift.cap}% rise by ${fdate(s.uplift.noticeBy)}, as the contract requires. That date has passed: check whether it did.`
              : `If the ${s.uplift.cap}% cap is used. ${supplier.short || supplier.name} must announce it by ${fdate(s.uplift.noticeBy)}.`
            : `If the ${s.uplift.cap}% cap is used.`}</em></div>`
        : s.upliftText && html`<div class="m-cell"><span>Price on renewal</span><b>Can rise</b><em>The contract lets the price rise on renewal.</em></div>`}
    </div>`;
}

function Hero({ v }) {
  const { brief, supplier, today } = v;
  const d = brief.dates;
  const p = brief.provisional?.dates || null;
  const shown = d || p;
  const h = headline(v);
  const method = brief.notice.methods ? brief.notice.methods.replace(/[.\s]+$/, "") : "";
  const showMethod = shown && shown.sendBy && method && brief.outcome !== "blocked";
  const rows = [];
  if (shown && brief.outcome !== "blocked") {
    if (shown.opensOn) rows.push(["Notice window opens", fdate(shown.opensOn), ""]);
    if (shown.decideBy) rows.push([brief.outcome === "ends" ? "Start talks by" : "Owner's decision due", fdate(shown.decideBy), today > shown.decideBy ? "overdue, house rule" : "house rule"]);
  }
  return html`
    <section class=${`hero t-${h.tone}`}>
      <div class="hero-main">
        <div class="hero-q">${h.question}</div>
        <div class=${`bigdate ${h.bigClass}`}>${h.big}</div>
        <div class="row" style="gap:10px">${h.under}</div>
        ${showMethod && html`<p class="hero-how"><b>How to send:</b> ${method.charAt(0).toLowerCase() + method.slice(1)}.</p>`}
        ${shown && shown.sendBy && !shown.windowClosed && nonWorkingNote(shown.sendBy) && brief.outcome !== "blocked" && html`<p class="hero-warn">${fdate(shown.sendBy)} is ${nonWorkingNote(shown.sendBy)}. Send a working day earlier.</p>`}
        ${brief.outcome === "provisional" && brief.provisional && html`<p class="hero-warn">Provisional, ${brief.provisional.basis}. Do not act on it.</p>`}
        ${brief.outcome === "provisional" && !brief.provisional && html`<p class="small muted" style="margin-top:8px">Not even a provisional date can be worked out from these documents.</p>`}
        ${!d && brief.missing.length > 0 && brief.hard.some((b) => b.type === "not_found" && ["term_start", "initial_term"].includes(b.field)) && html`
          <p class="hero-callout"><b>Not on file:</b> ${brief.missing.map((m) => m.name).join("; ")}. ${brief.missing[0].why ? `${stripEnd(brief.missing[0].why)}. ` : ""}No date is confirmed until ${brief.missing.length === 1 ? "it is" : "they are"} added. <a href="#" onClick=${(e) => { e.preventDefault(); document.getElementById("missing-docs")?.scrollIntoView({ block: "start" }); }}>See where the contract refers to ${brief.missing.length === 1 ? "it" : "them"}</a></p>`}
        ${brief.outcome === "blocked" && brief.alternatives.length > 0 && html`
          <div class="alts">
            ${brief.alternatives.map((a) => html`<div class="alt"><b>Reading ${a.side.toUpperCase()}</b> ${a.dates?.sendBy ? html`send by <b>${fdate(a.dates.sendBy)}</b>, arrive by ${fdate(a.dates.cancelBy)}${nonWorkingNote(a.dates.sendBy) ? html`<em class="alt-warn"> ${fdate(a.dates.sendBy)} is ${nonWorkingNote(a.dates.sendBy)}: send a working day earlier.</em>` : ""}` : "no date"}<span>${a.reading}</span></div>`)}
          </div>`}
        ${d && d.guessedCancelBy && html`
          <p class="hero-callout"><b>Guessing would have been wrong.</b> Counting from the signing date gives a deadline of ${fdate(d.guessedCancelBy)}. The real deadline is ${Math.abs(daysBetween(d.cancelBy, d.guessedCancelBy))} days ${d.cancelBy < d.guessedCancelBy ? "earlier" : "later"}.</p>`}
        ${d && d.windowClosed && !d.expired && html`
          <p class="hero-callout">${afterWindow(brief, d).trim()}${d.nextCancelBy ? html` The next chance to say no is <b>${fdate(d.nextCancelBy)}</b>.` : ""}</p>`}
        ${rows.length > 0 && html`
          <dl class="hero-rows">
            ${rows.map(([k, val, note]) => html`<div><dt>${k}</dt><dd><b>${val}</b>${note && html` <span class=${/^overdue/.test(note) ? "overdue" : "muted"}>${note}</span>`}</dd></div>`)}
          </dl>`}
      </div>
      <div class="hero-side">
        <${Money} brief=${brief} supplier=${supplier} />
      </div>
      ${shown && brief.outcome !== "blocked" && html`<div class="hero-sum"><${DateSum} brief=${brief} dates=${shown} provisional=${!d} /></div>`}
    </section>`;
}

// What happens next, who does it, and the controls to do it.
function NextStep({ v, role, me }) {
  const { brief, flow, today, supplier, contract } = v;
  const d = brief.dates;
  const p = brief.provisional?.dates || null;
  const shown = d || p;
  const names = [contract.record.ownerOverride || supplier.owner, PEOPLE.procurement.name, PEOPLE.escalation.name, PEOPLE.legal?.name];
  return html`
    <div class="slip">
      <div class="slip-head"><span class="h3">Next step</span><${Tone} tone=${flow.tone}>${flow.label}</${Tone}></div>
      <p class="next-text">${emph(flow.detail, names)}</p>
      <${Actions} v=${v} role=${role} me=${me} />
      <${Reminders} v=${v} />
      ${shown && (shown.cancelBy || shown.termEnd) && brief.outcome !== "blocked" && html`
        <details class="more">
          <summary>All dates and the timeline</summary>
          <div class="dates">
            ${shown.sendBy && html`<div><span>Send notice by</span><b>${fdate(shown.sendBy)}</b></div>`}
            ${shown.cancelBy && html`<div><span>Notice must arrive by</span><b>${fdate(shown.cancelBy)}</b></div>`}
            ${shown.termEnd && html`<div><span>Current term ends</span><b>${fdate(shown.termEnd)}</b></div>`}
            ${shown.renewsOn && brief.mechanism === "automatic" && html`<div><span>Renews on</span><b>${fdate(shown.renewsOn)}</b></div>`}
            ${shown.extensionEnd && html`<div><span>Silent extension ends</span><b>${fdate(shown.extensionEnd)}</b></div>`}
          </div>
          <${Runway} dates=${shown} today=${today} provisional=${!d} hasNotice=${Boolean(shown.cancelBy)} />
        </details>`}
    </div>`;
}

function stripEnd(s) {
  return String(s || "").replace(/[.\s]+$/, "");
}

function cap(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function downloadText(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Reminders keyed to the safe send date, and the same dates as a calendar file.
function downloadCalendar(v) {
  const { brief, contract, supplier } = v;
  const text = calendarFile({ brief, supplier, contractId: contract.id, documents: contract.documents });
  const url = URL.createObjectURL(new Blob([text], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(supplier.short || supplier.name || "contract").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-renewal-dates.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function Reminders({ v }) {
  const { brief, flow, contract, supplier, today } = v;
  const plan = reminderPlan({ brief, flow, record: contract.record, supplier, people: PEOPLE, today });
  if (!plan) return null;
  if (plan.next) return null; // the after-the-window panel carries the next window and its calendar file
  const upcoming = plan.items.filter((i) => !i.past);
  const download = () => downloadCalendar(v);
  return html`
    <details class="more">
      <summary>Reminders${plan.stopped ? ": stopped" : upcoming.length ? `: next on ${fdate(upcoming[0].on)}` : ""}</summary>
      ${plan.stopped
        ? html`<p class="small" style="margin-top:8px">${plan.stopped}</p>`
        : html`<ol class="reminders">${plan.items.map((i) => html`<li class=${i.past ? "past" : ""}><b>${fdate(i.on)}</b><span>${i.what}. To ${i.to}.${i.past ? " Already due." : ""}</span></li>`)}</ol>`}
      ${plan.endDateCheck && !plan.stopped && html`<p class="small" style="margin-top:8px"><b>Keyed to the safe send date, not the end date.</b> ${plan.endDateCheck.text}</p>`}
      <div class="row" style="margin-top:10px">
        <button class="btn ghost small" onClick=${download}>Download calendar file</button>
        <span class="small muted">Decide, send and arrive dates, with alerts.</span>
      </div>
      <p class="small muted" style="margin-top:6px">Email is simulated in this prototype. Reminders stop once a valid notice is recorded.</p>
    </details>`;
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

  if (flow.stage === "window_closed") return html`<${AfterWindow} v=${v} role=${role} />`;

  if (flow.stage === "done" && contract.record.decision && role === "procurement") {
    return html`<div style="margin-top:10px"><button class="btn ghost small" onClick=${() => clearDecision(id)}>Reopen the decision</button></div>`;
  }
  return null;
}

// ---------- After the window: what is still possible, for the record and for next time ----------
function AfterWindow({ v, role }) {
  const { brief, contract, supplier, today } = v;
  const d = brief.dates || {};
  const id = contract.id;
  const [copied, setCopied] = useState(false);
  const exit = brief.facts.find((f) => f.key === "exit_rights");
  const name = supplier.short || supplier.name;
  const letter = draftLateRequest({ brief, supplier, customerName: contract.custom ? "" : CUSTOMER, today, signer: PEOPLE.procurement });
  const s = brief.silence || {};
  const renews = (s.text || "").replace(/^If nobody acts,\s*/i, "").replace(/[.\s]+$/, "");
  const cost = s.amountText ? `${s.amountText}${renews ? `: ${renews}` : ""}${s.upliftText ? `, ${s.upliftText}` : ""}.` : `${cap(renews)}.`;
  const missed = contract.record.missed;
  const slug = (supplier.short || supplier.name || "supplier").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return html`
    <div class="after">
      <div class="after-head">The window has closed. What you can still do</div>
      <div class="after-item">
        <div class="after-t">Check the exits the contract still gives</div>
        <div class="small">${exit?.value ? exit.value : "The reading found no other way to exit in these documents."} ${exit && html`<a href="#" onClick=${jump("exit_rights")}>See the clause</a>`}</div>
      </div>
      <div class="after-item">
        <div class="after-t">Ask ${name} for an exit or new terms</div>
        <div class="small">A request, not a right: ${name} can say no. Send it before the renewal starts${d.renewsOn ? ` on ${fdate(d.renewsOn)}` : ""}.</div>
        <div class="row" style="gap:8px;margin-top:8px">
          <button class="btn ghost small" onClick=${() => setCopied(copyText(letter))}><${Icon} name="copy" size=${15} />${copied ? "Copied" : "Copy request letter"}</button>
          <button class="btn ghost small" onClick=${() => downloadText(letter, `${slug}-request-after-missed-window.txt`)}><${Icon} name="download" size=${15} />Download</button>
        </div>
      </div>
      ${d.nextCancelBy && html`
        <div class="after-item">
          <div class="after-t">Put the next window in the calendar</div>
          <div class="small">Decide by <b>${fdate(d.nextDecideBy)}</b>. Send by <b>${fdate(d.nextSendBy)}</b>. Notice must arrive by <b>${fdate(d.nextCancelBy)}</b>.</div>
          <div style="margin-top:8px"><button class="btn ghost small" onClick=${() => downloadCalendar(v)}><${Icon} name="calendar" size=${15} />Download calendar file</button></div>
        </div>`}
      <div class="after-item">
        <div class="after-t">Tell Finance what is now committed</div>
        <div class="small">${cost}</div>
        ${missed
          ? html`<div class="small" style="margin-top:8px;color:var(--good);font-weight:600">Recorded for Finance by ${missed.by} on ${fdate(parseISO(missed.on))}.</div>`
          : role === "procurement"
            ? html`<div style="margin-top:8px"><button class="btn small" onClick=${() => recordMissedWindow(id, cost)}>Record for Finance</button></div>`
            : html`<div class="small muted" style="margin-top:6px">Procurement records this.</div>`}
      </div>
    </div>`;
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
                  <div class="small"><b>Reading ${a.side.toUpperCase()}:</b> ${String(a.reading || "").replace(/[.\s]+$/, "")}. ${a.dates?.cancelBy ? html`Last notice date would be <b>${fdate(a.dates.cancelBy)}</b>.` : ""}</div>
                  <${Passage} evidence=${a.evidence} documents=${documents} />
                </div>`)}
              <${ChooseReading} id=${id} field=${b.field} alts=${alts} sent=${sent} />
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
        if (b.type === "split") {
          return html`
            <div class="stack">
              <div class="small"><b>One date would be wrong for some of these.</b> ${b.message}</div>
              <div class="row">
                <button class="btn small" disabled=${contract.documents.length < 3} onClick=${() => { const ids = splitFamily(id); if (ids.length) { go(`#/c/${ids[0]}`); readAllUnread(); } }}>Split into ${contract.documents.length - 1} contracts and read each</button>
              </div>
              <div class="small muted">Each new contract keeps the master agreement with one order form, so each gets its own dates and record.</div>
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
        return html`<div class="small"><b>${cap(FIELD_LABEL[b.field] || b.field)}:</b> ${b.message}${brief.missing.length ? " The missing documents are listed further down. Add them and read again." : ""}</div>`;
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
      ? [["renew", "Renew", "Send notice of renewal before the safe send date."], ["renegotiate", "Renegotiate", "Do not send notice yet. Agree new terms first."], ["exit", "Exit", "Send nothing. Plan the handover."]]
      : [["renew", "Renew", "Agree a renewal in writing before it ends."], ["renegotiate", "Renegotiate", "Agree new terms before it ends."], ["exit", "Exit", "Let it end and plan the handover."]];
  const ok = choice && reason.trim().length >= 12;
  return html`
    <div class="stack" style="margin-top:10px">
      ${v.flow.reopened && html`<div class="banner bad small"><b>This decision was reopened.</b> ${v.flow.detail}</div>`}
      <div class="small muted">Read the terms under What the documents say first. A decision needs one line of reasoning, so that "renew" is a choice and not a click.</div>
      <div class="choice-stack" role="radiogroup" aria-label="Decision">
        ${options.map(([key, label, effect]) => html`
          <button role="radio" aria-checked=${choice === key} class=${`choice ${choice === key ? "on" : ""} c-${key}`} onClick=${() => setChoice(key)}>
            <b>${label}</b><span>${effect}</span>
          </button>`)}
      </div>
      <${Field} label="Why (one line, required)"><input class="input" value=${reason} onInput=${(e) => setReason(e.target.value)} placeholder="For example: on-time rate fell below 94% in three of the last six months" /></${Field}>
      <div><button class="btn small" disabled=${!ok} onClick=${() => { recordDecision(id, { choice, reason: reason.trim(), secondsOpen: Math.round((Date.now() - opened.current) / 1000) }); markGuideDone("decide"); }}>Record decision</button></div>
    </div>`;
}

function ChooseReading({ id, field, alts, sent }) {
  const [side, setSide] = useState("");
  const [reason, setReason] = useState("");
  const [legal, setLegal] = useState(false);
  const chosen = alts.find((a) => a.side === side);
  const other = alts.find((a) => a.side !== side);
  // Choosing the later deadline gives the team more time on paper, so it needs Legal's written approval.
  const later = chosen?.dates?.cancelBy && other?.dates?.cancelBy && chosen.dates.cancelBy > other.dates.cancelBy;
  const ok = side && reason.trim().length >= 10 && (!later || legal);
  return html`
    <div class="stack">
      <div class="row">
        ${alts.map((a) => html`<label class="row" style="gap:6px;cursor:pointer"><input type="radio" name=${`pick-${field}`} checked=${side === a.side} onChange=${() => setSide(a.side)} /> Reading ${a.side.toUpperCase()} governs</label>`)}
      </div>
      ${side && html`
        <${Field} label="Why does it govern? (required)" hint="For example: the order form is the later, more specific document, and Legal confirmed it prevails.">
          <input class="input" value=${reason} onInput=${(e) => setReason(e.target.value)} />
        </${Field}>
        ${later && html`
          <div class="banner">This reading gives the <b>later</b> deadline, ${fdate(chosen.dates.cancelBy)} instead of ${fdate(other.dates.cancelBy)}. House rule: procurement may choose the earlier, safer date alone; the later one needs Legal.
            <label class="row" style="gap:6px;margin-top:6px;cursor:pointer"><input type="checkbox" checked=${legal} onChange=${(e) => setLegal(e.target.checked)} /> ${PEOPLE.legal.name} (Legal) has approved this reading in writing</label>
          </div>`}`}
      <div class="row">
        <button class="btn small" disabled=${!ok} onClick=${() => { resolveConflict(id, field, side, { reason: reason.trim(), legal }); markGuideDone("conflict"); }}>Record the choice</button>
        <button class="btn ghost small" disabled=${Boolean(sent)} onClick=${() => escalateToLegal(id, field)}>${sent ? `With ${PEOPLE.legal.name} since ${fdate(parseISO(sent.on))}` : `Ask ${PEOPLE.legal.name}, Legal`}</button>
      </div>
      <div class="small muted">Until someone with authority chooses, plan against the earlier date.</div>
    </div>`;
}

function NoticePanel({ v }) {
  const { brief, contract, supplier, today } = v;
  const id = contract.id;
  const decision = contract.record.decision;
  const kind = noticeKindFor(decision.choice, brief.mechanism);
  if (kind === "extension") return html`<${ExtensionPanel} v=${v} />`;
  const letter = draftNotice({ brief, supplier, customerName: contract.custom ? "" : CUSTOMER, choice: decision.choice, today, kind });
  const [sentOn, setSentOn] = useState(toISO(today));
  const [proof, setProof] = useState("");
  const [method, setMethod] = useState("");
  const [deliveredOn, setDeliveredOn] = useState("");
  const [copied, setCopied] = useState(false);
  const { allowed, known } = allowedMethods(brief);
  const draftCheck = method && parseISO(sentOn) ? assessNotice(brief, { sentOn, method, deliveredOn }, today) : null;
  const previous = contract.record.notice;
  const previousCheck = previous ? assessNotice(brief, previous, today) : null;
  return html`
    <div class="stack" style="margin-top:10px">
      <div class="packet">
        <div class="packet-head">
          <div>
            <div class="h3">Notice packet</div>
            <div class="small muted">Filled in by code from confirmed facts. You send it; the tool never contacts the supplier.</div>
          </div>
          <div class="row" style="gap:8px">
            <button class="btn ghost small" onClick=${() => { setCopied(copyText(letter)); }}><${Icon} name="copy" size=${15} />${copied ? "Copied" : "Copy letter"}</button>
            <button class="btn ghost small" onClick=${() => downloadText(letter, `${(supplier.short || supplier.name || "supplier").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-notice.txt`)}><${Icon} name="download" size=${15} />Download</button>
          </div>
        </div>
        <ul class="packet-list">${noticeChecklist(brief).map((line) => html`<li>${line}</li>`)}</ul>
        <details>
          <summary class="small" style="cursor:pointer;font-weight:600">Read the letter</summary>
          <pre class="letter">${letter}</pre>
        </details>
      </div>
      <div class="h3" style="margin-top:6px">After it has gone, record what was sent</div>
      <div class="form-grid">
        <${Field} label="Sent on"><input class="input" type="date" value=${sentOn} onInput=${(e) => setSentOn(e.target.value)} /></${Field}>
        <${Field} label="Sent by">
          <select class="select" value=${method} onChange=${(e) => setMethod(e.target.value)}>
            <option value="">Choose</option>
            ${METHODS.map((m) => html`<option value=${m}>${m}${known && !allowed.includes(m) ? " (not allowed)" : ""}</option>`)}
          </select>
        </${Field}>
        <${Field} label="Proof of sending"><input class="input" value=${proof} onInput=${(e) => setProof(e.target.value)} placeholder="Registered post receipt number" /></${Field}>
        <${Field} label="Delivered on (if known)"><input class="input" type="date" value=${deliveredOn} onInput=${(e) => setDeliveredOn(e.target.value)} /></${Field}>
      </div>
      ${draftCheck && draftCheck.problems.length > 0 && html`<div class="banner bad"><b>This would not count.</b> ${draftCheck.problems.join(" ")} You can still record it, so the record shows what really happened, and it will stay open as an exception.</div>`}
      ${draftCheck && !draftCheck.problems.length && draftCheck.receipt && html`<div class="small" style="color:var(--good)">Counts as received ${fdate(draftCheck.receipt)} (${draftCheck.basis}), before the deadline of ${fdate(brief.dates.cancelBy)}.</div>`}
      ${draftCheck && !draftCheck.problems.length && draftCheck.open.length > 0 && html`<div class="small" style="color:var(--warn)">${draftCheck.open.join(" ")}</div>`}
      <div><button class="btn small" disabled=${!parseISO(sentOn) || proof.trim().length < 3 || !method} onClick=${() => { markNoticeSent(id, { sentOn, proof: proof.trim(), method, deliveredOn }); markGuideDone("notice"); }}>Record what was sent</button></div>
      ${previous && previousCheck && html`<div class="small muted">Already recorded: ${String(previous.method || "method not recorded").toLowerCase()} on ${fdate(parseISO(previous.sentOn))}. ${previousCheck.problems.join(" ") || previousCheck.open.join(" ")}</div>`}
      ${previous && previous.status === "planned" && html`<${ConfirmPosted} key=${`${toISO(today)}-${previous.sentOn}`} id=${id} previous=${previous} today=${today} />`}
    </div>`;
}

// A planned notice turns into a sent one only here: a person says it went, and on which day.
function ConfirmPosted({ id, previous, today }) {
  const planned = parseISO(previous.sentOn);
  const [postedOn, setPostedOn] = useState(toISO(planned && planned <= today ? planned : today));
  const [proof, setProof] = useState(previous.proof || "");
  const future = !parseISO(postedOn) || parseISO(postedOn) > today;
  return html`
    <div class="confirm-posted">
      <div class="h3">Confirm it was posted</div>
      <p class="small muted">Planned for ${fdate(planned)}. Only confirm once it has actually gone; until then the notice counts as not sent.</p>
      <div class="form-grid">
        <${Field} label="Posted on"><input class="input" type="date" value=${postedOn} max=${toISO(today)} onInput=${(e) => setPostedOn(e.target.value)} /></${Field}>
        <${Field} label="Proof of posting"><input class="input" value=${proof} onInput=${(e) => setProof(e.target.value)} placeholder="Registered post receipt number" /></${Field}>
      </div>
      ${future && html`<div class="small" style="color:var(--warn)">The posting date cannot be after today.</div>`}
      <div><button class="btn small" disabled=${future || proof.trim().length < 3} onClick=${() => confirmNoticePosted(id, { postedOn, proof: proof.trim() })}>Confirm it was posted</button></div>
    </div>`;
}

function ExtensionPanel({ v }) {
  const { brief, contract, today } = v;
  const id = contract.id;
  const [signedOn, setSignedOn] = useState(toISO(today));
  const [ref, setRef] = useState("");
  return html`
    <div class="stack" style="margin-top:10px">
      <ul class="small" style="margin:0;padding-left:18px">
        <li>This contract does not renew by itself. Keeping the supplier needs an extension signed by both sides before ${fdate(brief.dates.termEnd, true)}.</li>
        <li>Once signed, add it to this contract family as an amendment, so the new term is read and checked like the rest.</li>
        <li>This tool never contacts the supplier.</li>
      </ul>
      <div class="row" style="align-items:flex-end">
        <${Field} label="Signed on"><input class="input" type="date" value=${signedOn} onInput=${(e) => setSignedOn(e.target.value)} /></${Field}>
        <${Field} label="Reference"><input class="input" value=${ref} onInput=${(e) => setRef(e.target.value)} placeholder="Extension letter reference" /></${Field}>
      </div>
      <div><button class="btn small" disabled=${!parseISO(signedOn) || ref.trim().length < 3} onClick=${() => { markNoticeSent(id, { sentOn: signedOn, proof: ref.trim(), kind: "extension" }); markGuideDone("notice"); }}>Record the signed extension</button></div>
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
            <tr id=${`fact-${f.key}`}>
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
                ${f.rejected && html`<div class="rejected"><div class="small muted" style="margin-top:8px">${f.rejected.label}: ${f.rejected.reading}</div><${Passage} evidence=${f.rejected.evidence} documents=${documents} /></div>`}
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
    <details class="panel calc-panel">
      <summary class="h2">How the dates were worked out</summary>
      <p class="small muted" style="margin-top:2px">Plain code, not the model. ${brief.dates ? "" : "These are provisional and shown only so you can see the arithmetic."}</p>
      <ol class="calc">${brief.calc.map((line) => html`<li>${line}</li>`)}</ol>
      ${brief.assumptions.length > 0 && html`<div class="banner" style="margin-top:10px">${brief.assumptions.map((a) => html`<div>${a}</div>`)}</div>`}
      <p class="small muted" style="margin-top:10px">House rule for time to decide, by category: ${Object.entries(LEAD_DAYS).map(([k, n]) => `${k} ${n} days`).join(", ")}. This is an assumption about the company, listed in About.</p>
    </details>`;
}

function Changes({ brief, documents }) {
  return html`
    <div class="panel info">
      <h2 class="h2">Changed by a later document</h2>
      <p class="small muted" style="margin-top:2px">The first passage is real and still in the file. It no longer governs.</p>
      ${brief.changes.map((c) => html`
        <div class="change">
          <div><b>${cap(FIELD_LABEL[c.field] || c.field)}:</b> <s class="muted">${c.earlier}</s> now <b>${c.later}</b></div>
          <div class="small" style="color:var(--ink-2)">${c.governs === "later_document" ? "The later document governs." : c.governs === "earlier_document" ? "The earlier document still governs." : "It is unclear which governs."} ${c.basis}</div>
          ${c.governs === "later_document"
            ? html`<div class="rejected"><div class="small muted" style="margin-top:8px">Before, no longer governs</div><${Passage} evidence=${c.earlierEvidence} documents=${documents} /></div>
                <div class="small muted" style="margin-top:10px">Now</div><${Passage} evidence=${c.laterEvidence} documents=${documents} />`
            : html`<${Passage} evidence=${c.earlierEvidence} documents=${documents} /><${Passage} evidence=${c.laterEvidence} documents=${documents} />`}
        </div>`)}
    </div>`;
}

function Missing({ brief, documents }) {
  return html`
    <div class="panel warn" id="missing-docs">
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
