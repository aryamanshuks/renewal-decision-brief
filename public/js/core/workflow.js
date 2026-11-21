// Who has to do what next, and by when. Plain rules, no model.
// The point of these states: sending a question to someone is not the same as them accepting it,
// and recording a decision is not the same as a valid notice reaching the supplier.

import { parseISO, toISO, addDuration, formatDate, daysBetween } from "./dates.js";
import { QUESTION_DUE_BUSINESS_DAYS } from "./rules.js";

export function questionDueDate(sentOn) {
  const sent = typeof sentOn === "string" ? parseISO(sentOn) : sentOn;
  return sent ? addDuration(sent, QUESTION_DUE_BUSINESS_DAYS, "business_days") : null;
}

export function newQuestion(ownerName, today) {
  return { state: "sent", to: ownerName, sentOn: toISO(today), due: toISO(questionDueDate(today)) };
}

// Which decision needs a formal notice to take effect, given how the contract renews.
export function noticeNeededFor(choice, mechanism) {
  if (!choice) return false;
  if (mechanism === "automatic") return choice === "exit" || choice === "renegotiate";
  if (mechanism === "customer_must_give_notice_to_renew") return choice === "renew";
  if (mechanism === "one_time_extension_then_ends") return choice === "renew";
  return false;
}

export function noticeKindFor(choice, mechanism) {
  if (mechanism === "automatic") return "non_renewal";
  if (mechanism === "customer_must_give_notice_to_renew" || mechanism === "one_time_extension_then_ends") return "renewal";
  return "none";
}

export const CHOICE_LABEL = { renew: "Renew", renegotiate: "Renegotiate", exit: "Exit" };

// Returns the single next step for a contract.
export function workflowState({ brief, record = {}, supplier = {}, people = {}, today }) {
  const owner = record.ownerOverride || supplier.owner || "the budget owner";
  const escalation = people.escalation?.name || "the head of procurement";
  const procurement = people.procurement?.name || "Procurement";
  const legal = people.legal?.name || "Legal";
  const out = { stage: "none", actor: "", actorRole: "", label: "", detail: "", due: null, overdue: false, escalatedTo: "", tone: "neutral" };

  if (!brief) return out;

  if (brief.hard.length > 0) {
    const toLegal = brief.hard.some((b) => b.route === "legal");
    const first = brief.hard[0];
    out.stage = "blocked";
    out.actorRole = toLegal ? "legal" : "procurement";
    out.actor = toLegal ? legal : procurement;
    out.label = first.type === "inconsistent" ? "Reading contradicts itself" : first.type === "unsigned" ? "Not a signed copy" : first.type === "conflict" ? "Conflicting terms" : first.type === "unverified" ? "Passage not verified" : first.type === "legal" ? "Needs legal review" : "Not found in these documents";
    out.detail = `With ${out.actor}. No date is shown as confirmed until this is settled.`;
    out.tone = "bad";
    return out;
  }

  const needsAnswer = brief.pending.find((b) => b.type === "needs_answer");
  if (needsAnswer) {
    const q = record.question || { state: "sent", to: owner };
    const due = parseISO(q.due);
    out.stage = "question";
    out.due = due;
    out.tone = "warn";
    if (q.state === "declined") {
      out.actorRole = "procurement";
      out.actor = procurement;
      out.label = "Question declined";
      out.detail = `${q.to} says this is not theirs${q.declinedReason ? `: "${q.declinedReason}"` : ""}. ${procurement} must name the right owner.`;
      return out;
    }
    out.actorRole = "owner";
    out.actor = q.to || owner;
    if (due && today && today > due) {
      out.overdue = true;
      out.escalatedTo = escalation;
      out.label = "Question overdue";
      out.detail = `Sent to ${out.actor}, due ${formatDate(due)}. Escalated to ${escalation}.`;
      out.tone = "bad";
    } else {
      out.label = q.state === "accepted" ? "Question accepted" : "Needs one answer";
      out.detail = `${q.state === "accepted" ? "Accepted by" : "Sent to"} ${out.actor}${due ? `, due ${formatDate(due)}` : ""}.`;
    }
    return out;
  }

  if (brief.pending.some((b) => b.type === "awaiting_confirmation")) {
    out.stage = "check_answer";
    out.actorRole = "procurement";
    out.actor = procurement;
    out.label = "Answer needs a check";
    out.detail = `${procurement} must confirm the owner's answer before the date is treated as real.`;
    out.tone = "warn";
    return out;
  }

  if (brief.outcome === "no_deadline") {
    out.stage = "done";
    out.label = "No renewal date";
    out.detail = "Runs until someone ends it. Review it once a year.";
    return out;
  }

  const d = brief.dates;
  if (!d) return out;
  const decision = record.decision || null;
  const notice = record.notice || null;

  if (d.expired) {
    out.stage = "window_closed";
    out.actorRole = "procurement";
    out.actor = procurement;
    out.label = "Term has ended";
    out.detail = `The term in these documents ended on ${formatDate(d.termEnd)}. Check whether a renewal was signed and add it.`;
    out.tone = "bad";
    return out;
  }

  if (notice?.sentOn) {
    const sent = parseISO(notice.sentOn);
    out.stage = "done";
    if (d.cancelBy && sent && sent > d.cancelBy) {
      out.label = "Notice sent late";
      out.detail = `Sent ${formatDate(sent)}, after the last notice date of ${formatDate(d.cancelBy)}. It may not take effect.`;
      out.tone = "bad";
    } else if (d.sendBy && sent && sent > d.sendBy) {
      out.label = "Notice sent";
      out.detail = `Sent ${formatDate(sent)}, inside the safety margin. Proof: ${notice.proof || "none recorded"}.`;
      out.tone = "warn";
    } else {
      out.label = "Notice sent";
      out.detail = `Sent ${formatDate(sent)}, in time. Proof: ${notice.proof || "none recorded"}.`;
      out.tone = "good";
    }
    return out;
  }

  if (d.windowClosed && !noticeNeededFor(decision?.choice, brief.mechanism) && !(decision && decision.choice === "renew" && brief.mechanism === "automatic")) {
    out.stage = "window_closed";
    out.actorRole = "procurement";
    out.actor = procurement;
    out.escalatedTo = escalation;
    out.label = "Notice window closed";
    out.detail = `The last notice date was ${formatDate(d.cancelBy)}.${d.renewsOn ? ` It renews on ${formatDate(d.renewsOn)}.` : ""} Escalated to ${escalation}.`;
    out.tone = "bad";
    return out;
  }

  if (!decision) {
    out.stage = "decision";
    out.actorRole = "owner";
    out.actor = owner;
    out.due = d.decideBy;
    if (d.decideBy && today && today > d.decideBy) {
      out.overdue = true;
      out.escalatedTo = escalation;
      out.label = "Decision overdue";
      const left = d.sendBy ? daysBetween(today, d.sendBy) : null;
      out.detail = `${owner} was due to decide by ${formatDate(d.decideBy)}. Escalated to ${escalation}.${left !== null && left >= 0 ? ` ${left} day${left === 1 ? "" : "s"} left to send notice safely.` : ""}`;
      out.tone = "bad";
    } else {
      out.label = "Decision needed";
      out.detail = `With ${owner}${d.decideBy ? `, due ${formatDate(d.decideBy)}` : ""}.`;
      out.tone = "warn";
    }
    return out;
  }

  if (noticeNeededFor(decision.choice, brief.mechanism)) {
    out.stage = "notice";
    out.actorRole = "procurement";
    out.actor = procurement;
    out.due = d.sendBy;
    if (d.cancelBy && today && today > d.cancelBy) {
      out.overdue = true;
      out.escalatedTo = escalation;
      out.label = "Notice not sent in time";
      out.detail = `Decided to ${decision.choice}, but the last notice date of ${formatDate(d.cancelBy)} has passed.`;
      out.tone = "bad";
    } else if (d.sendBy && today && today > d.sendBy) {
      out.overdue = true;
      out.escalatedTo = escalation;
      out.label = "Send notice now";
      out.detail = `Decided to ${decision.choice}. The safe send date of ${formatDate(d.sendBy)} has passed. Last contractual date: ${formatDate(d.cancelBy)}.`;
      out.tone = "bad";
    } else {
      out.label = "Notice to send";
      out.detail = `Decided to ${decision.choice}. A person must send the notice by ${formatDate(d.sendBy)}.`;
      out.tone = "warn";
    }
    return out;
  }

  out.stage = "done";
  out.label = `Decided: ${decision.choice}`;
  out.detail = `${decision.by || owner} on ${formatDate(parseISO(decision.on))}. No notice is needed for this choice.`;
  out.tone = "good";
  return out;
}

// Urgency bands for the portfolio. Lower band means look at it sooner.
export function priorityBand({ brief, flow, today }) {
  if (!brief) return 3;
  if (flow.stage === "window_closed" || flow.overdue) return 0;
  if (flow.stage === "blocked") return 1;
  const working = brief.dates?.decideBy || brief.provisional?.dates?.decideBy || null;
  if (flow.stage === "question" || flow.stage === "check_answer") {
    // Date not confirmed: treat as urgent unless even the provisional date is far away.
    if (!working) return 1;
    return daysBetween(today, working) <= 60 ? 1 : 2;
  }
  if (flow.stage === "done") return 3;
  if (!working) return 3;
  const days = daysBetween(today, working);
  if (days <= 30) return 1;
  if (days <= 120) return 2;
  return 3;
}

export const BAND_LABEL = [
  "Act now",
  "Decide this month, or the date is not confirmed",
  "Coming up in the next four months",
  "Later, settled, or no renewal date",
];
