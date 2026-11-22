import { html, useState, useStore, go, Field, Spinner } from "./common.js";
import { addContract, readContract, markGuideDone, SUPPLIER_MASTER } from "../store.js";
import { CATEGORIES, formatMoney } from "../core/rules.js";
import { fileToText } from "../files.js";
import { Icon } from "./icons.js";
import { TEXT_KESTRELWAY, TEXT_KESTRELWAY_PAIR_A, TEXT_KESTRELWAY_INJECTED, TEXT_DRAFT } from "../../data/samples.js";

// Each example says what the right answer looks like, so a reviewer can judge the result.
const PRESETS = [
  { key: "a", label: "Pair A", title: "Term from a written date", expect: "Should confirm a date.", text: TEXT_KESTRELWAY_PAIR_A, docName: "Pair A: term from the Effective Date" },
  { key: "b", label: "Pair B", title: "Same contract, term from an event", expect: "Should refuse to confirm, and ask.", text: TEXT_KESTRELWAY, docName: "Pair B: term from the Service Commencement Date" },
  { key: "i", label: "Planted instruction", title: "A line telling the AI what to say", expect: "Should be ignored.", text: TEXT_KESTRELWAY_INJECTED, docName: "Planted instruction" },
  { key: "d", label: "Unsigned draft", title: "Not signed by both parties", expect: "Should be blocked.", text: TEXT_DRAFT, docName: "Unsigned draft" },
];

const LIMIT = 160000;

export function AddContract({ supplierId = "" }) {
  const state = useStore();
  // Coming from a "no contract on file" row: carry the supplier's known facts from the payments file.
  const known = SUPPLIER_MASTER.find((s) => s.id === supplierId) || null;
  const [docs, setDocs] = useState([{ name: "Main agreement", text: "" }]);
  const [picked, setPicked] = useState("");
  const [name, setName] = useState(known ? known.name : "");
  const [category, setCategory] = useState(known ? known.category : "Software");
  const [value, setValue] = useState(known ? String(known.annualValue) : "");
  const [owner, setOwner] = useState(known ? known.owner : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const total = docs.reduce((n, d) => n + d.text.length, 0);
  const filledCount = docs.filter((d) => d.text.trim()).length;
  const setDoc = (i, patch) => setDocs(docs.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const health = state.health;
  const liveOff = health && !health.key_configured;

  async function onFile(i, file) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const { name: fileName, text } = await fileToText(file);
      setDoc(i, { name: fileName, text });
      setPicked("");
    } catch (e) {
      setError(e.message || "That file could not be read.");
    }
    setBusy(false);
  }

  function pick(p) {
    setPicked(p.key);
    setDocs([{ name: p.docName, text: p.text }]);
    if (!known) { setName("Kestrelway Logistics (your copy)"); setCategory("Logistics"); setValue("42000000"); }
  }

  function submit() {
    setError("");
    const filled = docs.filter((d) => d.text.trim().length > 0);
    if (!filled.length) return setError("Paste or upload at least one document, or pick an example.");
    if (total < 200) return setError("That is too little text to be a contract.");
    if (total > LIMIT) return setError(`Together these are ${total.toLocaleString("en-IN")} characters. This prototype reads up to ${LIMIT.toLocaleString("en-IN")} per contract family. Paste the sections on term, renewal, notices and pricing.`);
    const id = addContract({ documents: filled, supplier: { supplierId: known ? known.id : "", name: name.trim() || filled[0].name, short: known ? known.short : "", appliesTo: known ? known.appliesTo : "", ownerTitle: known ? known.ownerTitle : "", category, annualValue: Number(value) || 0, owner: owner.trim() || "You" } });
    markGuideDone("own");
    readContract(id);
    go(`#/c/${id}`);
  }

  const pct = Math.min(100, (total / LIMIT) * 100);
  return html`
    <div class="page">
      <div class="crumbs"><a href="#/">Portfolio</a> / Add a contract</div>
      <div class="page-head">
        <div>
          <h1 class="h1">${known ? `Add the signed contract for ${known.short}` : "Read a contract with the live model"}</h1>
          <p class="lede">${known
            ? html`${known.short} was paid ${formatMoney(known.annualValue)} last year with no contract on file. The supplier details below come from the payments file.`
            : "Pick an example or bring your own. You get the same brief as the portfolio: the date, the sum behind it, and every passage checked."}</p>
        </div>
      </div>

      ${liveOff && html`<div class="banner bad" style="margin-top:14px">Live reading is not available right now: the server has no AI key. The saved readings in the portfolio still work.</div>`}

      <div class="add-grid">
        <div class="add-main">
          <section class="add-step">
            <div class="add-step-head"><span class="add-n">1</span><div><h2 class="h3">Start from an example</h2><p class="small muted">Pair A and Pair B are the same contract with one phrase changed. They should not get the same answer.</p></div></div>
            <div class="examples">
              ${PRESETS.map((p) => html`
                <button class=${`example ${picked === p.key ? "on" : ""}`} aria-pressed=${picked === p.key} onClick=${() => pick(p)}>
                  <span class="ex-label">${p.label}</span>
                  <b>${p.title}</b>
                  <span class="ex-expect">${p.expect}</span>
                </button>`)}
            </div>
          </section>

          <section class="add-step">
            <div class="add-step-head"><span class="add-n">2</span><div><h2 class="h3">Or add your own documents</h2><p class="small muted">The signed agreement first, then any amendments or order forms. They are read together as one contract family.</p></div></div>
            ${docs.map((d, i) => html`
              <div class="doc-card">
                <div class="doc-card-head">
                  <${Icon} name="doc" size=${20} />
                  <input class="doc-name" aria-label=${`Name of document ${i + 1}`} value=${d.name} onInput=${(e) => setDoc(i, { name: e.target.value })} />
                  <span class="doc-count">${d.text.length ? `${d.text.length.toLocaleString("en-IN")} characters` : "No text yet"}</span>
                  ${docs.length > 1 && html`<button class="linkbtn small" onClick=${() => setDocs(docs.filter((_, j) => j !== i))}>Remove</button>`}
                </div>
                <label class="drop">
                  <${Icon} name="download" size=${18} cls="flip" />
                  <span><b>Upload a PDF, Word or text file</b> or paste the text below</span>
                  <input type="file" accept=".pdf,.docx,.txt,.md,text/plain,application/pdf" onChange=${(e) => { onFile(i, e.target.files[0]); setPicked(""); }} />
                </label>
                <textarea class="textarea doc-text" aria-label=${`Text of document ${i + 1}`} value=${d.text} onInput=${(e) => { setDoc(i, { text: e.target.value }); setPicked(""); }} placeholder="Paste the contract text here"></textarea>
              </div>`)}
            <button class="btn ghost small" style="margin-top:12px" disabled=${docs.length >= 6} onClick=${() => setDocs([...docs, { name: `Amendment or order form ${docs.length}`, text: "" }])}><${Icon} name="plus" size=${15} />Add an amendment, order form or schedule</button>
          </section>

          <section class="add-step">
            <div class="add-step-head"><span class="add-n">3</span><div><h2 class="h3">About the supplier</h2><p class="small muted">${known ? "From the payments file." : "In the product these come from the payments file. All optional."}</p></div></div>
            <div class="sup-grid">
              <${Field} label="Supplier name"><input class="input" value=${name} onInput=${(e) => setName(e.target.value)} placeholder="Taken from the contract if empty" /></${Field}>
              <${Field} label="Category"><select class="select" value=${category} onChange=${(e) => setCategory(e.target.value)}>${CATEGORIES.map((c) => html`<option value=${c}>${c}</option>`)}</select></${Field}>
              <${Field} label="Annual value, INR"><input class="input" type="number" min="0" value=${value} onInput=${(e) => setValue(e.target.value)} placeholder="3600000" /></${Field}>
              <${Field} label="Budget owner"><input class="input" value=${owner} onInput=${(e) => setOwner(e.target.value)} placeholder="You" /></${Field}>
            </div>
          </section>
        </div>

        <aside class="add-side">
          <div class="read-card">
            <h2 class="h3">What happens when you read it</h2>
            <ol class="pipeline">
              <li><span class="pl-dot ai">1</span><div><b>The model reads</b><span>Claude Sonnet 5.5 returns each fact with the exact passage behind it. About 10 to 60 seconds.</span></div></li>
              <li><span class="pl-dot">2</span><div><b>Code checks every passage</b><span>Each quote is searched for in your text. Only found passages are highlighted.</span></div></li>
              <li><span class="pl-dot">3</span><div><b>Code works out the dates</b><span>Term end, notice deadline, delivery time and a safety margin.</span></div></li>
              <li><span class="pl-dot">4</span><div><b>You get the brief</b><span>Confirmed only if every fact is proven. Otherwise one question goes to the owner.</span></div></li>
            </ol>
            <div class="meter" aria-label="Characters used">
              <div class="meter-bar"><span style=${`width:${pct}%`} class=${total > LIMIT ? "over" : ""}></span></div>
              <div class="small muted">${filledCount} document${filledCount === 1 ? "" : "s"}, ${total.toLocaleString("en-IN")} of ${LIMIT.toLocaleString("en-IN")} characters</div>
            </div>
            ${error && html`<div class="banner bad small" style="margin-top:12px">${error}</div>`}
            <button class="btn read-btn" disabled=${busy || liveOff} onClick=${submit}>${busy ? html`<${Spinner} label="Reading the file in your browser" />` : "Read with AI"}</button>
            <p class="small muted" style="margin-top:10px">Your text goes to the model through this site's server and is kept only in this browser. Do not paste a confidential contract. Public filings work well.</p>
          </div>
        </aside>
      </div>
    </div>`;
}
