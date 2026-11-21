import { html, useEffect } from "./common.js";
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
              <${Claim} t="outside" src="5">In 10 sample automatic renewal clauses on Law Insider, none lets you work out the deadline from the clause alone. Three give no usable notice period, and one counts in working days.</${Claim}>
              <${Claim} t="outside" src="6">Sirion's own 2026 survey with WorldCC (170 respondents) reports that 54% of organisations have no automated data flow between their contract systems. A repository that holds documents is not yet one the business can act on.</${Claim}>
            </ul>
            <p class="small muted" style="margin-top:10px">What I left out on purpose: price and service level checks need invoice and performance data the brief does not give. They are the natural next questions for the same record.</p>
          </section>

          <section id="stakeholders">
            <h2 class="h2">2. Stakeholder map</h2>
            <p style="margin-top:8px">Who has a stake in a renewal decision, what each wants, and where they pull against each other. The last column says how the prototype handles it.</p>
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
            <h3 class="h3" style="margin-top:14px">How I know it is real</h3>
            <ul class="claims">
              <${Claim} t="given">The brief lists unreviewed autorenewals as a result the company already has.</${Claim}>
              <${Claim} t="outside" src="3">The deadline is often not in the contract. In the SEC filing above, the term starts on a date the supplier sets by notice. Its 2007 amendment also requires legal notices by registered or certified mail or courier, and adds a separate address for termination notices. An email to the usual contact would not count.</${Claim}>
              <${Claim} t="outside" src="4">Silence does not always mean renewal. In another public filing, the buyer must give 180 days' notice to renew, and if it does not, the contract extends once for 12 months and then ends. A tool that assumes "auto-renews unless cancelled" would get this wrong.</${Claim}>
              <${Claim} t="outside" src="1">When several teams can check, nobody does. A state audit found that on 26 of 30 sampled invoices the rates did not match the contract, a net overcharge of about $41,000 or 8.8%. Each branch said checking was someone else's job. That is why every question in this prototype goes to one named person.</${Claim}>
              <${Claim} t="outside" src="2">The organisation's own system can be the source of the error. Another audit found a contractor paid $22 an hour against a contract rate of $20, $97,371 over one year, because the wrong rate had been typed into the buyer's own database. That is why every fact here shows the passage it came from.</${Claim}>
              <${Claim} t="tested" check=${["#/tests", "See the test bench"]}>In 510 real contracts labelled by legal experts (CUAD), I counted 109 that have both a renewal term and a notice period to stop renewal. Four of them are on the test bench.</${Claim}>
              <${Claim} t="tested" check=${["#/tests", "See the test bench"]}>On the first live run, the model misread how one sample renews, and in another run it miscopied one digit in a quoted clause. Code caught both. The test bench shows them.</${Claim}>
              <${Claim} t="tested" check=${["#/tests", "See the workflow rules"]}>An independent review of an earlier version found five workflow defects, all after a correct reading: a notice by a method the contract forbids was accepted, deemed receipt after the deadline was ignored, a conflict choice showed the other document's passage, a decision stood after an amendment changed the terms, and a missing-contract row did not clear. All five are fixed and now checked as workflow rules.</${Claim}>
            </ul>
            <div class="banner" style="margin-top:12px">
              <b>What I do not know.</b> How often this happens at this company, how accurate the current tracker is, and how much value sits in contracts that renew silently. I have not interviewed a practitioner. The first discovery step would be to pull the last 12 months of renewals from the tracker and the payments file, and hand-check 30 contracts against both.
            </div>
          </section>

          <section id="prototype">
            <h2 class="h2">4. The working prototype</h2>
            <p style="margin-top:8px"><b>How much the product takes on.</b> It reads, calculates, asks and drafts. It never decides and never contacts a supplier.</p>
            <ul class="claims">
              <${Claim} t="tested" check=${["#/add", "Try your own contract"]}><b>The model reads.</b> Claude Sonnet 5.5 returns each fact with the exact passage it relied on. It is told the documents are data and to ignore instructions inside them.</${Claim}>
              <${Claim} t="tested" check=${["#/c/brightdesk", "See the working"]}><b>Code checks and calculates.</b> Every quoted passage is searched for in the uploaded text. Only found passages get the yellow highlight. Dates, notice delivery time and the safety margin are plain arithmetic, shown step by step.</${Claim}>
              <${Claim} t="tested" check=${["#/c/kestrelway", "See a date it will not confirm"]}><b>No guessed dates.</b> If a date depends on something outside the documents, the brief shows a provisional date, marked as such, and asks one named person one question.</${Claim}>
              <${Claim} t="tested" check=${["#/owner", "Open the owner view"]}><b>Named people decide.</b> The owner answers and decides on the same record procurement sees. Overdue questions and decisions escalate to the head of procurement.</${Claim}>
              <${Claim} t="tested" check=${["#/c/brightdesk", "See a notice draft"]}><b>A person sends.</b> The tool drafts the notice from confirmed facts and records what was actually sent. A method the contract does not allow, or a notice deemed received after the deadline, stays open as an exception.</${Claim}>
            </ul>
            <h3 class="h3" style="margin-top:14px">The core flow, end to end</h3>
            <ol style="margin-top:6px">
              <li>Procurement adds a signed contract and its amendments as one family. <a href="#/add">Add a contract</a></li>
              <li>The model reads it. Code verifies each passage and works out the dates. <a href="#/c/tallyhand">An amended contract</a></li>
              <li>Each fact gets a plain status: confirmed from documents, needs one answer, conflicting terms, or not found in these documents.</li>
              <li>If a fact is missing, one question goes to the budget owner, with the clause shown. <a href="#/c/kestrelway">Kestrelway</a></li>
              <li>The owner answers on the same record. Odd answers go back to procurement to confirm.</li>
              <li>With a confirmed date, the owner records renew, renegotiate or exit, with one line of reasoning.</li>
              <li>Procurement sends the notice the contract requires and records what was sent. The tool checks the method and when it counts as received. <a href="#/c/brightdesk">Brightdesk</a></li>
              <li>The portfolio ranks everything by urgency and annual value, and says what it does not cover. <a href="#/">Portfolio</a></li>
            </ol>
            <p class="small muted" style="margin-top:10px">There is no login. The switch at the top changes role. Email and reminders are shown on screen, not sent. The demo date is pinned to ${"23 Nov 2026"} so the samples stay meaningful, and you can change it at the top.</p>
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
              <${Claim} t="assume">Any wrong confirmed date in the lawyer spot check. Then reading by model plus quote checks is not safe enough, and confirmed dates need a person every time.</${Claim}>
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
              <${Claim} t="assume">The buyer is "Orvanta Commerce Private Limited". Every company, person, address and figure in the samples is invented. The four real contracts on the test bench are public filings.</${Claim}>
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
              <li id="src-5"><a href="https://www.lawinsider.com/clause/automatic-renewal" target="_blank" rel="noopener">Law Insider, Automatic Renewal sample clauses.</a> As shown on 22 Nov 2026: 10 sample clauses; none states enough to work out the deadline alone; three state no usable notice period; one counts 60 working days. The samples on that page can change.</li>
              <li id="src-6"><a href="https://www.cityam.com/new-sirion-and-worldcc-research-reveals-most-enterprises-still-lack-a-trusted-contract-system-of-record/" target="_blank" rel="noopener">Sirion and WorldCC, Trusted Contract Data: From Repository to System of Record, press release, June 2026.</a> Survey of 170 respondents, 13 Feb to 10 Apr 2026; 54% report no automated data flow between systems; 9% have two-way synchronisation. Sirion's report page attaches its 27% figure to a different finding than the press release does, so I do not use that figure.</li>
              <li id="src-7"><a href="https://github.com/TheAtticusProject/cuad" target="_blank" rel="noopener">The Atticus Project, Contract Understanding Atticus Dataset (CUAD) v1, CC BY 4.0.</a> 510 commercial contracts from public filings, 41 clause categories, labelled by legal experts. I counted 13,823 labelled passages in the released file.</li>
            </ol>
          </section>
        </div>
      </div>
    </div>`;
}
