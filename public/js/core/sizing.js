// How big the problem, and the work of running the product, could be at the company in the brief.
// Only the supplier count is given by the brief. Every other default is an assumption, shown as one and editable on the About page.
export const SIZING_GROUPS = [
  ["The company", [
    ["suppliers", "Suppliers", 2500, "", "Given by the brief"],
    ["auto", "On contracts that renew automatically", 40, "%", ""],
    ["value", "Average yearly value of those contracts", 15, "₹ lakh", ""],
    ["due", "Whose renewal comes up in a given year", 60, "%", ""],
  ]],
  ["Today, without the product", [
    ["silent", "That renew with nobody deciding in time", 20, "%", ""],
    ["change", "Where the owner would have exited or renegotiated", 30, "%", ""],
    ["saving", "Saved when they do, as a share of yearly value", 15, "%", ""],
  ]],
  ["Running the product", [
    ["person", "Renewals where a date needs one person's answer", 35, "%", ""],
    ["minutes", "Minutes for an owner to answer, plus procurement to check", 8, "min", ""],
    ["legal", "Renewals where documents conflict and Legal reads both", 5, "%", ""],
    ["readCost", "Model cost to read one contract family", 8, "₹", ""],
    ["churn", "Contracts added or amended each year, so read again", 20, "%", ""],
  ]],
];

export const SIZING_INPUTS = SIZING_GROUPS.flatMap(([, rows]) => rows);
export const SIZING_DEFAULTS = Object.fromEntries(SIZING_INPUTS.map(([k, , d]) => [k, d]));

export function sizeUp(values = SIZING_DEFAULTS) {
  const n = (k) => Math.max(0, Number(values[k]) || 0);
  const pct = (k) => n(k) / 100;
  const yearly = n("value") * 1e5;
  const autoContracts = Math.round(n("suppliers") * pct("auto"));
  const due = Math.round(autoContracts * pct("due"));
  const silent = Math.round(due * pct("silent"));
  const questions = Math.round(due * pct("person"));
  return {
    autoContracts,
    due,
    perMonth: Math.round(due / 12),
    silent,
    committed: silent * yearly,
    avoidable: silent * pct("change") * yearly * pct("saving"),
    dueValue: due * yearly,
    pointValue: (due * yearly) / 100,
    questions,
    perWeek: Math.max(1, Math.round(questions / 48)),
    hours: Math.round((questions * n("minutes")) / 60),
    legal: Math.round(due * pct("legal")),
    backlogCost: n("suppliers") * n("readCost"),
    yearlyReads: Math.round(n("suppliers") * pct("churn")),
    yearlyReadCost: Math.round(n("suppliers") * pct("churn")) * n("readCost"),
  };
}
