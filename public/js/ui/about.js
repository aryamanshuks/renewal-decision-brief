import { html, useEffect, useState } from "./common.js";
import { formatMoney } from "../core/rules.js";
import { StakeholderMap, ExperienceFlow } from "./diagrams.js";
import { LEAD_DAYS, SAFETY_MARGIN_BUSINESS_DAYS, QUESTION_DUE_BUSINESS_DAYS } from "../core/rules.js";

// Every claim on this page carries one tag saying where it comes from.
const TAGS = {
  given: ["given", "Given by the brief"],
  outside: ["outside", "Outside evidence"],
  assume: ["assume", "My assumption"],
  tested: ["tested", "Tested by me"],
};

function Tag({ t }) {
  const [cls, label] = TAGS[t];
  return html`<span class=${`tag ${cls}`}>${label}</span>`;
}

// ---------- How big this could be at a 2,500-supplier company. Only the supplier count is given; every other input is an assumption. ----------
const SIZING = [
  ["suppliers", "Suppliers", 2500, "", "Given by the brief"],
  ["auto", "On contracts that renew automatically", 40, "%", ""],
  ["value", "Average yearly value of those contracts", 15, "₹ lakh", ""],
  ["due", "Whose renewal comes up in a given year", 60, "%", ""],
  ["silent", "That renew today with nobody deciding in time", 20, "%", ""],
  ["change", "Where the owner would have exited or renegotiated", 30, "%", ""],
  ["saving", "Saved when they do, as a share of yearly value", 15, "%", ""],
  ["person", "Where a date needs one person's answer", 35, "%", ""],
  ["minutes", "Minutes for an owner to answer, plus procurement to check", 8, "min", ""],
];

function Sizing() {
  const [v, setV] = useState(Object.fromEntries(SIZING.map(([k, , d]) => [k, d])));
  const n = (k) => Math.max(0, Number(v[k]) || 0);
  const pct = (k) => n(k) / 100;
  const autoContracts = Math.round(n("suppliers") * pct("auto"));
  const due = Math.round(autoContracts * pct("due"));
  const silent = Math.round(due * pct("silent"));
  const yearly = n("value") * 1e5;
  const committed = silent * yearly;
  const avoidable = silent * pct("change") * yearly * pct("saving");
  const questions = Math.round(due * pct("person"));
  const hours = Math.round((questions * n("minutes")) / 60);
  return html`
    <div class="sizing">
      <div class="sizing-in">
        ${SIZING.map(([k, label, , unit, note]) => html`
          <label class="sz-row">
            <span class="sz-l">${label}${note && html`<em>${note}</em>`}</span>
            <span class="sz-v"><input class="input" type="number" min="0" step=${unit === "₹ lakh" ? "0.5" : "1"} value=${v[k]} onInput=${(e) => setV({ ...v, [k]: e.target.value })} /><span>${unit}</span></span>
          </label>`)}
        <button class="linkbtn small" style="align-self:flex-start" onClick=${() => setV(Object.fromEntries(SIZING.map(([k, , d]) => [k, d])))}>Reset to my assumptions</button>
      </div>
      <div class="sizing-out">
        <div class="sz-o"><span>Renewals each year that nobody decides</span><b>${silent.toLocaleString("en-IN")}</b><em>${autoContracts.toLocaleString("en-IN")} auto-renewing contracts, ${due.toLocaleString("en-IN")} up this year, ${n("silent")}% of them by default.</em></div>
        <div class="sz-o"><span>Committed by silence each year</span><b>${formatMoney(committed)}</b><em>Spend nobody chose to renew, at whatever price the clause allows.</em></div>
        <div class="sz-o"><span>Avoidable cost each year</span><b>${formatMoney(avoidable)}</b><em>Where the owner would have exited or renegotiated, at ${n("saving")}% of yearly value.</em></div>
        <div class="sz-o"><span>Questions the tool would send owners</span><b>${questions.toLocaleString("en-IN")} a year</b><em>About ${Math.max(1, Math.round(questions / 48))} a week; roughly ${hours} hours of people's time in a year.</em></div>
      </div>
    </div>`;
}

function Claim({ t, children, check, src }) {
  return html`
    <li>
      <${Tag} t=${t} />${children}
      ${src && html` <a href=${`#/about/sources`} class="small" onClick=${(e) => { e.preventDefault(); document.getElementById(`src-${src}`)?.scrollIntoView({ block: "center" }); }}>[source ${src}]</a>`}
      ${check && html` <a class="small" href=${check[0]}>${check[1]}</a>`}
    </li>`;
}

const SECTIONS = [
  ["why", "1. Why this stage"],
  ["existing", "What already exists"],
  ["stakeholders", "2. Stakeholder map"],
  ["problem", "3. The problem"],
  ["prototype", "4. The working prototype"],
  ["metrics", "5. Success metrics"],
  ["assumptions", "Assumptions"],
  ["sources", "Sources"],
];

export function About({ section }) {
  useEffect(() => {
    if (section) document.getElementById(section)?.scrollIntoView({ block: "start" });
    else window.scrollTo(0, 0);
  }, [section]);

  return html`
    <div class="page">
      <div class="about-grid">
        <nav class="toc" aria-label="On this page">
          ${SECTIONS.map(([id, label]) => html`<a href=${`#/about/${id}`}>${label}</a>`)}
          <div class="small muted" style="margin-top:14px;padding-left:10px">
            Tags: ${Object.keys(TAGS).map((t) => html`<div style="margin-top:4px"><${Tag} t=${t} /></div>`)}
          </div>
        </nav>

        <div class="prose stack-lg">
          <div>
            <h1 class="h1">About this prototype</h1>
            <p class="lede">The five sections the brief asks for, in its own words. Every claim is tagged with where it comes from, and most link to the screen where you can check it. I have not interviewed a procurement practitioner for this case. Where that matters, it says so.</p>
          </div>

          <div class="overview">
            ${[
              ["why", "1", "Why this stage", "Intelligent repository, narrowed to one question: the last safe date to say no."],
              ["stakeholders", "2", "Stakeholder map", "Procurement uses it, the budget owner decides, Legal sees only real conflicts."],
              ["problem", "3", "The problem", "An unreviewed renewal is a decision nobody made. Contracts hide the date."],
              ["prototype", "4", "The working prototype", "The model reads, code verifies and calculates, named people decide."],
              ["metrics", "5", "Success metrics", "Renewal value decided in time, with a valid notice received."],
            ].map(([id, n, title, line]) => html`<a class="ov" href=${`#/about/${id}`}><span class="ov-n">${n}</span><b>${title}</b><span>${line}</span></a>`)}
          </div>

          <section id="why">
            <h2 class="h2">1. Why this stage</h2>
            <p style="margin-top:8px"><b>Chosen stage: intelligent repository.</b> Inside it, one question per signed contract: <i>what is the last safe date to say no before this renews itself, what happens if we do nothing, and how do we know?</i></p>
            <ul class="claims">
              <${Claim} t="given">The brief names three results of the current mess: unreviewed autorenewals, missed service levels and invoices that do not match agreed prices. All three happen after signature, and all three start with signed terms nobody acts on.</${Claim}>
              <${Claim} t="assume">That does not make all three repository problems: a wrong invoice can also be a plain billing error. The narrower reason for this choice is that renewal is the problem where signed terms, one operational fact and an accountable owner change a decision with a date on it.</${Claim}>
              <${Claim} t="assume">Intake and negotiation improve the contracts the company will sign next. The repository governs the roughly 2,500 supplier relationships that already exist. That is where the money is committed today.</${Claim}>
              <${Claim} t="assume">Of the three results, the renewal date is the one with a hard, dated, one-way consequence: miss it and the company is committed for another term. Missed service levels and wrong invoices can still be claimed or disputed later, within limits.</${Claim}>
              <${Claim} t="assume">It is also the one a reviewer can check. A date is right or wrong. "Better search" or "chat with your contracts" answers questions people think to ask. Renewals hurt because nobody asks.</${Claim}>
              <${Claim} t="outside" src="3">Real contracts make the date hard to find, which is why AI is useful here and also why it is risky. In a public SEC filing, the term runs from a date set by a separate notice from the supplier, and a later amendment changes it to a billing start date.</${Claim}>
              <${Claim} t="outside" src="5">In 10 sample automatic renewal clauses on Law Insider, none lets you work out the deadline from the clause alone. Three give no notice period at all, and one counts in working days.</${Claim}>
              <${Claim} t="outside" src="6">Sirion's own 2026 survey with WorldCC (170 respondents) reports that 54% of organisations have no automated data flow between their contract systems. A repository that holds documents is not yet one the business can act on.</${Claim}>
            </ul>
            <p class="small muted" style="margin-top:10px">What I left out on purpose: price and service level checks need invoice and performance data the brief does not give. They are the natural next questions for the same record.</p>

            <h3 class="h3" id="existing" style="margin-top:22px;scroll-margin-top:92px">What already exists, and what this adds</h3>
            <p class="small muted" style="margin-top:4px">Checked on 22 Nov 2026 from each company's public pages. I have not used these products, so this is what they say they do, not what I saw them do.</p>
            <ul class="claims">
              <${Claim} t="outside" src="8">Sirion describes configurable renewal and milestone alerts with role-based routing and escalations. Its own guidance tells teams to confirm how notice must be sent, keep evidence that it was delivered, and review unclear terms before relying on an automated deadline.</${Claim}>
              <${Claim} t="outside" src="9">Sirion also describes reviewing pricing history, amendments and service level performance before a renewal, and starting renegotiation and approval workflows from it.</${Claim}>
              <${Claim} t="outside" src="10"><b>Ironclad launched a Renewal Agent on 15 May 2026 that writes "Renewal Briefs"</b> for upcoming supplier renewals, from a renewals view filtered by the opt-out and expiry dates. This prototype's name overlaps with it. The difference is in what is checked, below, not in the name.</${Claim}>
              <${Claim} t="outside" src="11">Gatekeeper times alerts to each contract's notice period, runs a Renewal Guard Agent on auto-renewals near the notice deadline, and shows spend against contract, supplier scorecards, renegotiation levers and exit risk.</${Claim}>
              <${Claim} t="outside" src="12">Zoho Contracts offers renewal reminders, a calendar view, approval workflows for renewals, and ready templates for renewal, termination, extension and amendment letters.</${Claim}>
              <${Claim} t="outside" src="13">Software buying tools such as Tropic rank a renewal calendar by savings potential, use and urgency, with price benchmarks from past negotiations.</${Claim}>
              <${Claim} t="outside" src="14">A November 2026 comparison of nine renewal tools does not address notice method, delivery or deemed receipt for any of them. The only aids it names for checking an extracted date are confidence scores and source highlights. Its own FAQ says date extraction is weakest on scanned files, vague renewal clauses and conflicting dates across amendments. It was written by one of the vendors compared, without hands-on tests.</${Claim}>
            </ul>
            <p style="margin-top:12px"><b>So reminders, extraction and renewal briefs are standard.</b> What this prototype adds is narrower:</p>
            <ul class="claims">
              <${Claim} t="tested" check=${["#/c/kestrelway", "See a date it will not confirm"]}>A date is confirmed only when code has found every passage it rests on in the uploaded text. Otherwise it is marked provisional and one named person gets one question. There is no confidence score to act on.</${Claim}>
              <${Claim} t="tested" check=${["#/tests", "See the workflow rules"]}>The notice itself is checked: a method the contract allows, deemed receipt before the deadline, not before the window opens, not dated in the future. Sirion's own guidance asks people to do this by hand; here the product does it.</${Claim}>
              <${Claim} t="tested" check=${["#/tracker", "Check the sample tracker"]}>It starts from the Excel tracker procurement already trusts and checks every row. On the sample of 8 rows, 4 would miss or mislead a renewal, including one 60 days too late and one an amendment made out of date, and 3 more cannot be proven from the documents on file.</${Claim}>
              <${Claim} t="tested" check=${["#/c/tallyhand", "See Tallyhand's reminders"]}>Reminders are keyed to the safe send date, not the end date. A schedule of reminders 90, 60 and 30 days before the end date puts 2 of its 3 reminders too late for Brightdesk, and all 3 for Tallyhand.</${Claim}>
              <${Claim} t="assume">It does not try to beat the renewal briefs above on spend, performance or benchmarks. It gives them a date they can trust. In Sirion, that would sit under the renewal alerts and agents it already has.</${Claim}>
            </ul>
            <h3 class="h3" style="margin-top:18px">Why it matters to Sirion's business</h3>
            <ul class="claims">
              <${Claim} t="assume"><b>Faster first value in a new account.</b> The tracker check gives procurement a finding in week one, before migration is finished. Sirion's own migration playbook has teams map spreadsheet fields into the new system; this reads the spreadsheet as evidence instead. <a class="small" href="#/about/sources" onClick=${(e) => { e.preventDefault(); document.getElementById("src-15")?.scrollIntoView({ block: "center" }); }}>[source 15]</a></${Claim}>
              <${Claim} t="assume"><b>Renewals are the trust test for a buy-side system.</b> One wrong confirmed date that costs a year of spend is the story a procurement head repeats. Refusing to guess protects retention more than a higher extraction rate does.</${Claim}>
              <${Claim} t="assume"><b>It feeds what Sirion already sells.</b> Alerts, renegotiation workflows and obligation tracking all start from the renewal date. A date with its proof attached makes each of them safer to automate.</${Claim}>
            </ul>
          </section>

          <section id="stakeholders">
            <h2 class="h2">2. Stakeholder map</h2>
            <p style="margin-top:8px">Who has a stake in a renewal decision, what each wants, and where they pull against each other. The last column says how the prototype handles it.</p>
            <${StakeholderMap} />
            <div class="scroll-x" style="margin-top:10px">
              <table class="table">
                <thead><tr><th>Who</th><th>Wants</th><th>Fears</th><th>In this prototype</th></tr></thead>
                <tbody>
                  <tr><td><b>Procurement</b><div class="small muted">Primary user</div></td><td>No surprise renewals. Leverage before the deadline. A record that shows who decided what.</td><td>Being blamed for dates that someone else owned.</td><td>Owns the record and the portfolio. Checks odd answers. Sends notices. <a href="#/">Portfolio</a></td></tr>
                  <tr><td><b>Budget owner</b><div class="small muted">Second user, business team</div></td><td>The service keeps running. Little admin. Decide with full facts.</td><td>Losing a supplier they depend on. Questions they cannot answer.</td><td>Gets one question at a time and the decision, nothing else. <a href="#/owner">Owner view</a></td></tr>
                  <tr><td><b>Legal</b></td><td>Correct readings. Only real ambiguity escalated.</td><td>Being asked to read every contract.</td><td>Sees only what procurement escalates: documents that conflict, with both passages and both dates side by side. <a href="#/c/datavine">Conflict example</a></td></tr>
                  <tr><td><b>Finance and accounts payable</b></td><td>Spend that matches contracts. No unplanned commitments.</td><td>Renewals that appear as invoices.</td><td>Its payments file sets the denominator, so suppliers with no contract on file show up. <a href="#/">Coverage line</a></td></tr>
                  <tr><td><b>Head of procurement</b></td><td>Control of spend, early warning.</td><td>Finding out after the window closed.</td><td>Receives escalations when a question or decision is overdue.</td></tr>
                  <tr><td><b>Supplier</b><div class="small muted">Not a user</div></td><td>Renewal by default, on its terms, ideally with a price rise.</td><td>Late surprises, a lost account.</td><td>Never contacted by the tool. A person sends every notice.</td></tr>
                  <tr><td><b>IT and security</b></td><td>No contract data leaking, access by role.</td><td>A new tool with broad access.</td><td>Out of scope for the demo. Listed under assumptions.</td></tr>
                </tbody>
              </table>
            </div>
            <h3 class="h3" style="margin-top:16px">Where interests conflict</h3>
            <ul class="claims">
              <${Claim} t="assume" check=${["#/c/brightdesk", "See what silence costs"]}><b>Supplier against company.</b> Silence benefits the supplier: the contract renews, often with an uplift. The product turns silence into a number next to every date.</${Claim}>
              <${Claim} t="assume" check=${["#/c/ivyrock", "See an overdue decision"]}><b>Procurement against owner, on timing.</b> Procurement wants the decision early, while there is time to find an alternative. Owners prefer to decide late. A house rule sets a decide-by date per category, and overdue items escalate.</${Claim}>
              <${Claim} t="assume" check=${["#/c/brightdesk", "See the three choices"]}><b>Procurement against owner, on leverage.</b> Sending notice of non-renewal to force a renegotiation can unsettle a supplier the owner relies on. "Renegotiate" is a named choice, the owner makes it, and a person sends the notice.</${Claim}>
              <${Claim} t="assume" check=${["#/c/kestrelway", "See an answer that needs a check"]}><b>Owner against procurement, on facts.</b> The owner knows when service really started, but may misremember. Answers that look odd, such as a start before signing, go to procurement to confirm against evidence.</${Claim}>
              <${Claim} t="assume" check=${["#/c/datavine", "See a conflict"]}><b>Legal against procurement, on speed.</b> Legal would rather read everything. Procurement needs answers this month. Only conflicts and readings that contradict themselves reach a person, with the passages already highlighted.</${Claim}>
            </ul>
          </section>

          <section id="problem">
            <h2 class="h2">3. The problem</h2>
            <p style="margin-top:8px"><b>Who it affects.</b> Procurement, who keeps the tracker and is blamed when a date is missed. Budget owners, who lose the choice. Finance, who sees the cost as an unplanned commitment.</p>
            <p style="margin-top:8px"><b>Why it matters.</b> An unreviewed automatic renewal is a decision nobody made, for a full renewal period, at whatever price the clause allows. In the sample portfolio that is ₹4.2 crore a year for one logistics contract, plus up to a 6% uplift. Those figures are invented for the demo.</p>
            <h3 class="h3" style="margin-top:14px">How big it could be here</h3>
            <p class="small" style="margin-top:4px"><${Tag} t="assume" /> Illustrative sizing for the company in the brief. Only the 2,500 suppliers come from the brief; every other number is my assumption, not data. Change any of them.</p>
            <${Sizing} />
            <h3 class="h3" style="margin-top:14px">How I know it is real</h3>
            <ul class="claims">
              <${Claim} t="given">The brief lists unreviewed autorenewals as a result the company already has.</${Claim}>
              <${Claim} t="outside" src="3">The deadline is often not in the contract. In the SEC filing above, the term starts on a date the supplier sets by notice. Its 2007 amendment also requires legal notices by registered or certified mail or courier, and adds a separate address for termination notices. An email to the usual contact would not count.</${Claim}>
              <${Claim} t="outside" src="4">Silence does not always mean renewal. In another public filing, the buyer must give 180 days' notice to renew, and if it does not, the contract extends once for 12 months and then ends. A tool that assumes "auto-renews unless cancelled" would get this wrong.</${Claim}>
              <${Claim} t="outside" src="1">When several teams can check, nobody does. A state audit found that on 26 of 30 sampled invoices the rates did not match the contract, a net overcharge of about $41,000 or 8.8%. Each branch said checking was someone else's job. That is why every question in this prototype goes to one named person.</${Claim}>
              <${Claim} t="outside" src="2">The organisation's own system can be the source of the error. Another audit found a contractor paid $22 an hour against a contract rate of $20, $97,371 over one year, because the wrong rate had been typed into the buyer's own database. That is why every fact here shows the passage it came from.</${Claim}>
              <${Claim} t="tested" check=${["#/tests", "See the test bench"]}>In 510 real contracts labelled by legal experts (CUAD), I counted 109 that have both a renewal term and a notice period to stop renewal. Five of them are on the test bench. Then I held out ten more, picked by a fixed rule (the ten shortest not already used), and wrote their answers from the lawyer labels before the first run. That run passed 47 of 50 checks but confirmed two wrong dates: one term ended on "the later of" five years or the end of some projects, and one services term renewed inside a ten-year agreement that had already ended. The model mentioned both in its note, but nothing code checks carried them, so I added two code guards and re-ran everything: 144 of 145 checks, no wrong confirmed dates. After that fix the ten are no longer held out.</${Claim}>
              <${Claim} t="tested" check=${["#/tests", "See the test bench"]}>On the first live run, the model misread how one sample renews, and in another run it miscopied one digit in a quoted clause. Code caught both. The test bench shows them.</${Claim}>
              <${Claim} t="tested" check=${["#/tests", "See the workflow rules"]}>An independent review of an earlier version found five workflow defects, all after a correct reading: a notice by a method the contract forbids was accepted, deemed receipt after the deadline was ignored, a conflict choice showed the other document's passage, a decision stood after an amendment changed the terms, and a missing-contract row did not clear. All five are fixed and now checked as workflow rules.</${Claim}>
              <${Claim} t="tested" check=${["#/tests", "See the workflow rules"]}>A second review of the fixed version found four more, again all after a correct reading: a notice dated after today closed the task, a notice that arrived before the contract's notice window was accepted, one contract showed two different end dates for its single extension, and the keyboard skip link left the page. A third reviewer could not open the app at all, because its tool did not run JavaScript, so the page now carries a text version of these five sections. My own stress test found that two order forms under one master agreement were merged into one confirmed date; that family is now blocked and can be split into one contract per order form.</${Claim}>
            </ul>
            <div class="banner" style="margin-top:12px">
              <b>What I do not know.</b> How often this happens at this company, how accurate the current tracker is, and how much value sits in contracts that renew silently. I have not interviewed a practitioner. The first discovery step would be to pull the last 12 months of renewals from the tracker and the payments file, and hand-check 30 contracts against both.
            </div>
          </section>

          <section id="prototype">
            <h2 class="h2">4. The working prototype</h2>
            <p style="margin-top:8px"><b>The hypothesis it tests.</b> Procurement will act on a renewal date only when it can see the passage that proves it and the tool refuses to guess. And checking the notice itself catches failures that reminders about the date never will. <span class="tag assume" style="margin-left:4px">My assumption</span></p>
            <p style="margin-top:8px"><b>How much the product takes on.</b> It reads, calculates, asks and drafts. It never decides and never contacts a supplier.</p>
            <ul class="claims">
              <${Claim} t="tested" check=${["#/add", "Try your own contract"]}><b>The model reads.</b> Claude Sonnet 5.5 returns each fact with the exact passage it relied on. It is told the documents are data and to ignore instructions inside them.</${Claim}>
              <${Claim} t="tested" check=${["#/tests", "See the runs by model"]}><b>Why not the cheaper model.</b> I ran the whole test bench on Claude Haiku 5.5 as well. It produced one wrong confirmed date on a real contract (it read a single renewal as yearly renewals), and 3 of its 27 answers could not be read, including the one for the longest contract. Sonnet 5.5 did neither on the same contracts. At list prices a Sonnet read of a sample contract costs about 2.5 to 3.5 US cents, against a fraction of a cent for Haiku: cheap insurance against a wrong date.</${Claim}>
              <${Claim} t="tested" check=${["#/c/brightdesk", "See the working"]}><b>Code checks and calculates.</b> Every quoted passage is searched for in the uploaded text. Only found passages get the yellow highlight. Dates, notice delivery time and the safety margin are plain arithmetic, shown step by step.</${Claim}>
              <${Claim} t="tested" check=${["#/c/kestrelway", "See a date it will not confirm"]}><b>No guessed dates.</b> If a date depends on something outside the documents, the brief shows a provisional date, marked as such, and asks one named person one question.</${Claim}>
              <${Claim} t="tested" check=${["#/owner", "Open the owner view"]}><b>Named people decide.</b> The owner answers and decides on the same record procurement sees. Overdue questions and decisions escalate to the head of procurement.</${Claim}>
              <${Claim} t="tested" check=${["#/c/brightdesk", "See a notice draft"]}><b>A person sends.</b> The tool drafts the notice from confirmed facts and records what was actually sent. A method the contract does not allow, or a notice deemed received after the deadline, stays open as an exception.</${Claim}>
            </ul>
            <h3 class="h3" style="margin-top:18px">How the experiences connect</h3>
            <p style="margin-top:6px"><a class="btn small" href="#/both">See both sides live</a> <span class="small muted">Procurement and the budget owner side by side, on one record. Act on either side and the other updates.</span></p>
            <${ExperienceFlow} />
            <h3 class="h3" style="margin-top:18px">The core flow, end to end</h3>
            <ol style="margin-top:6px">
              <li>Procurement adds a signed contract and its amendments as one family. <a href="#/add">Add a contract</a></li>
              <li>The model reads it. Code verifies each passage and works out the dates. <a href="#/c/tallyhand">An amended contract</a></li>
              <li>Each fact gets a plain status: confirmed from documents, needs one answer, conflicting terms, or not found in these documents.</li>
              <li>If a fact is missing, one question goes to the budget owner, with the clause shown. <a href="#/c/kestrelway">Kestrelway</a></li>
              <li>The owner answers on the same record. Odd answers go back to procurement to confirm.</li>
              <li>With a confirmed date, the owner records renew, renegotiate or exit, with one line of reasoning.</li>
              <li>Procurement sends the notice the contract requires and records what was sent. The tool checks the method and when it counts as received. <a href="#/c/brightdesk">Brightdesk</a></li>
              <li>The portfolio ranks everything by urgency and annual value, and says what it does not cover. <a href="#/">Portfolio</a></li>
              <li>Reminders follow the safe send date, stop once a valid notice is recorded, and download as a calendar file. <a href="#/c/brightdesk">Brightdesk</a></li>
              <li>On day one, before anything else changes, the tracker procurement already keeps is checked against the contracts. <a href="#/tracker">Check your tracker</a></li>
            </ol>
            <p class="small muted" style="margin-top:10px">There is no login. The switch in the sidebar changes role. Email and reminders are shown on screen, not sent. The demo date is pinned to ${"23 Nov 2026"} so the samples stay meaningful, and you can change it in the sidebar.</p>
          </section>

          <section id="metrics">
            <h2 class="h2">5. Success metrics</h2>
            <div class="panel info" style="margin-top:10px">
              <div class="h3">North star: renewal value decided in time</div>
              <p style="margin-top:6px">Of the annual value of renewals <b>due in the period</b>, the share where the named owner <b>recorded a decision in time</b> and, where that decision needed action with the supplier, <b>a valid notice or signed extension was received before the contractual deadline</b>.</p>
              <ul style="margin-top:8px">
                <li><b>Due cohort</b> is reconciled independently against the tracker and the payments file, not taken from the repository alone, so a renewal the tool never saw still counts as missed.</li>
                <li><b>Reported beside it:</b> paid spend whose renewal status is unknown, because there is no contract on file or no readable one. Without this line a team could raise the score by leaving hard cases out.</li>
                <li><b>Weighted by annual value</b>, because a missed ₹4 crore renewal matters more than a missed ₹1 lakh one.</li>
                <li><b>Valid</b> means a method the contract allows, and receipt (actual or deemed) by the deadline. A courier notice where the contract says registered post is a failure, even if it went out on time.</li>
                <li><b>Baseline:</b> measured at the start of a pilot from the last 12 months of the tracker and the payments file. I do not have it.</li>
              </ul>
            </div>
            <h3 class="h3" style="margin-top:14px">How I would know it works</h3>
            <ul class="claims">
              <${Claim} t="assume"><b>Zero wrong confirmed dates</b> in a spot check of 50 contracts by a lawyer. A confirmed date that is wrong is worse than no date, because people stop checking. Proposed pilot criterion.</${Claim}>
              <${Claim} t="assume"><b>Share of contracts with a confirmed date</b> within two weeks of upload, and the share that needed a person. Proposed pilot target: 80% confirmed or answered within 10 working days.</${Claim}>
              <${Claim} t="assume"><b>Time a person spends per contract</b> on questions and checks. Proposed pilot target: under 5 minutes on average.</${Claim}>
              <${Claim} t="assume"><b>Overdue rate</b> of owner questions. If owners ignore them, the handoff design is wrong.</${Claim}>
            </ul>
            <h3 class="h3" style="margin-top:14px">How it could be gamed, and the check against it</h3>
            <ul class="claims">
              <${Claim} t="assume">Owners click "renew" without reading, which counts as "decided in time". Each decision needs one line of reasoning, and the time the brief was open is recorded. A monthly sample of decisions is read by the head of procurement.</${Claim}>
              <${Claim} t="assume">Procurement confirms owner answers without evidence. The check asks what the answer was checked against, and the record keeps it.</${Claim}>
            </ul>
            <h3 class="h3" style="margin-top:14px">What would make me rethink the approach</h3>
            <ul class="claims">
              <${Claim} t="assume">Any wrong confirmed date in the lawyer spot check. Then reading by model plus quote checks is not safe enough, and confirmed dates need a person every time. My held-out run tripped this twice. In a prototype I fixed the cause and re-ran; in a pilot, the same result would mean a person checks every confirmed date until a fresh held-out set comes back clean.</${Claim}>
              <${Claim} t="assume">Most contracts end up needing an answer, because start dates are rarely written down. Then the fix belongs at signature, in intake, by capturing the start date when the contract is signed.</${Claim}>
              <${Claim} t="assume">Most of the at-risk value sits with suppliers that have no contract on file. Then the problem is coverage, collecting signed copies, not reading them.</${Claim}>
              <${Claim} t="assume">Owners ignore questions even when they escalate. Then procurement, not the owner, should own the answer, and the design changes.</${Claim}>
            </ul>
          </section>

          <section id="assumptions">
            <h2 class="h2">Assumptions</h2>
            <ul class="claims">
              <${Claim} t="assume">Signed copies exist and have a text layer. Scanned images would need text recognition, which this prototype does not do.</${Claim}>
              <${Claim} t="assume">Procurement keeps a renewal tracker in Excel today. This replaces the date column with one it can prove.</${Claim}>
              <${Claim} t="assume">Budget owners, categories and annual spend come from the supplier master and payments file. Here that is a labelled sample file of 12 invented suppliers.</${Claim}>
              <${Claim} t="assume">Time to decide before the last safe send date, by category: ${Object.entries(LEAD_DAYS).map(([k, n]) => `${k} ${n} days`).join(", ")}. Longer where replacing the supplier takes a tender or a migration.</${Claim}>
              <${Claim} t="assume">A safety margin of ${SAFETY_MARGIN_BUSINESS_DAYS} working days before the contractual deadline, on top of any deemed delivery time in the contract. The headline date is this safe send date; the contractual deadline is shown under it. Owners have ${QUESTION_DUE_BUSINESS_DAYS} working days to answer before a question escalates.</${Claim}>
              <${Claim} t="assume">When two documents conflict, procurement may choose the earlier, safer deadline on its own, with a written reason. Choosing the later deadline needs Legal's written approval.</${Claim}>
              <${Claim} t="assume">Working days are Monday to Friday. Public holidays are not applied, so true dates can only be earlier. The tool says so wherever it matters.</${Claim}>
              <${Claim} t="assume">No real integrations. Email, reminders and the payments file are simulated. Access permissions are out of scope for the demo.</${Claim}>
              <${Claim} t="assume">The buyer is "Orvanta Commerce Private Limited". Every company, person, address and figure in the samples is invented. The fifteen real contracts on the test bench are public filings.</${Claim}>
            </ul>
          </section>

          <section id="sources">
            <h2 class="h2">Sources</h2>
            <p class="small muted" style="margin-top:4px">Each one re-opened and its figures checked on 22 Nov 2026.</p>
            <ol class="sources">
              <li id="src-1"><a href="https://audit.wa.gov.au/reports-and-publications/reports/01-health-departments-procurement-and-management-of-it-centralised-computing-services-contract/key-findings/financial-management-was-poor-contributing-to-overpayments/" target="_blank" rel="noopener">Office of the Auditor General, Western Australia. Health Department's Procurement and Management of its Centralised Computing Services Contract, Report 1, 17 Feb 2016.</a> 30 invoices sampled from 642; rates on 26 deviated from the contract; 23 overcharged; net overcharge around $41,000 or 8.8%; each branch said checking was another's responsibility.</li>
              <li id="src-2"><a href="https://sfwmd.gov/sites/default/files/documents/fy%202013%20-%20contract%20monitoring_12-29.pdf" target="_blank" rel="noopener">Office of Inspector General, Audit of Contract Monitoring, Project 12-29, published on sfwmd.gov.</a> Laborer services billed and paid at $22.00 an hour against a contract rate of $20.00; $97,371 overpaid from October 2011 to September 2012; the wrong rate had been entered in the buyer's own database. The report itself carries no publication date.</li>
              <li id="src-3"><a href="https://www.sec.gov/Archives/edgar/data/1117106/000119312507259118/dex1027.htm" target="_blank" rel="noopener">Master Services Agreement, Exodus Communications and Netledger (later NetSuite), with Amendment Two of 4 Dec 2007 with SAVVIS. SEC EDGAR.</a> Term runs from a Service Commencement Date set by the supplier's notice; Amendment Two counts it from a Billing Commencement Date instead, sets six-month renewals with 90 days' customer notice, requires legal notices by registered or certified mail or courier, and adds a separate address for termination notices.</li>
              <li id="src-4"><a href="https://www.sec.gov/Archives/edgar/data/0001469011/000119312509180618/dex105.htm" target="_blank" rel="noopener">Master Services Agreement, Oncor Electric Delivery and InfrastruX Group, effective 12 Jun 2008. SEC EDGAR.</a> Section 2.02: the buyer must give at least 180 days' notice to renew; without it, the term extends once for 12 months on existing terms, then ends.</li>
              <li id="src-5"><a href="https://www.lawinsider.com/clause/automatic-renewal" target="_blank" rel="noopener">Law Insider, Automatic Renewal sample clauses.</a> As shown on 22 Nov 2026: 10 sample clauses; none states enough to work out the deadline alone; three state no notice period at all; one counts 60 working days. The samples on that page can change.</li>
              <li id="src-6"><a href="https://www.sirion.ai/press/trusted-contract-data-world-cc-research-report/" target="_blank" rel="noopener">Sirion and WorldCC, Trusted Contract Data: From Repository to System of Record, press release, 18 May 2026.</a> Survey of 170 respondents, 13 Feb to 10 Apr 2026; 54% report no automated data flow between systems; 9% have two-way synchronisation.</li>
              <li id="src-7"><a href="https://github.com/TheAtticusProject/cuad" target="_blank" rel="noopener">The Atticus Project, Contract Understanding Atticus Dataset (CUAD) v1, CC BY 4.0.</a> 510 commercial contracts from public filings, 41 clause categories, labelled by legal experts. I counted 13,823 labelled passages in the released file.</li>
              <li id="src-8"><a href="https://www.sirion.ai/library/contract-insights/auto-renewal-tracking-systems/" target="_blank" rel="noopener">Sirion, How to Stop Missing Auto-Renewal Deadlines and Avoid Unwanted Charges, updated 7 Nov 2026.</a> Configurable renewal and milestone alerts with role-based routing and escalations; advice to confirm the notice method, keep evidence of delivery, and review unclear requirements before relying on an automated deadline.</li>
              <li id="src-9"><a href="https://www.sirion.ai/library/clm-platform/renewal-management-software/" target="_blank" rel="noopener">Sirion, Renewal Management Software: Why Renewals Belong Inside Contract Lifecycle Management, updated 22 Jun 2026.</a> Review of pricing history, escalations, amendments and service level performance before renewal; renegotiation, re-sourcing and approval workflows.</li>
              <li id="src-10"><a href="https://support.ironcladapp.com/hc/en-us/articles/40504286943895-What-s-New-in-Ironclad-Special-Edition-May-2026" target="_blank" rel="noopener">Ironclad Help Center, What's New in Ironclad, Special Edition, May 2026.</a> Renewal Agent producing Renewal Briefs for buy-side renewals in the Vendor Renewals view, available from 15 May 2026. See also the <a href="https://support.ironcladapp.com/hc/en-us/articles/40074088867863-Upcoming-Renewals-View-on-the-Dashboard" target="_blank" rel="noopener">Vendor Renewals view article</a>.</li>
              <li id="src-11"><a href="https://www.gatekeeperhq.com/contract-renewals" target="_blank" rel="noopener">Gatekeeper, Renewal Management.</a> Alerts timed to each contract's notice period, Renewal Guard Agent, spend against contract, scorecards, Renegotiation Opportunity and Exit Risk agents. The page's statistics carry no source, so I do not use them.</li>
              <li id="src-12"><a href="https://help.zoho.com/portal/en/kb/contracts/user-guide/renewals-and-extensions/articles/renewing-a-contract-15-6-2020" target="_blank" rel="noopener">Zoho Contracts Help, Renewing a Contract</a>, and <a href="https://www.zoho.com/contracts/impact/contract-renewal-management.html" target="_blank" rel="noopener">Contract renewal management guide</a>. Renewal approval workflow; built-in renewal, termination, extension and amendment letters; reminders and a calendar view.</li>
              <li id="src-13"><a href="https://www.tropicapp.io/platform/renewal-management" target="_blank" rel="noopener">Tropic, Renewal Management.</a> Renewal calendar scored by savings potential, utilisation and urgency, with benchmark data.</li>
              <li id="src-14"><a href="https://www.flowforma.com/blog/contract-renewal-management-software" target="_blank" rel="noopener">FlowForma, Contract renewal management software, published 11 Nov 2026.</a> Compares nine tools from vendor documentation; written by one of the vendors compared; no hands-on benchmarks. Notice method, delivery and deemed receipt not addressed for any tool; confidence scores and source highlights the only verification aids named.</li>
              <li id="src-15"><a href="https://www.sirion.ai/library/contract-insights/excel-to-clm-migration-legal-ops-automation-playbook/" target="_blank" rel="noopener">Sirion, Excel to CLM Migration: Legal Ops Contract Workflow Automation Playbook, updated 7 Sep 2026.</a> Steps include cleansing and prioritising contracts with upcoming renewals and mapping spreadsheet fields to CLM metadata.</li>
            </ol>
          </section>
        </div>
      </div>
    </div>`;
}
