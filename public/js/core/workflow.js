// Who has to do what next, and by when. Plain rules, no model.
// The point of these states: sending a question to someone is not the same as them accepting it,
// and recording a decision is not the same as a valid notice reaching the supplier.

import { parseISO, toISO, addDuration, formatDate, daysBetween } from "./dates.js";
import { QUESTION_DUE_BUSINESS_DAYS } from "./rules.js";
import { assessNotice } from "./notice.js";
import { MECHANISM_LABEL } from "./rules.js";

export function questionDueDate(sentOn) {
  const sent = typeof sentOn === "string" ? parseISO(sentOn) : sentOn;
  return sent ? addDuration(sent, QUESTION_DUE_BUSINESS_DAYS, "business_days") : null;
}

export function newQuestion(ownerName, today) {
  return { state: "sent", to: ownerName, sentOn: toISO(today), due: toISO(questionDueDate(today)) };
}

// Which decision needs an action with the supplier to take effect, given how the contract renews.
export function noticeNeededFor(choice, mechanism) {
  if (!choice) return false;
  if (mechanism === "automatic") return choice === "exit" || choice === "renegotiate";
  if (mechanism === "customer_must_give_notice_to_renew") return choice === "renew";
  if (mechanism === "one_time_extension_then_ends") return choice === "renew";
  // A contract that simply ends needs a signed extension if the owner wants to keep the supplier.
  if (mechanism === "mutual_written_agreement" || mechanism === "no_renewal_fixed_term") return choice === "renew" || choice === "renegotiate";
  return false;
}

export function noticeKindFor(choice, mechanism) {
  if (mechanism === "automatic") return "non_renewal";
  if (mechanism === "customer_must_give_notice_to_renew" || mechanism === "one_time_extension_then_ends") return "renewal";
  if (mechanism === "mutual_written_agreement" || mechanism === "no_renewal_fixed_term") return "extension";
  return "none";
}

// The terms a decision was made on. If they change later (an amendment, a corrected reading), the decision reopens.
export function decisionBasis(brief) {
  const d = brief.dates || {};
  return { mechanism: brief.mechanism, termEnd: d.termEnd ? toISO(d.termEnd) : "", cancelBy: d.cancelBy ? toISO(d.cancelBy) : "" };
}

function basisChange(before, now) {
  if (!before) return "";
  const bits = [];
  if (before.mechanism !== now.mechanism) bits.push(`it was "${MECHANISM_LABEL[before.mechanism] || before.mechanism}" and is now "${MECHANISM_LABEL[now.mechanism] || now.mechanism}"`);
  if (before.termEnd !== now.termEnd) bits.push(`the term end moved from ${before.termEnd ? formatDate(parseISO(before.termEnd)) : "none"} to ${now.termEnd ? formatDate(parseISO(now.termEnd)) : "none"}`);
  else if (before.cancelBy !== now.cancelBy) bits.push(`the notice deadline moved from ${before.cancelBy ? formatDate(parseISO(before.cancelBy)) : "none"} to ${now.cancelBy ? formatDate(parseISO(now.cancelBy)) : "none"}`);
  return bits.join("; ");
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
    out.label = first.type === "split" ? "Several renewal dates" : first.type === "inconsistent" ? "Reading contradicts itself" : first.type === "unsigned" ? "Not a signed copy" : first.type === "conflict" ? "Conflicting terms" : first.type === "unverified" ? "Passage not verified" : first.type === "legal" ? "Needs legal review" : "Not found in these documents";
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
  let decision = record.decision || null;
  const notice = record.notice || null;
  const changed = decision ? basisChange(decision.basis, decisionBasis(brief)) : "";
  if (changed) {
    out.stage = "decision";
    out.actorRole = "owner";
    out.actor = owner;
    out.due = d.decideBy;
    out.label = "Terms changed since the decision";
    out.detail = `${decision.by || owner} decided to ${decision.choice} on ${formatDate(parseISO(decision.on))}. Since then ${changed}. ${owner} must confirm or change the decision.`;
    out.tone = "bad";
    out.reopened = true;
    return out;
  }

  if (d.expired) {
    out.stage = "window_closed";
    out.actorRole = "procurement";
    out.actor = procurement;
    out.label = "Term has ended";
    out.detail = `The term in these documents ended on ${formatDate(d.termEnd)}. Check whether a renewal was signed and add it.`;
    out.tone = "bad";
    return out;
  }

  if (notice?.sentOn && decision && noticeNeededFor(decision.choice, brief.mechanism)) {
    const sent = parseISO(notice.sentOn);
    const check = assessNotice(brief, notice, today);
    out.actorRole = "procurement";
    out.actor = procurement;
    if (check.planned && !check.problems.length) {
      out.stage = "notice";
      out.label = notice.kind === "extension" ? "Extension planned" : "Notice planned";
      out.detail = check.open.join(" ");
      out.tone = "warn";
      out.due = notice.kind === "extension" ? d.termEnd : d.sendBy;
      return out;
    }
    if (notice.kind === "extension") {
      if (check.problems.length) {
        out.stage = "notice"; out.label = "Extension signed too late"; out.detail = check.problems.join(" "); out.tone = "bad";
      } else {
        out.stage = "done"; out.label = "Extension signed"; out.detail = `Signed ${formatDate(sent)}. Add the signed extension to this contract family so its new term is read. Reference: ${notice.proof || "none recorded"}.`; out.tone = "good";
      }
      return out;
    }
    if (check.problems.length) {
      out.stage = "notice";
      out.label = "Notice may not count";
      out.detail = `${check.problems.join(" ")} ${d.cancelBy && today && today <= d.cancelBy ? `Send a valid notice that arrives by ${formatDate(d.cancelBy)}.` : "The deadline has passed: escalate and ask the supplier in writing."}`;
      out.tone = "bad";
      out.escalatedTo = escalation;
      return out;
    }
    if (check.open.length) {
      out.stage = "notice";
      out.label = "Delivery not confirmed";
      out.detail = `Sent ${formatDate(sent)} by ${String(notice.method || "an unrecorded method").toLowerCase()}. ${check.open.join(" ")}`;
      out.tone = "warn";
      return out;
    }
    out.stage = "done";
    out.label = "Notice valid and on time";
    out.detail = `Sent ${formatDate(sent)} by ${notice.method.toLowerCase()}; counts as received ${formatDate(check.receipt)}, before the deadline of ${formatDate(d.cancelBy)}. Proof: ${notice.proof || "none recorded"}.`;
    out.tone = "good";
    return out;
  }

  if (d.windowClosed && !noticeNeededFor(decision?.choice, brief.mechanism) && !(decision && decision.choice === "renew" && brief.mechanism === "automatic")) {
    out.stage = "window_closed";
    out.actorRole = "procurement";
    out.actor = procurement;
    out.escalatedTo = escalation;
    out.label = "Notice window closed";
    out.detail = `The last notice date was ${formatDate(d.cancelBy)}.${afterWindow(brief, d)} Escalated to ${escalation}.`;
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

  if (noticeNeededFor(decision.choice, brief.mechanism) && noticeKindFor(decision.choice, brief.mechanism) === "extension") {
    out.stage = "notice";
    out.actorRole = "procurement";
    out.actor = procurement;
    out.due = d.termEnd;
    const late = today && d.termEnd && today > d.termEnd;
    out.label = late ? "Ended without an extension" : "Signed extension needed";
    out.detail = late
      ? `${owner} wanted to ${decision.choice}, but the contract ended on ${formatDate(d.termEnd)} with no signed extension recorded.`
      : `${owner} wants to ${decision.choice === "renew" ? "continue" : "continue on new terms"}. The contract ends on ${formatDate(d.termEnd)} unless both sides sign an extension before then.`;
    out.tone = late ? "bad" : "warn";
    out.overdue = Boolean(late);
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
      out.detail = d.opensOn && today < d.opensOn
        ? `Decided to ${decision.choice}. The notice must arrive between ${formatDate(d.opensOn)} and ${formatDate(d.cancelBy)}. Send it by ${formatDate(d.sendBy)}, but not so early that it arrives before ${formatDate(d.opensOn)}.`
        : `Decided to ${decision.choice}. A person must send the notice by ${formatDate(d.sendBy)}.`;
      out.tone = "warn";
    }
    return out;
  }

  out.stage = "done";
  out.label = `Decided: ${decision.choice}`;
  const ends = ["mutual_written_agreement", "no_renewal_fixed_term", "customer_must_give_notice_to_renew"].includes(brief.mechanism);
  const consequence = decision.choice === "renew" && brief.mechanism === "automatic"
    ? `It renews on ${formatDate(d.renewsOn || d.termEnd)} without any notice.`
    : brief.mechanism === "one_time_extension_then_ends"
      ? `With no notice to renew, it extends once and then ends on ${formatDate(d.extensionEnd || d.termEnd)}. Plan the handover before then.`
      : ends
        ? `It ends on ${formatDate(d.termEnd)}. Plan the handover.`
        : "No notice is needed for this choice.";
  out.detail = `${decision.by || owner} on ${formatDate(parseISO(decision.on))}. ${consequence}`;
  out.tone = "good";
  return out;
}

// What happens now that the notice window has closed, in one sentence.
export function afterWindow(brief, d) {
  if (brief.mechanism === "one_time_extension_then_ends" && d.renewsOn && d.extensionEnd) {
    return ` Without notice to renew, it extends once, from ${formatDate(d.renewsOn)} to ${formatDate(d.extensionEnd)}, and then ends.`;
  }
  if (brief.mechanism === "automatic" && d.renewsOn) return ` It renews on ${formatDate(d.renewsOn)}.`;
  if (brief.mechanism === "customer_must_give_notice_to_renew") return ` It ends on ${formatDate(d.termEnd)} unless both sides agree otherwise in writing.`;
  return "";
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
