import { html, useState, useStore, go, fdate, daysText, Tone } from "./common.js";
import { Icon } from "./icons.js";
import { daysBetween } from "../core/dates.js";
import { allViews, suppliersWithoutContract, SUPPLIER_MASTER, readAllUnread, PEOPLE } from "../store.js";
import { formatMoney, MECHANISM_LABEL } from "../core/rules.js";
import { BAND_LABEL } from "../core/workflow.js";
import { sizeUp } from "../core/sizing.js";

const SIZED = sizeUp();

const FILTERS = [
  ["now", "Act now", "bolt"],
  ["answer", "Needs an answer", "help"],
  ["blocked", "Conflict or not found", "alert"],
  ["auto", "Renews automatically", "repeat"],
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
  const actNow = views.filter((v) => v.band === 0).length;
  const today = views[0]?.today;
  const next = views
    .filter((v) => v.brief?.outcome === "confirmed" && v.brief.dates?.sendBy && today && v.brief.dates.sendBy >= today)
    .sort((a, b) => a.brief.dates.sendBy - b.brief.dates.sendBy)[0];
  const noContractValue = noContract.reduce((n, s) => n + (s.annualValue || 0), 0);

  return html`
    <div class="page">
      <div class="page-head">
        <div>
          <h1 class="h1">Renewals, by the last day you can still say no</h1>
          <p class="lede">Every signed supplier contract, with its safe send date, what silence would cost, and the passage that proves it.</p>
          <p class="scale-note">A sample of ${SUPPLIER_MASTER.length} suppliers. The company in the brief has 2,500: at my assumed sizes, about ${SIZED.due} automatic renewals a year, ${SIZED.perMonth} a month. <a href="#/about/problem">How I sized it</a></p>
        </div>
        <div class="row">
          <a class="btn ghost" href="#/tracker"><${Icon} name="check" size=${16} />Check your tracker</a>
          <a class="btn" href="#/add"><${Icon} name="plus" size=${16} />Add a contract</a>
        </div>
      </div>

      ${state.role === "owner" && html`<div class="banner info" style="margin-top:18px">You are seeing the full portfolio, as procurement keeps it. Your own items, ${state.ownerName}, are in <a href="#/owner">Your inbox</a>.</div>`}

      <div class="kpis">
        <button class=${`kpi bad ${filter === "now" ? "on" : ""}`} onClick=${() => setFilter(filter === "now" ? "" : "now")} aria-pressed=${filter === "now"}>
          <span class="kpi-l"><${Icon} name="bolt" size=${15} />Act now</span><span class="kpi-v">${actNow}</span><span class="kpi-n">${actNow === 1 ? "contract" : "contracts"} need action this week or are overdue</span>
        </button>
        <div class="kpi">
          <span class="kpi-l"><${Icon} name="rupee" size=${15} />Committed if nobody acts</span><span class="kpi-v">${formatMoney(atStake)}</span><span class="kpi-n">across the first two groups below</span>
        </div>
        <div class="kpi">
          <span class="kpi-l"><${Icon} name="send" size=${15} />Next safe send date</span><span class="kpi-v">${next ? fdate(next.brief.dates.sendBy) : "None"}</span><span class="kpi-n">${next ? html`<a href=${`#/c/${next.contract.id}`}>${next.supplier.short || next.supplier.name}</a>, ${daysText(today, next.brief.dates.sendBy)}` : "No confirmed date ahead"}</span>
        </div>
        <a class="kpi warn" href="#/" onClick=${(e) => { e.preventDefault(); document.getElementById("no-contract")?.scrollIntoView({ block: "start", behavior: "smooth" }); }}>
          <span class="kpi-l"><${Icon} name="nofile" size=${15} />No contract on file</span><span class="kpi-v">${noContract.length}</span><span class="kpi-n">suppliers, ${formatMoney(noContractValue)} paid last year</span>
        </a>
      </div>

      <div class="start">
        <div class="start-text">
          <p class="start-q">When did deliveries actually begin?</p>
          <p>Kestrelway's renewal depends on a date that is not in the signed contract. See what the tool does instead of guessing. About four minutes.</p>
        </div>
        <div class="start-actions">
          <a class="btn" href="#/c/kestrelway">Start with Kestrelway</a>
          <a class="start-alt" href="#/both">Or see both people at once</a>
        </div>
      </div>

      ${unread > 0 && html`
        <div class="banner info" style="margin-top:14px">
          <strong>${unread} contract${unread === 1 ? " has" : "s have"} not been read yet.</strong>
          ${views.some((v) => v.contract.reading) ? " Reading now, one at a time. Each takes about 10 to 60 seconds." : html` <button class="linkbtn" onClick=${readAllUnread}>Read ${unread === 1 ? "it" : "them"} with the live model</button>`}
        </div>`}

      <div class="toolbar">
        <label class="searchbox">
          <${Icon} name="search" size=${17} />
          <input class="input search" type="search" placeholder="Search suppliers, owners or contract text" value=${q} onInput=${(e) => setQ(e.target.value)} aria-label="Search suppliers, owners, terms and contract text" />
        </label>
        <div class="chips" role="group" aria-label="Filter">
          ${FILTERS.map(([key, label, icon]) => {
            const n = views.filter((v) => matchFilter(v, key)).length;
            return html`<button class=${`chip chip-${key} ${filter === key ? "on" : ""}`} aria-pressed=${filter === key} onClick=${() => setFilter(filter === key ? "" : key)}><${Icon} name=${icon} size=${15} /><span>${label}</span><span class="chip-n">${n}</span></button>`;
          })}
          ${filter && html`<button class="chip chip-clear" onClick=${() => setFilter("")}><${Icon} name="close" size=${14} /><span>Clear</span></button>`}
        </div>
        <span class="toolbar-note">${(q || filter)
          ? html`Showing ${rows.length} of ${views.length}.${rows.length === 0 ? " Nothing matched in the uploaded text." : ""}`
          : `${views.length} contracts, ${docCount} documents${missingDocs.length ? `, ${missingDocs.length} referred documents missing` : ""}. Search covers uploaded text only.`}</span>
      </div>

      ${bands.map((group, b) => group.length > 0 && html`
        <section class="band">
          <h2 class="band-title"><span class=${`band-dot b${b}`}></span>${BAND_LABEL[b]} <span class="count">${group.length}</span></h2>
          <div class="cards">
            ${group.map(({ v, m }) => html`<${Card} v=${v} where=${q ? m.where : ""} />`)}
          </div>
        </section>`)}

      ${!q && !filter && noContract.length > 0 && html`
        <section class="band" id="no-contract">
          <h2 class="band-title"><span class="band-dot nc"></span>Paid last year, no contract on file <span class="count">${noContract.length}</span></h2>
          <p class="band-note">Nothing here can say when these renew. That is a gap in the repository, not a finding about the supplier.</p>
          <div class="cards">
            ${noContract.map((s) => html`
              <article class="rcard nc">
                <div class="rc-top"><div class="rc-count"><span class="rc-num none">No contract</span></div></div>
                <h3 class="rc-name">${s.short || s.name}</h3>
                <div class="rc-sub">${s.appliesTo}. Owner <b>${s.owner}</b></div>
                <div class="rc-money"><div><span>Paid last year</span><b>${formatMoney(s.annualValue)}</b></div></div>
                <div class="rc-foot"><a class="btn ghost small" href=${`#/add/${s.id}`}>Add the signed contract</a></div>
              </article>`)}
          </div>
        </section>`}

      <p class="footer">Sample data. Every company, person and figure here is invented. The payments file is a labelled sample standing in for the accounts payable system.</p>
    </div>`;
}

function cap(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

// Bold the people named in a sentence, so who acts next is visible at a glance.
export function emph(text, names) {
  const list = [...new Set(names.filter(Boolean))].sort((a, b) => b.length - a.length);
  if (!text || !list.length) return text;
  const re = new RegExp(`(${list.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return String(text).split(re).map((part) => (list.includes(part) ? html`<b>${part}</b>` : part));
}

// The countdown that leads each card: days to the safe send date, or why there is none.
function countdown(v) {
  const { brief, today } = v;
  if (!brief) return { num: v.contract.reading ? "Reading" : "Not read", unit: "", line: "", tone: "none" };
  const d = brief.dates;
  const p = brief.provisional?.dates;
  const days = (to) => daysBetween(today, to);
  if (brief.outcome === "confirmed" && d) {
    if (d.expired) return { num: "Ended", unit: "", line: `Term ended ${fdate(d.termEnd)}`, tone: "bad" };
    if (d.windowClosed) return { num: "Closed", unit: "", line: `Notice had to arrive by ${fdate(d.cancelBy)}`, tone: "bad" };
    if (today > d.sendBy) return { num: "Today", unit: "send now", line: `Must arrive by ${fdate(d.cancelBy)}`, tone: "bad" };
    const n = days(d.sendBy);
    return { num: String(n), unit: n === 1 ? "day to send notice" : "days to send notice", line: `Send by ${fdate(d.sendBy, true)}. Must arrive by ${fdate(d.cancelBy)}`, tone: n <= 14 ? "bad" : n <= 45 ? "warn" : "good", pct: Math.max(4, Math.min(100, 100 - (n / 120) * 100)) };
  }
  if (brief.outcome === "ends" && d) {
    if (today > d.termEnd) return { num: "Ended", unit: "", line: `Ended ${fdate(d.termEnd)}`, tone: "bad" };
    const n = days(d.termEnd);
    return { num: String(n), unit: n === 1 ? "day until it ends" : "days until it ends", line: `Ends ${fdate(d.termEnd, true)}. No automatic renewal`, tone: n <= 30 ? "warn" : "good", pct: Math.max(4, Math.min(100, 100 - (n / 120) * 100)) };
  }
  if (brief.outcome === "provisional") {
    const n = p?.sendBy ? days(p.sendBy) : null;
    return { num: n !== null ? `${n}?` : "Unknown", unit: n !== null ? "days, if the guess holds" : "", line: p?.sendBy ? `Provisional send-by ${fdate(p.sendBy)}. Not confirmed` : "No date can be worked out yet", tone: "prov" };
  }
  if (brief.outcome === "no_deadline") return { num: "None", unit: "", line: "No renewal date. Runs until terminated", tone: "good" };
  const alts = brief.alternatives.filter((a) => a.dates?.sendBy);
  return { num: "No date", unit: "", line: alts.length ? `Send by ${alts.map((a) => fdate(a.dates.sendBy)).join(" or ")}, depending on the reading` : "No date can be confirmed from these documents", tone: "bad" };
}

function Card({ v, where }) {
  const { contract, supplier, brief, flow } = v;
  const open = () => go(`#/c/${contract.id}`);
  const c = countdown(v);
  const owner = contract.record.ownerOverride || supplier.owner;
  const names = [owner, PEOPLE.procurement.name, PEOPLE.escalation.name, PEOPLE.legal?.name];
  const s = brief?.silence;
  return html`
    <article class=${`rcard t-${c.tone}`} onClick=${open} tabindex="0" onKeyDown=${(e) => { if (e.key === "Enter") open(); }} aria-label=${`${supplier.short || supplier.name}: ${c.num} ${c.unit}`}>
      <div class="rc-count"><span class=${`rc-num ${/^\d+\??$/.test(c.num) ? "" : "word"}`}>${c.num}</span>${c.unit && html`<span class="rc-unit">${c.unit}</span>`}</div>
      <div class="rc-line">${c.line}.</div>
      ${c.pct !== undefined && html`<div class="rc-bar" aria-hidden="true"><span style=${`width:${c.pct}%`}></span></div>`}
      <h3 class="rc-name"><a href=${`#/c/${contract.id}`} onClick=${(e) => e.stopPropagation()}>${supplier.short || supplier.name}</a></h3>
      <div class="rc-sub">${supplier.appliesTo ? `${supplier.appliesTo}. ` : ""}Owner <b>${owner}</b></div>
      ${where && html`<div class="rc-sub">Matched in ${where}</div>`}
      <div class="rc-money">
        <div><span>Annual value</span><b>${supplier.annualValue ? formatMoney(supplier.annualValue, supplier.currency) : "Not given"}</b></div>
        <div><span>If nobody acts</span>${s?.amount ? html`<b>${formatMoney(s.amount, supplier.currency)}</b>` : html`<em>${s ? cap(s.text.replace(/^If nobody acts, /, "").split(". ")[0].replace(/\.$/, "")) : ""}</em>`}</div>
      </div>
      ${flow && html`<div class="rc-next"><${Tone} tone=${flow.tone}>${flow.label}</${Tone}><div>${emph(flow.detail, names)}${flow.stage === "window_closed" ? (v.contract.record.missed ? " Cost recorded for Finance." : " Not yet recorded for Finance.") : ""}</div></div>`}
    </article>`;
}
