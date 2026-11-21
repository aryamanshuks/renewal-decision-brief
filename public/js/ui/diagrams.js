import { html } from "./common.js";

// Two hand-drawn diagrams for the About page. Plain SVG, no library.
// Colours follow the site: ink for people, blue for the system, red dashes for tension.

const INK = "#15203b";
const INK2 = "#4a5469";
const INK3 = "#6b7489";
const RULE = "#dbe0e8";
const BLUE = "#2141c4";
const BAD = "#b42318";

function Lines({ x, y, lines, size = 13, weight = 400, fill = INK, anchor = "middle", gap = 1.3 }) {
  const top = y - ((lines.length - 1) * size * gap) / 2;
  return html`<text x=${x} y=${top} text-anchor=${anchor} font-size=${size} font-weight=${weight} fill=${fill} dominant-baseline="middle">
    ${lines.map((l, i) => html`<tspan x=${x} y=${top + i * size * gap}>${l}</tspan>`)}
  </text>`;
}

function Node({ x, y, w, h, name, role, tone = "person" }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const outside = tone === "outside";
  const dim = tone === "dim";
  return html`<g>
    <rect x=${x} y=${y} width=${w} height=${h} rx="8" fill="#fff" stroke=${outside ? BAD : dim ? RULE : INK} stroke-width=${outside || dim ? 1.5 : 1.6} stroke-dasharray=${outside ? "5 4" : ""} />
    <${Lines} x=${cx} y=${cy - (role ? 9 : 0)} lines=${[name]} size=${14.5} weight=${700} fill=${dim ? INK2 : INK} />
    ${role && html`<${Lines} x=${cx} y=${cy + 11} lines=${[role]} size=${12.5} fill=${INK3} />`}
  </g>`;
}

function Pill({ x, y, text, color = BAD, w }) {
  const width = w || text.length * 6.6 + 18;
  return html`<g>
    <rect x=${x - width / 2} y=${y - 11} width=${width} height="22" rx="11" fill="#fff" stroke=${color} stroke-width="1" />
    <text x=${x} y=${y + 0.5} text-anchor="middle" dominant-baseline="middle" font-size="12.5" font-weight="650" fill=${color}>${text}</text>
  </g>`;
}

export function StakeholderMap() {
  // Positions: people inside the company on a 2 by 3 grid, the supplier outside on the right.
  const W = 180, H = 58;
  const L = 44, R = 452;
  const r1 = 52, r2 = 176, r3 = 300;
  return html`
    <figure class="figure">
      <div class="scroll-x">
      <svg viewBox="0 0 900 400" role="img" aria-labelledby="sm-title sm-desc">
        <title id="sm-title">Stakeholder map for a renewal decision</title>
        <desc id="sm-desc">Procurement is the primary user and the budget owner the second user. Red dashed lines mark where interests pull apart: procurement and the budget owner on timing, leverage and facts; procurement and Legal on speed; the company and the supplier, because silence renews the contract. Grey lines show how work reaches the head of procurement and where the payments file comes from.</desc>
        <defs>
          <marker id="sm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill=${INK3} /></marker>
        </defs>

        <rect x="16" y="14" width="652" height="372" rx="12" fill="#fafbfc" stroke=${RULE} stroke-width="1.5" />
        <text x="36" y="36" font-size="12.5" font-weight="650" fill=${INK3}>Inside the company</text>

        <line x1=${L + W / 2} y1=${r2} x2=${L + W / 2} y2=${r1 + H + 2} stroke=${INK3} stroke-width="1.4" marker-end="url(#sm-arrow)" />
        <text x=${L + W / 2 + 10} y=${(r1 + H + r2) / 2} font-size="12" fill=${INK2} dominant-baseline="middle">Overdue items escalate</text>
        <line x1=${L + W / 2} y1=${r3} x2=${L + W / 2} y2=${r2 + H + 2} stroke=${INK3} stroke-width="1.4" marker-end="url(#sm-arrow)" />
        <text x=${L + W / 2 + 10} y=${(r2 + H + r3) / 2} font-size="12" fill=${INK2} dominant-baseline="middle">Payments file sets who is missing</text>

        <line x1=${L + W} y1=${r2 + H / 2} x2=${R} y2=${r2 + H / 2} stroke=${BAD} stroke-width="1.8" stroke-dasharray="6 5" />
        <${Pill} x=${(L + W + R) / 2} y=${r2 + H / 2 + 26} text="Timing, leverage, facts" />
        <line x1=${L + W} y1=${r2 + 8} x2=${R} y2=${r1 + H - 8} stroke=${BAD} stroke-width="1.8" stroke-dasharray="6 5" />
        <${Pill} x=${(L + W + R) / 2} y=${(r2 + r1 + H) / 2 - 1} text="Speed" />
        <line x1=${R + W} y1=${r2 + H / 2} x2=${736} y2=${r2 + H / 2} stroke=${BAD} stroke-width="1.8" stroke-dasharray="6 5" />
        <${Pill} x=${684} y=${r2 + H + 20} text="Silence renews" />

        <${Node} x=${L} y=${r1} w=${W} h=${H} name="Head of procurement" role="Receives escalations" />
        <${Node} x=${R} y=${r1} w=${W} h=${H} name="Legal" role="Only real conflicts" />
        <${Node} x=${L} y=${r2} w=${W} h=${H} name="Procurement" role="Primary user" />
        <${Node} x=${R} y=${r2} w=${W} h=${H} name="Budget owner" role="Second user, decides" />
        <${Node} x=${L} y=${r3} w=${W} h=${H} name="Finance and AP" role="Owns the payments file" />
        <${Node} x=${R} y=${r3} w=${W} h=${H} name="IT and security" role="Out of scope for the demo" tone="dim" />
        <${Node} x=${736} y=${r2} w=${150} h=${H} name="Supplier" role="Not a user" tone="outside" />
      </svg>
      </div>
      <figcaption>Red dashed lines are where interests pull apart; each one is explained below the table. Grey arrows are how work reaches someone.</figcaption>
    </figure>`;
}

// Swimlanes: who does what, in order, and where the path splits.
export function ExperienceFlow() {
  const lanes = [
    ["Procurement", "Primary user"],
    ["Legal", "Only for a later date"],
    ["Budget owner", "Second user"],
    ["Model and code", "The product"],
    ["Head of", "procurement", "Only if overdue"],
  ];
  const top = 32, LH = 88, X0 = 156, STEP = 146, BW = 132, BH = 64;
  const laneY = (i) => top + i * LH + LH / 2;
  const colX = (c) => X0 + 70 + c * STEP;
  const right = (c) => colX(c) + BW / 2;
  const left = (c) => colX(c) - BW / 2;
  const W = colX(5) + BW / 2 + 84;
  const Hh = top + lanes.length * LH;
  const box = (c, lane, lines, kind = "person") => {
    const fill = kind === "decision" ? INK : "#fff";
    const stroke = kind === "system" ? BLUE : INK;
    const text = kind === "decision" ? "#fff" : kind === "system" ? BLUE : INK;
    return html`<g>
      <rect x=${left(c)} y=${laneY(lane) - BH / 2} width=${BW} height=${BH} rx="7" fill=${fill} stroke=${stroke} stroke-width="1.5" />
      <${Lines} x=${colX(c)} y=${laneY(lane)} lines=${lines} size=${14.5} weight=${kind === "decision" ? 650 : 500} fill=${text} gap=${1.25} />
    </g>`;
  };
  const arrow = (d, dashed = false) => html`<path d=${d} fill="none" stroke=${dashed ? INK3 : INK2} stroke-width="1.4" stroke-dasharray=${dashed ? "4 4" : ""} marker-end="url(#xf-arrow)" />`;
  const label = (x, y, t, anchor = "start") => html`<text x=${x} y=${y} font-size="13" font-weight="500" fill=${INK2} text-anchor=${anchor} dominant-baseline="middle" paint-order="stroke" stroke="#fff" stroke-width="4">${t}</text>`;

  return html`
    <figure class="figure">
      <div class="scroll-x">
      <svg viewBox=${`0 0 ${W} ${Hh + 4}`} role="img" aria-labelledby="xf-title xf-desc">
        <title id="xf-title">How the experiences connect</title>
        <desc id="xf-desc">Procurement adds a signed contract family. The model reads it and code checks every quote and works out the dates. If a fact is missing, the budget owner answers one question; an answer that looks odd goes to procurement to check against evidence. If documents conflict, procurement picks a reading with a reason, and picking the later date needs Legal's approval. With every fact confirmed, the budget owner decides to renew, renegotiate or exit. For exit or renegotiate, procurement sends the notice and records proof. Anything overdue goes to the head of procurement.</desc>
        <defs>
          <marker id="xf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill=${INK2} /></marker>
        </defs>
        ${lanes.map((l, i) => html`<g>
          <rect x="0" y=${top + i * LH} width=${W} height=${LH} fill=${i % 2 ? "#fff" : "#f6f7fa"} />
          <${Lines} x="14" y=${laneY(i) - (l.length - 2) * 8 - 8} lines=${l.slice(0, -1)} size=${15} weight=${700} anchor="start" gap=${1.2} />
          <text x="14" y=${laneY(i) + 8 + (l.length - 2) * 9} font-size="12.5" fill=${INK3} dominant-baseline="middle">${l[l.length - 1]}</text>
        </g>`)}
        <line x1=${X0} y1=${top} x2=${X0} y2=${Hh} stroke=${RULE} />
        ${["Add", "Read and check", "Fill the gap", "Confirm", "Decide", "Act"].map((t, c) => html`<text x=${colX(c)} y="18" text-anchor="middle" font-size="13.5" font-weight="650" fill=${INK3}>${t}</text>`)}

        ${arrow(`M${right(0)} ${laneY(0)} H${colX(1)} V${laneY(3) - BH / 2 - 2}`)}
        ${arrow(`M${right(1)} ${laneY(3) - 4} H${colX(2)} V${laneY(2) + BH / 2 + 2}`)}
        ${label(colX(2) + 8, laneY(2) + BH / 2 + 14, "fact missing")}
        ${arrow(`M${right(1)} ${laneY(3) + 14} H${colX(4)} V${laneY(2) + BH / 2 + 2}`)}
        ${label(colX(3), laneY(3) + 30, "every fact confirmed", "middle")}
        ${arrow(`M${right(1)} ${laneY(3) - 18} H${right(1) + 10} V${laneY(0) + 14} H${left(3) - 2}`)}
        ${label(right(1) + 18, laneY(0) + 2, "documents conflict")}
        ${arrow(`M${right(2)} ${laneY(2) - 12} H${colX(3) - 22} V${laneY(0) + BH / 2 + 2}`)}
        ${label(colX(3) - 30, laneY(1) + 10, "odd answer", "end")}
        ${arrow(`M${right(2)} ${laneY(2) + 12} H${left(4) - 2}`)}
        ${arrow(`M${right(3)} ${laneY(0)} H${colX(4)} V${laneY(1) - BH / 2 - 2}`)}
        ${label(colX(4) + 8, laneY(0) + BH / 2 + 10, "later date")}
        ${arrow(`M${colX(4)} ${laneY(1) + BH / 2} V${laneY(2) - BH / 2 - 2}`)}
        ${arrow(`M${colX(3) + 22} ${laneY(0) + BH / 2} V${laneY(2) - 10} H${left(4) - 2}`)}
        ${arrow(`M${right(4)} ${laneY(2)} H${colX(5)} V${laneY(0) + BH / 2 + 2}`)}
        ${label(colX(5) + 8, laneY(1) - 2, "exit or")}
        ${label(colX(5) + 8, laneY(1) + 13, "renegotiate")}
        ${arrow(`M${colX(4) + 28} ${laneY(2) + BH / 2} V${laneY(4) - 22 - 2}`, true)}

        ${box(0, 0, ["Adds the signed", "contract family"])}
        ${box(1, 3, ["Reads, checks", "every quote,", "works out dates"], "system")}
        ${box(2, 2, ["Answers the one", "missing fact"])}
        ${box(3, 0, ["Checks the odd", "answer, or picks", "a reading"])}
        ${box(4, 1, ["Approves the", "later deadline"])}
        ${box(4, 2, ["Decides: renew,", "renegotiate", "or exit"], "decision")}
        ${box(5, 0, ["Sends notice,", "records proof"])}
        <rect x=${left(3)} y=${laneY(4) - 22} width=${right(5) - left(3)} height="44" rx="7" fill="#fff" stroke=${INK} stroke-width="1.5" stroke-dasharray="5 4" />
        <${Lines} x=${(left(3) + right(5)) / 2} y=${laneY(4)} lines=${["Gets any question or decision that is overdue"]} size=${14.5} weight=${500} />
      </svg>
      </div>
      <figcaption>One record, three roles. The product reads, checks and drafts; it never decides and never contacts a supplier. The dashed arrow fires only when something is overdue.</figcaption>
    </figure>`;
}
