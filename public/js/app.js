import { html, render, Component, useState, useEffect } from "../vendor/htm-preact.js";
import { useStore, go, DocDrawer } from "./ui/common.js";
import { setRole, setOwnerName, setClock, resetClock, today, setHealth, setGuide, markGuideDone, resetDemo, owners, PEOPLE } from "./store.js";
import { getHealth } from "./api.js";
import { toISO } from "./core/dates.js";
import { DEMO_TODAY } from "../data/samples.js";
import { Portfolio } from "./ui/portfolio.js";
import { BriefView } from "./ui/briefview.js";
import { OwnerInbox } from "./ui/owner.js";
import { AddContract } from "./ui/add.js";
import { PAGES } from "./ui/pages.js";

function parseRoute() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [head, ...rest] = raw.split("/");
  if (!head) return { name: "home", key: "home" };
  if (head === "c" && rest[0]) return { name: "brief", id: decodeURIComponent(rest[0]), key: `brief-${rest[0]}` };
  if (head === "owner" || head === "add") return { name: head, key: head };
  if (PAGES[head]) return { name: head, section: rest[0] || "", key: head };
  return { name: "missing", key: "missing" };
}

function useRoute() {
  const [route, setRoute] = useState(parseRoute());
  useEffect(() => {
    const onChange = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

// The reviewer's path through the product. It is a real sequence, so it is numbered.
const STEPS = [
  { key: "open", label: "See a date the tool will not confirm", href: "#/c/kestrelway" },
  { key: "answer", label: "Answer the one question as the owner", href: "#/c/kestrelway" },
  { key: "check", label: "Check the odd answer as procurement", href: "#/c/kestrelway" },
  { key: "conflict", label: "Settle two documents that disagree", href: "#/c/datavine" },
  { key: "decide", label: "Decide, then record the notice", href: "#/c/brightdesk" },
  { key: "own", label: "Try your own contract", href: "#/add" },
  { key: "about", label: "Read why, and what would change my mind", href: "#/about" },
].filter((s) => s.key !== "about" || PAGES.about);

function Guide({ state }) {
  const done = state.guide.done;
  const current = STEPS.find((s) => !done[s.key]);
  return html`
    <div class="guide">
      <div class="guide-in">
        <strong>Guided path, about four minutes</strong>
        <ol>
          ${STEPS.map((s) => html`<li class=${done[s.key] ? "done" : s === current ? "on" : ""}><a href=${s.href}>${s.label}${done[s.key] ? " (done)" : ""}</a></li>`)}
        </ol>
        <button class="linkbtn small" style="margin-left:auto" onClick=${() => setGuide({ open: false })}>Hide</button>
      </div>
    </div>`;
}

function Header({ state, route }) {
  const isOwner = state.role === "owner";
  const list = owners();
  const now = today(state);
  const on = (name) => (route.name === name ? "on" : "");
  const switchRole = (role) => {
    if (role === state.role) return;
    setRole(role);
    if (route.name !== "brief") go(role === "owner" ? "#/owner" : "#/");
  };
  return html`
    <header class="top">
      <div class="top-in">
        <a class="brand" href="#/">Renewal Decision Brief</a>
        <nav class="nav" aria-label="Main">
          ${isOwner && html`<a class=${on("owner")} href="#/owner">Waiting for you</a>`}
          <a class=${on("home")} href="#/">${isOwner ? "All contracts" : "Portfolio"}</a>
          <a class=${on("add")} href="#/add">Add a contract</a>
          ${PAGES.tests && html`<a class=${on("tests")} href="#/tests">Test bench</a>`}
          ${PAGES.about && html`<a class=${on("about")} href="#/about">About this prototype</a>`}
        </nav>
        <div class="top-right">
          <div class="seg" role="group" aria-label="View as">
            <button class=${isOwner ? "" : "on"} aria-pressed=${!isOwner} onClick=${() => switchRole("procurement")}>Procurement</button>
            <button class=${isOwner ? "on" : ""} aria-pressed=${isOwner} onClick=${() => switchRole("owner")}>Budget owner</button>
          </div>
          ${isOwner
            ? html`<select class="who-select" aria-label="Acting as" value=${state.ownerName} onChange=${(e) => setOwnerName(e.target.value)}>
                ${list.map((o) => html`<option value=${o.name}>${o.name}</option>`)}
              </select>`
            : html`<span class="who">${PEOPLE.procurement.name}</span>`}
          <div class="clock">
            <label for="clock">Demo date</label>
            <input id="clock" type="date" value=${toISO(now)} onChange=${(e) => setClock(e.target.value)} />
            ${(!state.clock.pinned || state.clock.date !== DEMO_TODAY) && html`<button onClick=${resetClock}>Reset</button>`}
          </div>
        </div>
      </div>
    </header>`;
}

function Footer({ state }) {
  return html`
    <footer class="sitefoot">
      <div class="sitefoot-in">
        <span>Prototype for the Sirion product case. Every company, person and figure is invented. There is no login: the switch at the top changes who you are. Email and reminders are simulated on screen. Nothing is ever sent to a supplier.</span>
        <span class="row" style="gap:14px">
          ${!state.guide.open && html`<button class="linkbtn" onClick=${() => setGuide({ open: true })}>Show the guided path</button>`}
          <button class="linkbtn" onClick=${() => { resetDemo(); go("#/"); }}>Reset the demo</button>
          <a href="/selftest.html">Server self-test</a>
        </span>
      </div>
    </footer>`;
}

class Boundary extends Component {
  constructor() {
    super();
    this.state = { error: null };
  }
  componentDidCatch(error) {
    this.setState({ error });
  }
  render() {
    if (this.state.error) {
      return html`
        <div class="page page-narrow">
          <div class="banner bad">
            <strong>This screen hit an error and stopped.</strong> Nothing was lost on the server, because nothing is stored there.
            <div style="margin-top:8px" class="row">
              <button class="btn small" onClick=${() => window.location.reload()}>Reload</button>
              <button class="btn ghost small" onClick=${() => { resetDemo(); window.location.hash = "#/"; window.location.reload(); }}>Reset the demo and reload</button>
            </div>
            <details style="margin-top:8px"><summary>Technical detail</summary><div class="small">${String(this.state.error?.message || this.state.error)}</div></details>
          </div>
        </div>`;
    }
    return this.props.children;
  }
}

function Missing() {
  return html`<div class="page page-narrow"><h1 class="h1">That page does not exist</h1><p class="lede"><a href="#/">Go to the portfolio</a></p></div>`;
}

function App() {
  const state = useStore();
  const route = useRoute();
  useEffect(() => { getHealth().then(setHealth); }, []);
  useEffect(() => {
    if (route.name === "brief" && route.id === "kestrelway") markGuideDone("open");
    if (route.name === "about") markGuideDone("about");
  }, [route.key]);

  let page;
  if (route.name === "home") page = html`<${Portfolio} />`;
  else if (route.name === "brief") page = html`<${BriefView} id=${route.id} />`;
  else if (route.name === "owner") page = html`<${OwnerInbox} />`;
  else if (route.name === "add") page = html`<${AddContract} />`;
  else if (PAGES[route.name]) page = html`<${PAGES[route.name]} section=${route.section} />`;
  else page = html`<${Missing} />`;

  const health = state.health;
  return html`
    <${Header} state=${state} route=${route} />
    ${state.guide.open && html`<${Guide} state=${state} />`}
    ${health && !health.key_configured && html`
      <div class="page" style="padding-bottom:0">
        <div class="banner">
          <strong>Live reading is off right now.</strong>
          ${health.unreachable ? " The server did not answer." : " The server has no AI key."}
          ${" "}Saved readings, the date logic and both roles still work. Reading a new contract will not.
        </div>
      </div>`}
    <main id="main">
      <${Boundary} key=${route.key}>${page}</${Boundary}>
    </main>
    <${Footer} state=${state} />
    <${DocDrawer} />`;
}

// Used once during the build to save real model readings as the instant samples. Holds nothing secret.
window.rdbExport = async (id) => {
  const { getState } = await import("./store.js");
  const c = getState().contracts[id];
  return c && c.extraction && c.meta ? JSON.stringify({ result: c.extraction, meta: { ...c.meta, source: undefined } }) : "";
};

clearTimeout(window.__bootTimer);
const mount = document.getElementById("app");
mount.textContent = "";
render(html`<${App} />`, mount);
