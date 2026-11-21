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
          <h1 class="h1">Every supplier contract, by the date you can still say no</h1>
          <p class="lede">For each signed contract: the last safe date to stop it renewing, what silence would cost, and the passage that proves it. Ranked by urgency, then by annual value.</p>
        </div>
        <a class="btn" href="#/add">Add a contract</a>
      </div>

      <div class="coverage" style="margin-top:16px">
        <strong>What this view covers.</strong>
        ${" "}${views.length} contract ${views.length === 1 ? "family" : "families"} on file (${docCount} documents${unread ? `, ${unread} not read yet` : ", all read in full"}).
        ${" "}The payments file lists ${SUPPLIER_MASTER.length} suppliers: <strong>${noContract.length} were paid last year with no contract here</strong>.
        ${missingDocs.length ? html` ${missingDocs.length} document${missingDocs.length === 1 ? "" : "s"} that the contracts refer to ${missingDocs.length === 1 ? "is" : "are"} not on file; each brief names them.` : ""}
        ${" "}Search and filters see only what has been uploaded, so "no match" never means "no such term".
        ${atStake > 0 ? html`<div style="margin-top:4px"><strong>${formatMoney(atStake)}</strong> would be committed by silence across the contracts in the first two groups below.</div>` : ""}
      </div>

      ${unread > 0 && html`
        <div class="banner info" style="margin-top:12px">
          <strong>${unread} contract${unread === 1 ? " has" : "s have"} not been read yet.</strong>
          ${views.some((v) => v.contract.reading) ? " Reading now, one at a time. Each takes about 10 to 60 seconds." : html` <button class="linkbtn" onClick=${readAllUnread}>Read ${unread === 1 ? "it" : "them"} with the live model</button>`}
        </div>`}

      <div class="row" style="margin-top:14px">
        <input class="input" style="max-width:360px" type="search" placeholder="Search suppliers, owners, terms and contract text" value=${q} onInput=${(e) => setQ(e.target.value)} aria-label="Search" />
        <div class="chips">
          ${FILTERS.map(([key, label]) => html`<button class=${`chip ${filter === key ? "on" : ""}`} onClick=${() => setFilter(filter === key ? "" : key)}>${label}</button>`)}
        </div>
      </div>
      ${(q || filter) && html`<p class="small muted" style="margin-top:8px">Showing ${rows.length} of ${views.length} contracts on file.${rows.length === 0 ? " Nothing matched in the uploaded text. Suppliers with no contract on file are listed at the bottom and are not searched." : ""}</p>`}

      ${bands.map((group, b) => group.length > 0 && html`
        <section class="band">
          <div class="band-title"><span>${BAND_LABEL[b]}</span><span class="muted" style="font-weight:500">${group.length}</span></div>
          <table class="reg">
            <tbody>
              ${group.map(({ v, m }) => html`<${Row} v=${v} where=${q ? m.where : ""} />`)}
            </tbody>
          </table>
        </section>`)}

      ${!q && !filter && noContract.length > 0 && html`
        <section class="band">
          <div class="band-title"><span>Paid last year, no contract on file</span><span class="muted" style="font-weight:500">${noContract.length}</span></div>
          <table class="reg">
            <tbody>
              ${noContract.map((s) => html`
                <tr>
                  <td class="c-sup"><div class="sup">${s.short || s.name}</div><div class="small muted">${s.appliesTo}. ${s.owner}</div></td>
                  <td class="c-val"><div class="money">${formatMoney(s.annualValue)}</div><div class="small muted">a year</div></td>
                  <td class="c-date" colspan="2"><${Tone} tone="neutral">No contract on file</${Tone}><div class="small muted" style="margin-top:4px">Nothing here can say when it renews. That is a gap in the repository, not a finding about the supplier.</div></td>
                  <td class="c-next"><a href="#/add">Add the signed contract</a></td>
                </tr>`)}
            </tbody>
          </table>
        </section>`}

      <p class="footer">Sample data. Every company, person and figure here is invented. The payments file is a labelled sample standing in for the accounts payable system.</p>
    </div>`;
}

function Row({ v, where }) {
  const { contract, supplier, brief, flow, today } = v;
  const open = () => go(`#/c/${contract.id}`);
  const d = brief?.dates;
  const p = brief?.provisional?.dates;
  let dateCell;
  if (!brief) {
    dateCell = html`<${Tone} tone="neutral">${contract.reading ? "Reading" : "Not read yet"}</${Tone}>`;
  } else if (brief.outcome === "confirmed" && d) {
    dateCell = d.windowClosed || d.expired
      ? html`<div class="date" style="color:var(--bad)">${fdate(d.expired ? d.termEnd : d.cancelBy)}</div><div class="small" style="color:var(--bad)">${d.expired ? "term ended" : "window closed"} ${daysText(today, d.expired ? d.termEnd : d.cancelBy)}</div>`
      : html`<div class="date">${fdate(d.cancelBy)}</div><div class="small muted">${brief.mechanism === "automatic" ? "last date to say no" : "last date to give notice to renew"}, ${daysText(today, d.cancelBy)}</div>`;
  } else if (brief.outcome === "ends" && d) {
    dateCell = html`<div class="date">${fdate(d.termEnd)}</div><div class="small muted">ends, no automatic renewal</div>`;
  } else if (brief.outcome === "provisional") {
    dateCell = html`<div class="date prov">${p?.cancelBy ? fdate(p.cancelBy) : "Date not known"}</div><div class="small" style="color:var(--warn)">provisional, not confirmed</div>`;
  } else if (brief.outcome === "no_deadline") {
    dateCell = html`<div class="date">No renewal date</div><div class="small muted">runs until terminated</div>`;
  } else {
    dateCell = html`<div class="date" style="color:var(--bad)">No confirmed date</div><div class="small muted">${brief.alternatives.filter((a) => a.dates?.cancelBy).map((a) => fdate(a.dates.cancelBy)).join(" or ")}</div>`;
  }
  return html`
    <tr class="rowlink" onClick=${open} tabindex="0" onKeyDown=${(e) => { if (e.key === "Enter") open(); }}>
      <td class="c-sup">
        <div class="sup"><a href=${`#/c/${contract.id}`} onClick=${(e) => e.stopPropagation()}>${supplier.short || supplier.name}</a></div>
        <div class="small muted">${supplier.appliesTo ? `${supplier.appliesTo}. ` : ""}${contract.record.ownerOverride || supplier.owner}</div>
        ${where && html`<div class="small" style="margin-top:4px;color:var(--ink-2)">Matched in ${where}</div>`}
      </td>
      <td class="c-val"><div class="money">${supplier.annualValue ? formatMoney(supplier.annualValue, supplier.currency) : "Value not given"}</div><div class="small muted">${supplier.annualValue ? "a year" : ""}</div></td>
      <td class="c-date">${dateCell}</td>
      <td class="c-sil"><div class="small">${brief ? brief.silence.text : ""}</div>${brief?.silence.amountText && html`<div class="small" style="font-weight:650">${brief.silence.amountText}</div>`}</td>
      <td class="c-next">${flow && html`<${Tone} tone=${flow.tone}>${flow.label}</${Tone}><div class="small muted" style="margin-top:4px">${flow.detail}</div>`}</td>
    </tr>`;
}
