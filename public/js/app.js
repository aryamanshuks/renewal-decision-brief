import { html, render, Component, useState, useEffect } from "../vendor/htm-preact.js";
import { useStore, go, DocDrawer } from "./ui/common.js";
import { Icon, Mark, Avatar } from "./ui/icons.js";
import { setRole, setOwnerName, setClock, resetClock, today, setHealth, setGuide, markGuideDone, resetDemo, owners, PEOPLE, allViews } from "./store.js";
import { getHealth } from "./api.js";
import { toISO } from "./core/dates.js";
import { DEMO_TODAY } from "../data/samples.js";
import { Portfolio } from "./ui/portfolio.js";
import { BriefView } from "./ui/briefview.js";
import { OwnerInbox } from "./ui/owner.js";
import { AddContract } from "./ui/add.js";
import { TrackerCheck } from "./ui/tracker.js";
import { PAGES } from "./ui/pages.js";
import { BothSides } from "./ui/both.js";
import { embedded } from "./store.js";

function parseRoute() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const parts = raw.split("/");
  // Friendly aliases for names people might type or remember.
  const ALIAS = { "test-bench": "tests", testbench: "tests", "check-your-tracker": "tracker", portfolio: "", main: "", inbox: "owner" };
  if (parts[0] in ALIAS) parts[0] = ALIAS[parts[0]];
  const [head, ...rest] = parts;
  if (!head) return { name: "home", key: "home" };
  if (head === "c" && rest[0]) return { name: "brief", id: decodeURIComponent(rest[0]), key: `brief-${rest[0]}` };
  if (head === "owner" || head === "tracker") return { name: head, key: head };
  if (head === "both" || head === "both-sides" || head === "together") return { name: "both", key: "both" };
  if (head === "add") return { name: "add", supplierId: rest[0] || "", key: `add-${rest[0] || ""}` };
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
  { key: "tracker", label: "Check the tracker procurement keeps today", href: "#/tracker" },
  { key: "own", label: "Try your own contract", href: "#/add" },
  { key: "about", label: "Read why, and what would change my mind", href: "#/about" },
].filter((s) => s.key !== "about" || PAGES.about);

function Guide({ state, sideHidden, toggleSide }) {
  const done = state.guide.done;
  const [all, setAll] = useState(false);
  const current = STEPS.find((s) => !done[s.key]);
  const n = current ? STEPS.indexOf(current) + 1 : STEPS.length;
  return html`
    <div class="guide topbar">
      <div class="guide-in">
        <${NavButtons} sideHidden=${sideHidden} toggleSide=${toggleSide} />
        ${!state.guide.open
          ? html`<button class="linkbtn small" style="margin-left:auto" onClick=${() => setGuide({ open: true })}>Show the guided path</button>`
          : html`
            ${current
              ? html`<span class="guide-text"><strong>Guided path, step ${n} of ${STEPS.length}:</strong> <a class="guide-now" href=${current.href}>${current.label}</a></span>`
              : html`<strong class="guide-text">Guided path complete.</strong>`}
            <button class="linkbtn small" onClick=${() => setAll(!all)} aria-expanded=${all}>${all ? "Hide the steps" : "Show all steps"}</button>
            <button class="linkbtn small" style="margin-left:auto" onClick=${() => setGuide({ open: false })}>Hide the guide</button>
            ${all && html`<ol style="flex-basis:100%">
              ${STEPS.map((s) => html`<li class=${done[s.key] ? "done" : s === current ? "on" : ""}><a href=${s.href}>${s.label}${done[s.key] ? " (done)" : ""}</a></li>`)}
            </ol>`}`}
      </div>
    </div>`;
}

// Back and forward through the app's own history, and a menu button that hides the side panel.
function NavButtons({ sideHidden, toggleSide }) {
  const nav = window.navigation;
  const canBack = nav && "canGoBack" in nav ? nav.canGoBack : window.history.length > 1;
  const canFwd = nav && "canGoForward" in nav ? nav.canGoForward : true;
  return html`
    <div class="navbtns">
      <button class="nav-btn side-toggle" onClick=${toggleSide} aria-pressed=${!sideHidden} title=${sideHidden ? "Show the menu" : "Hide the menu"}><${Icon} name="menu" /><span class="sr">${sideHidden ? "Show the menu" : "Hide the menu"}</span></button>
      ${sideHidden && html`<a class="nav-brand" href="#/"><${Mark} size=${30} /><span>Renewal Decision Brief</span></a>`}
      <button class="nav-btn" onClick=${() => window.history.back()} disabled=${!canBack} title="Back"><${Icon} name="back" /><span class="sr">Back</span></button>
      <button class="nav-btn" onClick=${() => window.history.forward()} disabled=${!canFwd} title="Forward"><${Icon} name="forward" /><span class="sr">Forward</span></button>
    </div>`;
}

function Sidebar({ state, route }) {
  const isOwner = state.role === "owner";
  const list = owners();
  const now = today(state);
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [route.key]);
  const switchRole = (role) => {
    if (role === state.role) return;
    setRole(role);
    if (route.name !== "brief") go(role === "owner" ? "#/owner" : "#/");
  };
  // How many items are waiting for the owner being played, for the inbox badge.
  const waiting = isOwner
    ? allViews(state).filter((v) => v.flow && v.flow.actorRole === "owner" && (v.contract.record.question?.to || v.contract.record.ownerOverride || v.supplier.owner) === state.ownerName).length
    : 0;
  const link = (name, href, icon, label, badge = 0) => html`
    <a class=${`side-link ${route.name === name ? "on" : ""}`} href=${href} aria-current=${route.name === name ? "page" : undefined}>
      <${Icon} name=${icon} /><span>${label}</span>${badge > 0 && html`<span class="side-badge" aria-label=${`${badge} waiting`}>${badge}</span>`}
    </a>`;
  return html`
    <aside class=${`side ${menu ? "open" : ""}`}>
      <div class="side-top">
        <a class="brand" href="#/"><${Mark} size=${42} /><span>Renewal Decision Brief<small>No date without the clause that proves it</small></span></a>
        <button class="menu-btn" aria-expanded=${menu} aria-controls="side-body" onClick=${() => setMenu(!menu)}><${Icon} name=${menu ? "close" : "menu"} /><span class="sr">${menu ? "Close menu" : "Open menu"}</span></button>
      </div>
      <div class="side-body" id="side-body">
        <nav class="side-nav" aria-label="Main">
          ${isOwner && link("owner", "#/owner", "inbox", "Your inbox", waiting)}
          ${link("home", "#/", "grid", "Portfolio")}
          ${link("tracker", "#/tracker", "check", "Check your tracker")}
          ${link("add", "#/add", "plus", "Add a contract")}
          ${link("both", "#/both", "user", "Both sides, live")}
          <div class="side-sep"></div>
          ${PAGES.tests && link("tests", "#/tests", "flask", "Test bench")}
          ${PAGES.about && link("about", "#/about", "info", "About this prototype")}
        </nav>
        <div class="side-foot">
          <div class="side-cap">Demo controls</div>
          <div class="seg seg-dark" role="group" aria-label="View as">
            <button class=${isOwner ? "" : "on"} aria-pressed=${!isOwner} onClick=${() => switchRole("procurement")}>Procurement</button>
            <button class=${isOwner ? "on" : ""} aria-pressed=${isOwner} onClick=${() => switchRole("owner")}>Budget owner</button>
          </div>
          <div class="side-who">
            <${Avatar} name=${isOwner ? state.ownerName : PEOPLE.procurement.name} />
            ${isOwner
              ? html`<select class="who-select" aria-label="Acting as" value=${state.ownerName} onChange=${(e) => setOwnerName(e.target.value)}>
                  ${list.map((o) => html`<option value=${o.name}>${o.name}</option>`)}
                </select>`
              : html`<span><b>${PEOPLE.procurement.name}</b><br /><span class="side-sub">${PEOPLE.procurement.title}</span></span>`}
          </div>
          <label class="side-date" for="clock">
            <${Icon} name="calendar" size=${16} />
            <span>Today in the demo</span>
          </label>
          <div class="side-date-row">
            <input id="clock" type="date" value=${toISO(now)} onChange=${(e) => setClock(e.target.value)} />
            ${(!state.clock.pinned || state.clock.date !== DEMO_TODAY) && html`<button class="linkbtn" onClick=${resetClock}>Reset</button>`}
          </div>
          <button class="side-reset" onClick=${() => { resetDemo(); go("#/"); }}>Start the demo again</button>
        </div>
      </div>
    </aside>`;
}

function Footer({ state }) {
  return html`
    <footer class="sitefoot">
      <div class="sitefoot-in">
        <span>Prototype for the Sirion product case. Every company, person and figure is invented. There is no login: the switch in the sidebar changes who you are. Email and reminders are simulated on screen. Nothing is ever sent to a supplier.</span>
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
  // Hiding the side panel is a viewing preference for this browser only.
  const [sideHidden, setSideHidden] = useState(() => {
    try { return localStorage.getItem("rdb-side-hidden") === "1"; } catch { return false; }
  });
  const toggleSide = () => {
    const next = !sideHidden;
    setSideHidden(next);
    try { localStorage.setItem("rdb-side-hidden", next ? "1" : "0"); } catch { /* private mode: keep it for this visit */ }
  };
  useEffect(() => { getHealth().then(setHealth); }, []);
  useEffect(() => {
    if (route.name === "brief" && route.id === "kestrelway") markGuideDone("open");
    if (route.name === "about") markGuideDone("about");
    if (route.name === "tracker") markGuideDone("tracker");
  }, [route.key]);

  let page;
  if (route.name === "home") page = html`<${Portfolio} />`;
  else if (route.name === "brief") page = html`<${BriefView} id=${route.id} />`;
  else if (route.name === "owner") page = html`<${OwnerInbox} />`;
  else if (route.name === "tracker") page = html`<${TrackerCheck} />`;
  else if (route.name === "add") page = html`<${AddContract} supplierId=${route.supplierId} />`;
  else if (PAGES[route.name]) page = html`<${PAGES[route.name]} section=${route.section} />`;
  else page = html`<${Missing} />`;

  // Inside the side-by-side page: one role, no menus, just the screen.
  if (embedded) {
    return html`
      <main id="main" tabindex="-1" class="embedded-main">
        <${Boundary} key=${route.key}>${route.name === "both" ? html`<${Portfolio} />` : page}</${Boundary}>
      </main>
      <${DocDrawer} />`;
  }
  if (route.name === "both") {
    return html`<${Boundary} key="both"><${BothSides} /></${Boundary}><${DocDrawer} />`;
  }

  const health = state.health;
  return html`
    <div class=${`shell ${sideHidden ? "side-hidden" : ""}`}>
      <${Sidebar} state=${state} route=${route} />
      <div class="work">
        <${Guide} state=${state} sideHidden=${sideHidden} toggleSide=${toggleSide} />
        ${health && !health.key_configured && html`
          <div class="page" style="padding-bottom:0">
            <div class="banner">
              <strong>Live reading is off right now.</strong>
              ${health.unreachable ? " The server did not answer." : " The server has no AI key."}
              ${" "}Saved readings, the date logic and both roles still work. Reading a new contract will not.
            </div>
          </div>`}
        <main id="main" tabindex="-1">
          <${Boundary} key=${route.key}>${page}</${Boundary}>
        </main>
        <${Footer} state=${state} />
      </div>
    </div>
    <${DocDrawer} />`;
}

// Used once during the build to save real model readings as the instant samples. Holds nothing secret.
window.rdbTestExport = async () => {
  const { getState } = await import("./store.js");
  return JSON.stringify(getState().testRuns || {});
};
window.rdbExport = async (id) => {
  const { getState } = await import("./store.js");
  const c = getState().contracts[id];
  return c && c.extraction && c.meta ? JSON.stringify({ result: c.extraction, meta: { ...c.meta, source: undefined } }) : "";
};

clearTimeout(window.__bootTimer);
const mount = document.getElementById("app");
mount.textContent = "";
render(html`<${App} />`, mount);
