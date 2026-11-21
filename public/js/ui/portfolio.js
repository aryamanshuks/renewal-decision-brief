import { html, useState, useStore, go, fdate, daysText, Tone } from "./common.js";
import { allViews, suppliersWithoutContract, SUPPLIER_MASTER, readAllUnread } from "../store.js";
import { formatMoney, MECHANISM_LABEL } from "../core/rules.js";
import { BAND_LABEL } from "../core/workflow.js";

const FILTERS = [
  ["auto", "Renews automatically"],
  ["answer", "Needs an answer"],
  ["blocked", "Conflict or not found"],
  ["now", "Act now"],
];

function matchText(view, q) {
  if (!q) return { hit: true, where: "" };
  const needle = q.toLowerCase();
  const { supplier, brief, contract } = view;
  const fields = [supplier.name, supplier.owner, supplier.category, supplier.appliesTo];
  if (fields.some((f) => String(f || "").toLowerCase().includes(needle))) return { hit: true, where: "" };
  if (brief) {
    for (const f of brief.facts) {
      if (`${f.label} ${f.value} ${f.note}`.toLowerCase().includes(needle)) return { hit: true, where: `${f.label}: ${f.value}` };
    }
    if ((MECHANISM_LABEL[brief.mechanism] || "").toLowerCase().includes(needle)) return { hit: true, where: MECHANISM_LABEL[brief.mechanism] };
  }
  for (const d of contract.documents) {
    const at = d.text.toLowerCase().indexOf(needle);
    if (at !== -1) {
      const from = Math.max(0, at - 60);
      const to = Math.min(d.text.length, at + needle.length + 80);
      return { hit: true, where: `${d.name}: "${from > 0 ? "…" : ""}${d.text.slice(from, to).replace(/\s+/g, " ")}${to < d.text.length ? "…" : ""}"` };
    }
  }
  return { hit: false, where: "" };
}

function matchFilter(view, filter) {
  if (!filter) return true;
  const { brief, flow, band } = view;
  if (!brief) return false;
  if (filter === "auto") return brief.mechanism === "automatic";
  if (filter === "answer") return flow.stage === "question" || flow.stage === "check_answer";
  if (filter === "blocked") return flow.stage === "blocked";
  if (filter === "now") return band === 0;
  return true;
}

export function Portfolio() {
  const state = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const views = allViews(state);
  const rows = views
    .map((v) => ({ v, m: matchText(v, q.trim()) }))
    .filter(({ v, m }) => m.hit && matchFilter(v, filter));
  rows.sort((a, b) => a.v.band - b.v.band || (b.v.supplier.annualValue || 0) - (a.v.supplier.annualValue || 0));

  const noContract = suppliersWithoutContract(state);
  const docCount = views.reduce((n, v) => n + v.contract.documents.length, 0);
  const missingDocs = views.flatMap((v) => (v.brief ? v.brief.missing.map((m) => `${v.supplier.short || v.supplier.name}: ${m.name}`) : []));
  const unread = views.filter((v) => !v.brief).length;
  const atStake = views.reduce((n, v) => n + (v.brief && v.band <= 1 && v.brief.silence.amount ? v.brief.silence.amount : 0), 0);
  const bands = [0, 1, 2, 3].map((b) => rows.filter((r) => r.v.band === b));

  return html`
    <div class="page">
      <div class="spread">
        <div>
          <h1 class="h1">Every supplier contract, by the last date you can still say no</h1>
          <p class="lede">For each signed contract: the last safe date to stop it renewing, what silence would cost, and the passage that proves it. Ranked by urgency, then by annual value.</p>
        </div>
        <a class="btn ghost" href="#/add">Add a contract</a>
      </div>

      <div class="intro">
        <div class="demo-card">
          <p class="q">When did deliveries actually begin?</p>
          <p>Kestrelway's renewal date depends on a fact that is not in the signed contract. Open it to see what the tool does instead of guessing. The guided demo takes about four minutes.</p>
          <div class="row">
            <a class="btn" href="#/c/kestrelway">Open Kestrelway</a>
            <span class="small muted">Or read <a href="#/about">About this prototype</a> and the <a href="#/tests">test bench</a>.</span>
          </div>
        </div>
        <div class="coverage">
          <h2 class="h3">What this view covers</h2>
          <ul>
            <li><strong>${views.length} contract ${views.length === 1 ? "family" : "families"}</strong> on file, ${docCount} documents${unread ? `, ${unread} not read yet` : ", all read in full"}.</li>
            ${noContract.length > 0 && html`<li class="alert"><strong>${noContract.length} supplier${noContract.length === 1 ? "" : "s"} paid last year</strong> with no contract here, out of ${SUPPLIER_MASTER.length} in the payments file.</li>`}
            ${missingDocs.length > 0 && html`<li><strong>${missingDocs.length} referred document${missingDocs.length === 1 ? "" : "s"}</strong> not on file. Each brief names ${missingDocs.length === 1 ? "it" : "them"}.</li>`}
            ${atStake > 0 && html`<li><strong>${formatMoney(atStake)}</strong> committed by silence in the first two groups below.</li>`}
          </ul>
        </div>
      </div>

      ${unread > 0 && html`
        <div class="banner info" style="margin-top:14px">
          <strong>${unread} contract${unread === 1 ? " has" : "s have"} not been read yet.</strong>
          ${views.some((v) => v.contract.reading) ? " Reading now, one at a time. Each takes about 10 to 60 seconds." : html` <button class="linkbtn" onClick=${readAllUnread}>Read ${unread === 1 ? "it" : "them"} with the live model</button>`}
        </div>`}

      <div class="toolbar">
        <input class="input" type="search" placeholder="Search suppliers, owners, terms and contract text" value=${q} onInput=${(e) => setQ(e.target.value)} aria-label="Search" />
        <div class="chips" role="group" aria-label="Filter">
          ${FILTERS.map(([key, label]) => html`<button class=${`chip ${filter === key ? "on" : ""}`} aria-pressed=${filter === key} onClick=${() => setFilter(filter === key ? "" : key)}>${label}</button>`)}
        </div>
      </div>
      <p class="small muted" style="margin-top:8px">${(q || filter)
        ? html`Showing ${rows.length} of ${views.length} contracts on file.${rows.length === 0 ? " Nothing matched in the uploaded text." : ""} Not searched: ${noContract.length} paid supplier${noContract.length === 1 ? "" : "s"} with no contract on file${missingDocs.length ? `, and ${missingDocs.length} referred document${missingDocs.length === 1 ? "" : "s"} that ${missingDocs.length === 1 ? "is" : "are"} not on file` : ""}.`
        : "Search and filters see only what has been uploaded, so no match never means no such term."}</p>

      ${bands.map((group, b) => group.length > 0 && html`
        <section class="band">
          <h2 class="band-title">${BAND_LABEL[b]} <span class="count">${group.length}</span></h2>
          <table class="reg">
            <thead><tr><th scope="col">Send notice by</th><th scope="col">Supplier and owner</th><th scope="col">Annual value</th><th scope="col">If nobody acts</th><th scope="col">Next action</th></tr></thead>
            <tbody>
              ${group.map(({ v, m }) => html`<${Row} v=${v} where=${q ? m.where : ""} />`)}
            </tbody>
          </table>
        </section>`)}

      ${!q && !filter && noContract.length > 0 && html`
        <section class="band">
          <h2 class="band-title">Paid last year, no contract on file <span class="count">${noContract.length}</span></h2>
          <table class="reg">
            <thead><tr><th scope="col">Renewal status</th><th scope="col">Supplier and owner</th><th scope="col">Paid last year</th><th scope="col">What this means</th><th scope="col">Next action</th></tr></thead>
            <tbody>
              ${noContract.map((s) => html`
                <tr>
                  <td class="c-date"><div class="day none">No contract on file</div></td>
                  <td class="c-sup"><div class="sup">${s.short || s.name}</div><div class="detail">${s.appliesTo}. ${s.owner}</div></td>
                  <td class="c-val"><div class="money">${formatMoney(s.annualValue)}</div><div class="detail">a year</div></td>
                  <td class="c-sil" data-label="What this means"><div class="detail" style="margin-top:0">Nothing here can say when it renews. That is a gap in the repository, not a finding about the supplier.</div></td>
                  <td class="c-next" data-label="Next action"><a class="btn ghost small" href=${`#/add/${s.id}`}>Add the signed contract</a></td>
                </tr>`)}
            </tbody>
          </table>
        </section>`}

      <p class="footer">Sample data. Every company, person and figure here is invented. The payments file is a labelled sample standing in for the accounts payable system.</p>
    </div>`;
}

function cap(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function Silence({ brief, supplier }) {
  const s = brief.silence;
  const what = cap(s.text.replace(/^If nobody acts, /, ""));
  if (s.amount) return html`<div class="money">${formatMoney(s.amount, supplier.currency)}</div><div class="detail">${what}</div>`;
  return html`<div class="detail" style="margin-top:0">${what}${s.amountText ? ` ${cap(s.amountText)}.` : ""}</div>`;
}

function DayCell({ date, cls = "", children }) {
  const [d, m, y] = fdate(date).split(" ");
  return html`<div class=${`day ${cls}`}>${d} ${m}<span class="yr">${y}</span></div>${children}`;
}

function Row({ v, where }) {
  const { contract, supplier, brief, flow, today } = v;
  const open = () => go(`#/c/${contract.id}`);
  const d = brief?.dates;
  const p = brief?.provisional?.dates;
  let dateCell;
  if (!brief) {
    dateCell = html`<div class="day none">${contract.reading ? html`<span class="spinner"></span> Reading` : "Not read yet"}</div>`;
  } else if (brief.outcome === "confirmed" && d) {
    dateCell = d.windowClosed || d.expired
      ? html`<${DayCell} date=${d.expired ? d.termEnd : d.cancelBy} cls="late"><div class="when late">${d.expired ? "Term ended" : "Window closed"} ${daysText(today, d.expired ? d.termEnd : d.cancelBy)}</div></${DayCell}>`
      : today > d.sendBy
        ? html`<${DayCell} date=${d.cancelBy} cls="late"><div class="when late">Send today. Must arrive by this date.</div></${DayCell}>`
        : html`<${DayCell} date=${d.sendBy}><div class="when">${cap(daysText(today, d.sendBy))}${brief.mechanism === "customer_must_give_notice_to_renew" ? ", to renew" : ""}. Must arrive by ${fdate(d.cancelBy)}.</div></${DayCell}>`;
  } else if (brief.outcome === "ends" && d) {
    dateCell = today > d.termEnd
      ? html`<${DayCell} date=${d.termEnd} cls="late"><div class="when late">Ended ${daysText(today, d.termEnd)}.</div></${DayCell}>`
      : html`<${DayCell} date=${d.termEnd}><div class="when">Ends. No automatic renewal.</div></${DayCell}>`;
  } else if (brief.outcome === "provisional") {
    dateCell = p?.sendBy
      ? html`<${DayCell} date=${p.sendBy} cls="prov"><div class="when prov">Provisional. Not confirmed.</div></${DayCell}>`
      : html`<div class="day none">Date not known</div><div class="when prov">Provisional. Not confirmed.</div>`;
  } else if (brief.outcome === "no_deadline") {
    dateCell = html`<div class="day none">No renewal date</div><div class="when">Runs until terminated.</div>`;
  } else {
    const alts = brief.alternatives.filter((a) => a.dates?.sendBy);
    dateCell = html`<div class="day none late">No confirmed date</div>${alts.length > 0 && html`<div class="when">Send by ${alts.map((a) => fdate(a.dates.sendBy)).join(" or ")}, depending on the reading.</div>`}`;
  }
  return html`
    <tr class="rowlink" onClick=${open} tabindex="0" onKeyDown=${(e) => { if (e.key === "Enter") open(); }}>
      <td class="c-date">${dateCell}</td>
      <td class="c-sup">
        <div class="sup"><a href=${`#/c/${contract.id}`} onClick=${(e) => e.stopPropagation()}>${supplier.short || supplier.name}</a></div>
        <div class="detail">${supplier.appliesTo ? `${supplier.appliesTo}. ` : ""}${contract.record.ownerOverride || supplier.owner}</div>
        ${where && html`<div class="detail">Matched in ${where}</div>`}
      </td>
      <td class="c-val"><div class="money">${supplier.annualValue ? formatMoney(supplier.annualValue, supplier.currency) : "Value not given"}</div><div class="detail">${supplier.annualValue ? "a year" : ""}</div></td>
      <td class="c-sil" data-label="If nobody acts">${brief && html`<${Silence} brief=${brief} supplier=${supplier} />`}</td>
      <td class="c-next" data-label="Next action">${flow && html`<${Tone} tone=${flow.tone}>${flow.label}</${Tone}><div class="detail">${flow.detail}</div>`}</td>
    </tr>`;
}
