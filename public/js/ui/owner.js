import { html, useStore, go, fdate, Tone, Passage } from "./common.js";
import { allViews, owners, setOwnerName, PEOPLE } from "../store.js";
import { formatMoney } from "../core/rules.js";

// The budget owner's side of the same record. Email is simulated: this page shows what the message would say.
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

  return html`
    <div class="page page-narrow">
      <h1 class="h1">Waiting for you, ${me.split(" ")[0]}</h1>
      <p class="lede">You hold the budget for these suppliers. Procurement keeps the record. You are asked only for what the documents cannot say, and for the decision.</p>
      <div class="row" style="margin-top:12px">
        <label class="small muted" for="who">Acting as</label>
        <select id="who" class="select" style="max-width:320px" value=${me} onChange=${(e) => setOwnerName(e.target.value)}>
          ${list.map((o) => html`<option value=${o.name}>${o.name}, ${o.title}</option>`)}
        </select>
        <span class="small muted">There is no login in this prototype, so you choose who you are.</span>
      </div>

      ${waiting.length === 0 && html`<div class="panel" style="margin-top:18px"><b>Nothing is waiting for you.</b><div class="small muted" style="margin-top:4px">Pick another owner above, or go back to the portfolio as procurement.</div></div>`}

      ${waiting.map((v) => html`
        <div class="email" style="margin-top:18px">
          <div class="email-head">
            Simulated email. From: ${PEOPLE.procurement.name}, ${PEOPLE.procurement.title}. To: ${me}.
            ${v.flow.due ? ` Reply by ${fdate(v.flow.due)}.` : ""}
            ${v.flow.overdue ? html` <${Tone} tone="bad">Overdue, copied to ${v.flow.escalatedTo}</${Tone}>` : ""}
          </div>
          <div class="email-body stack">
            <div class="h3">${v.flow.stage === "question" ? "One question about" : "A decision is needed on"} ${v.supplier.short || v.supplier.name}${v.supplier.annualValue ? ` (${formatMoney(v.supplier.annualValue, v.supplier.currency)} a year)` : ""}</div>
            ${v.flow.stage === "question" && html`
              <div>${v.brief.question.text}</div>
              <div class="small muted">${v.brief.question.why}</div>
              <${Passage} evidence=${v.brief.question.evidence} documents=${v.contract.documents} />`}
            ${v.flow.stage === "decision" && html`
              <div>${v.brief.silence.text} ${v.brief.silence.amountText ? `${v.brief.silence.amountText}.` : ""}</div>
              <div class="small">${v.brief.dates.sendBy ? html`Notice must be sent by <b>${fdate(v.brief.dates.sendBy)}</b> to arrive by ${fdate(v.brief.dates.cancelBy)}.` : html`It ends on <b>${fdate(v.brief.dates.termEnd)}</b>.`} Please decide by <b>${fdate(v.brief.dates.decideBy)}</b>.</div>`}
            <div><button class="btn small" onClick=${() => go(`#/c/${v.contract.id}`)}>${v.flow.stage === "question" ? "Answer in the brief" : "Open the brief and decide"}</button></div>
          </div>
        </div>`)}

      ${others.length > 0 && html`
        <h2 class="h2" style="margin-top:28px">Your other suppliers</h2>
        <table class="table" style="margin-top:8px">
          <tbody>
            ${others.map((v) => html`<tr><td><a href=${`#/c/${v.contract.id}`}>${v.supplier.short || v.supplier.name}</a></td><td><${Tone} tone=${v.flow.tone}>${v.flow.label}</${Tone}></td><td class="small muted">${v.flow.detail}</td></tr>`)}
          </tbody>
        </table>`}
    </div>`;
}
