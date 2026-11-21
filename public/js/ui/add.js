import { html, useState, useStore, go, Field, Spinner } from "./common.js";
import { addContract, readContract, markGuideDone, SUPPLIER_MASTER } from "../store.js";
import { CATEGORIES, formatMoney } from "../core/rules.js";
import { fileToText } from "../files.js";
import { TEXT_KESTRELWAY, TEXT_KESTRELWAY_PAIR_A, TEXT_KESTRELWAY_INJECTED, TEXT_DRAFT } from "../../data/samples.js";

const PRESETS = [
  ["Term counted from a written date", "Pair A: term from the Effective Date", TEXT_KESTRELWAY_PAIR_A],
  ["Same contract, term counted from an event", "Pair B: term from the Service Commencement Date", TEXT_KESTRELWAY],
  ["Same contract with an instruction planted in it", "Planted instruction", TEXT_KESTRELWAY_INJECTED],
  ["An unsigned draft", "Unsigned draft", TEXT_DRAFT],
];

const LIMIT = 160000;

export function AddContract({ supplierId = "" }) {
  const state = useStore();
  // Coming from a "no contract on file" row: carry the supplier's known facts from the payments file.
  const known = SUPPLIER_MASTER.find((s) => s.id === supplierId) || null;
  const [docs, setDocs] = useState([{ name: "Main agreement", text: "" }]);
  const [name, setName] = useState(known ? known.name : "");
  const [category, setCategory] = useState(known ? known.category : "Software");
  const [value, setValue] = useState(known ? String(known.annualValue) : "");
  const [owner, setOwner] = useState(known ? known.owner : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const total = docs.reduce((n, d) => n + d.text.length, 0);
  const setDoc = (i, patch) => setDocs(docs.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const health = state.health;

  async function onFile(i, file) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const { name: fileName, text } = await fileToText(file);
      setDoc(i, { name: fileName, text });
    } catch (e) {
      setError(e.message || "That file could not be read.");
    }
    setBusy(false);
  }

  function submit() {
    setError("");
    const filled = docs.filter((d) => d.text.trim().length > 0);
    if (!filled.length) return setError("Paste or upload at least one document.");
    if (total < 200) return setError("That is too little text to be a contract.");
    if (total > LIMIT) return setError(`Together these are ${total.toLocaleString("en-IN")} characters. This prototype reads up to ${LIMIT.toLocaleString("en-IN")} per contract family. Paste the sections on term, renewal, notices and pricing.`);
    const id = addContract({ documents: filled, supplier: { supplierId: known ? known.id : "", name: name.trim() || filled[0].name, short: known ? known.short : "", appliesTo: known ? known.appliesTo : "", ownerTitle: known ? known.ownerTitle : "", category, annualValue: Number(value) || 0, owner: owner.trim() || "You" } });
    markGuideDone("own");
    readContract(id);
    go(`#/c/${id}`);
  }

  return html`
    <div class="page page-narrow">
      <div class="crumbs"><a href="#/">Portfolio</a> / Add a contract</div>
      <h1 class="h1">${known ? `Add the signed contract for ${known.short}` : "Add a signed contract, or try your own"}</h1>
      ${known && html`<div class="banner info" style="margin-top:10px">${known.short} was paid ${formatMoney(known.annualValue)} last year and has no contract on file. Supplier, owner and value below come from the payments file. Once read, it leaves the "no contract on file" list.</div>`}
      <p class="lede">Paste the text or upload a file. The live model reads it, code checks every quoted passage against your text and works out the dates. Then edit one detail and read it again.</p>

      ${health && !health.key_configured && html`<div class="banner bad" style="margin-top:14px">Live reading is not available right now: the server has no AI key. The saved sample readings in the portfolio still work.</div>`}

      <div class="panel" style="margin-top:16px">
        <div class="h3">Start from an example</div>
        <p class="small muted">Two of these are the same contract with one phrase changed. They should not give the same answer.</p>
        <div class="chips" style="margin-top:8px">
          ${PRESETS.map(([title, label, text]) => html`<button class="chip" title=${title} onClick=${() => { setDocs([{ name: label, text }]); if (!known) { setName("Kestrelway Logistics (your copy)"); setCategory("Logistics"); setValue("42000000"); } }}>${label}</button>`)}
        </div>
      </div>

      ${docs.map((d, i) => html`
        <div class="panel">
          <div class="row" style="justify-content:space-between">
            <div class="h3">Document ${i + 1}${i === 0 ? ", the main agreement" : ""}</div>
            ${docs.length > 1 && html`<button class="linkbtn small" onClick=${() => setDocs(docs.filter((_, j) => j !== i))}>Remove</button>`}
          </div>
          <div class="row" style="margin-top:8px;align-items:flex-end">
            <${Field} label="Name"><input class="input" value=${d.name} onInput=${(e) => setDoc(i, { name: e.target.value })} /></${Field}>
            <${Field} label="Upload a PDF, Word or text file"><input class="input" type="file" accept=".pdf,.docx,.txt,.md,text/plain,application/pdf" onChange=${(e) => onFile(i, e.target.files[0])} /></${Field}>
          </div>
          <div style="margin-top:10px">
            <${Field} label="Text" hint=${`${d.text.length.toLocaleString("en-IN")} characters`}>
              <textarea class="textarea" value=${d.text} onInput=${(e) => setDoc(i, { text: e.target.value })} placeholder="Paste the contract text here"></textarea>
            </${Field}>
          </div>
        </div>`)}
      <div style="margin-top:10px"><button class="btn ghost small" disabled=${docs.length >= 6} onClick=${() => setDocs([...docs, { name: `Amendment or order form ${docs.length}`, text: "" }])}>Add an amendment, order form or schedule</button></div>

      <div class="panel">
        <div class="h3">About this supplier</div>
        <p class="small muted">In the product these come from the payments file. Here you type them. All optional.</p>
        <div class="row" style="margin-top:8px;align-items:flex-end">
          <${Field} label="Supplier name"><input class="input" value=${name} onInput=${(e) => setName(e.target.value)} placeholder="Taken from the contract if left empty" /></${Field}>
          <${Field} label="Category"><select class="select" value=${category} onChange=${(e) => setCategory(e.target.value)}>${CATEGORIES.map((c) => html`<option value=${c}>${c}</option>`)}</select></${Field}>
          <${Field} label="Annual value, INR"><input class="input" type="number" min="0" value=${value} onInput=${(e) => setValue(e.target.value)} placeholder="3600000" /></${Field}>
          <${Field} label="Budget owner"><input class="input" value=${owner} onInput=${(e) => setOwner(e.target.value)} placeholder="You" /></${Field}>
        </div>
      </div>

      ${error && html`<div class="banner bad" style="margin-top:12px">${error}</div>`}
      <div class="row" style="margin-top:14px">
        <button class="btn" disabled=${busy} onClick=${submit}>Read with AI</button>
        ${busy && html`<${Spinner} label="Reading the file in your browser." />`}
        <span class="small muted">${total.toLocaleString("en-IN")} of ${LIMIT.toLocaleString("en-IN")} characters.</span>
      </div>
      <p class="small muted" style="margin-top:12px">
        Your text goes to the model through this site's server for the read and is kept only in this browser. This is a prototype: do not paste a confidential contract.
        Public filings work well. The brief links to Law Insider for samples.
      </p>
    </div>`;
}
