import { html, useState, useStore, Tone, fdate } from "./common.js";
import { allViews, SUPPLIER_MASTER, today, markGuideDone } from "../store.js";
import { reconcile, parseTable } from "../core/tracker.js";
import { formatMoney } from "../core/rules.js";
import { TRACKER_SAMPLE } from "../../data/tracker-sample.js";

const TONE = { bad: "bad", warn: "warn", good: "quiet" };

export function TrackerCheck() {
  const state = useStore();
  const [text, setText] = useState(TRACKER_SAMPLE);
  const [checked, setChecked] = useState(TRACKER_SAMPLE);
  const [source, setSource] = useState("the sample tracker");
  const [fileError, setFileError] = useState("");

  const views = allViews(state);
  const out = reconcile({ table: parseTable(checked), views, master: SUPPLIER_MASTER, today: today(state) });

  const onFile = async (file) => {
    setFileError("");
    if (!file) return;
    if (/\.xlsx?$/i.test(file.name)) {
      setFileError("Excel files cannot be read here. In Excel, use File, Save a copy, CSV. Or copy the cells and paste them below.");
      return;
    }
    if (file.size > 500000) {
      setFileError("That file is larger than a renewal tracker should be. Paste the rows you want checked instead.");
      return;
    }
    const t = await file.text();
    setText(t);
    setChecked(t);
    setSource(file.name);
    markGuideDone("tracker");
  };

  return html`
    <div class="page">
      <div class="crumbs"><a href="#/">Portfolio</a> / Check your tracker</div>
      <h1 class="h1">Check the renewal tracker you keep today</h1>
      <p class="lede">Procurement already keeps an Excel sheet of renewal dates, and acts on it. Paste it here and each row is checked against what the signed contract on file proves. This works on day one, before anyone changes how they work.</p>

      <div class="panel" style="margin-top:22px">
        <div class="spread">
          <div>
            <h2 class="h3">Your tracker</h2>
            <p class="small muted" style="margin-top:2px">Copy the cells from Excel, header row included, and paste. Or upload a CSV. Dates are read day first, as in 19/03/2027.</p>
          </div>
          <div class="row">
            <button class="btn ghost small" onClick=${() => { setText(TRACKER_SAMPLE); setChecked(TRACKER_SAMPLE); setSource("the sample tracker"); }}>Use the sample tracker</button>
            <a class="btn ghost small" href="/data/renewal-tracker-sample.csv" download>Download the sample as CSV</a>
          </div>
        </div>
        <div class="tracker-input">
          <textarea class="textarea sheet-input" aria-label="Tracker rows" value=${text} onInput=${(e) => setText(e.target.value)} spellcheck="false"></textarea>
          <div class="stack">
            <${UploadField} onFile=${onFile} />
            ${fileError && html`<div class="banner bad small">${fileError}</div>`}
            <button class="btn" onClick=${() => { setChecked(text); setSource(text === TRACKER_SAMPLE ? "the sample tracker" : "your pasted rows"); markGuideDone("tracker"); }}>Check these rows</button>
            <p class="small muted">Plain code does this check, not the AI model. The rows stay in your browser.</p>
          </div>
        </div>
      </div>

      ${out.error
        ? html`<div class="banner bad" style="margin-top:16px"><strong>${out.error}</strong>${out.header ? html` Columns seen: ${out.header.join(", ") || "none"}.` : ""}</div>`
        : html`<${Results} out=${out} source=${source} />`}
    </div>`;
}

function UploadField({ onFile }) {
  return html`<label class="field"><span>Upload a CSV</span><input class="input" type="file" accept=".csv,.tsv,.txt,text/csv,.xlsx,.xls" onChange=${(e) => onFile(e.target.files[0])} /></label>`;
}

function trackerSays(row) {
  const parts = [];
  if (row.notice) parts.push(html`<div>Notice by <b>${fdate(row.notice)}</b></div>`);
  else if (row.noticeText) parts.push(html`<div>Notice: <b>${row.noticeText}</b> <span class="small" style="color:var(--bad)">(not a date it can read)</span></div>`);
  else parts.push(html`<div class="muted">No notice date</div>`);
  if (row.end) parts.push(html`<div class="detail">Ends ${fdate(row.end)}</div>`);
  else if (row.endText) parts.push(html`<div class="detail">Ends: ${row.endText}</div>`);
  if (row.autoText) parts.push(html`<div class="detail">Auto-renews: ${row.autoText}</div>`);
  return parts;
}

function Results({ out, source }) {
  const s = out.summary;
  const colNames = Object.entries(out.cols).filter(([, i]) => i !== -1).map(([k, i]) => `${out.header[i]} as ${({ supplier: "supplier", notice: "notice date", end: "end date", auto: "renewal type", owner: "owner", value: "value" })[k]}`);
  return html`
    <section style="margin-top:28px">
      <h2 class="h2">What the contracts say about ${source}</h2>
      <div class="tally">
        <div class="tally-item bad"><b>${s.bad}</b><span>${s.bad === 1 ? "row would" : "rows would"} miss or mislead a renewal</span></div>
        <div class="tally-item warn"><b>${s.warn}</b><span>cannot be proven from the documents on file</span></div>
        <div class="tally-item good"><b>${s.good}</b><span>${s.good === 1 ? "matches" : "match"} the contract</span></div>
      </div>
      ${s.badValue > 0 && html`<p style="margin-top:10px"><strong>${formatMoney(s.badValue)} a year</strong> of supplier spend sits on the ${s.bad} rows that are wrong. Sample figures, all invented.</p>`}
      <p class="small muted" style="margin-top:6px">Read ${s.rows} rows. Columns used: ${colNames.join("; ")}.${out.unreadable.length ? ` Could not read a date on line ${out.unreadable.join(", ")}.` : ""}</p>

      <table class="reg" style="margin-top:14px">
        <thead><tr><th scope="col">Supplier</th><th scope="col">Tracker says</th><th scope="col">The contract proves</th><th scope="col" colspan="2">Verdict</th></tr></thead>
        <tbody>
          ${out.results.map((r) => html`
            <tr>
              <td class="c-sup"><div class="sup">${r.view ? html`<a href=${`#/c/${r.view.contract.id}`}>${r.row.supplier}</a>` : r.row.supplier}</div>${r.row.ownerText && html`<div class="detail">${r.row.ownerText}</div>`}</td>
              <td class="c-tr" data-label="Tracker says" style="width:18%">${trackerSays(r.row)}</td>
              <td class="c-sil" data-label="The contract proves">${r.proves ? html`<div>${r.proves}</div>` : html`<div class="muted">Nothing</div>`}</td>
              <td class="c-next" colspan="2" data-label="Verdict">
                <${Tone} tone=${TONE[r.severity]}>${r.label}</${Tone}>
                <div class="detail">${r.detail}</div>
                ${r.view ? html`<div class="detail"><a href=${`#/c/${r.view.contract.id}`}>Open the brief</a></div>` : r.supplier ? html`<div class="detail"><a href=${`#/add/${r.supplier.id}`}>Add the signed contract</a></div>` : ""}
              </td>
            </tr>`)}
        </tbody>
      </table>

      ${(out.missingFromTracker.length > 0 || out.paidNowhere.length > 0) && html`
        <div class="intro" style="margin-top:18px">
          ${out.missingFromTracker.length > 0 && html`
            <div class="coverage">
              <h3 class="h3">On file, but not in the tracker</h3>
              <ul>${out.missingFromTracker.map((v) => html`<li><a href=${`#/c/${v.contract.id}`}><strong>${v.supplier.short || v.supplier.name}</strong></a>: ${v.brief ? summaryOf(v) : "not read yet"}</li>`)}</ul>
            </div>`}
          ${out.paidNowhere.length > 0 && html`
            <div class="coverage">
              <h3 class="h3">Paid last year, in neither the tracker nor the repository</h3>
              <ul>${out.paidNowhere.map((sup) => html`<li class="alert"><strong>${sup.short || sup.name}</strong>, ${formatMoney(sup.annualValue)} a year. Nobody can say when it renews. <a href=${`#/add/${sup.id}`}>Add the contract</a></li>`)}</ul>
            </div>`}
        </div>`}

      <div class="banner info" style="margin-top:18px">
        <strong>Why this screen exists.</strong> Renewal tools usually start from an empty repository and ask people to change habits first. This one starts from the sheet people already trust, and shows where it is wrong. The same check is the baseline the north star needs: renewals due, reconciled against the tracker and the payments file.
      </div>
    </section>`;
}

function summaryOf(v) {
  const b = v.brief;
  if (b.outcome === "no_deadline") return "no renewal date, runs until terminated";
  if (b.outcome === "confirmed" && b.dates?.cancelBy) return `notice must arrive by ${fdate(b.dates.cancelBy)}`;
  if (b.outcome === "ends" && b.dates?.termEnd) return `ends ${fdate(b.dates.termEnd)}`;
  return "no confirmed date yet";
}
