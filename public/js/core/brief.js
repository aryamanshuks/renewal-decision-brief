// Turns the model's reading of a contract family into a decision brief.
// Everything here is plain code: quote checks, statuses, date arithmetic and the rule for when a date may be shown as confirmed.

import {
  parseISO, toISO, formatDate, addDays, daysBetween, addDuration, subtractDuration, subtractBusinessDays,
  previousBusinessDayOnOrBefore, termEndFromStart, isUsableDuration, describeDuration, normalizeUnit,
} from "./dates.js";
import { verifyQuote, isVerified } from "./verify.js";
import { leadDaysFor, SAFETY_MARGIN_BUSINESS_DAYS, MECHANISM_LABEL, formatMoney } from "./rules.js";

const RENEWING = new Set(["automatic", "one_time_extension_then_ends"]);
const ENDS_ON_SILENCE = new Set(["customer_must_give_notice_to_renew", "mutual_written_agreement", "no_renewal_fixed_term"]);

function docText(documents, id) {
  const doc = (documents || []).find((d) => d.id === id);
  return doc ? doc.text : "";
}

function docName(documents, id) {
  const doc = (documents || []).find((d) => d.id === id);
  return doc ? doc.name : "";
}

// Checks one evidence object against the uploaded text.
export function checkEvidence(evidence, documents) {
  const quote = String(evidence?.quote || "").trim();
  const docId = String(evidence?.doc_id || "").trim();
  if (!quote) return { quote: "", docId: "", docName: "", level: "none", start: -1, end: -1 };
  let target = docId;
  let result = verifyQuote(docText(documents, docId), quote);
  if (!isVerified(result)) {
    // The model may have named the wrong document. Look in the others, and say so if found.
    for (const doc of documents || []) {
      if (doc.id === docId) continue;
      const other = verifyQuote(doc.text, quote);
      if (isVerified(other)) {
        result = other;
        target = doc.id;
        break;
      }
    }
  }
  return {
    quote,
    docId: target,
    docName: docName(documents, target),
    namedDocId: docId,
    movedFromNamedDoc: target !== docId,
    level: result.level,
    start: result.start,
    end: result.end,
  };
}

function hasValue(v) {
  return v !== undefined && v !== null && String(v).trim() !== "";
}

function fact(key, label, value, status, evidence, note = "") {
  return { key, label, value, status, evidence, note };
}

function statusFromEvidence(found, evidence, manual) {
  if (!found) return "not_found";
  if (manual === "confirmed") return "procurement_confirmed";
  if (manual === "rejected") return "not_found";
  if (evidence.level === "none") return "unverified";
  return isVerified(evidence) ? "confirmed" : "unverified";
}

function conflictFor(extraction, field) {
  return (extraction.conflicts || []).find((c) => c.field === field) || null;
}

function changeFor(extraction, field) {
  return (extraction.changes_by_later_documents || []).filter((c) => c.field === field);
}

function pushCalc(calc, text) {
  if (text) calc.push(text);
}

// Works out the dates for one reading of the terms. Pure arithmetic.
export function computeDates({ start, initialNumber, initialUnit, fixedEnd, mechanism, renewalNumber, renewalUnit, noticeNumber, noticeUnit, deemedNumber, deemedUnit, leadDays, today }) {
  const out = {
    termStart: start || null, initialEnd: null, termEnd: null, renewalsPassed: 0, cancelBy: null, sendBy: null, decideBy: null,
    windowClosed: false, nextTermEnd: null, nextCancelBy: null, expired: false, renewsOn: null,
  };
  if (fixedEnd) out.initialEnd = fixedEnd;
  else if (start && isUsableDuration(initialNumber, initialUnit)) out.initialEnd = termEndFromStart(start, initialNumber, initialUnit);
  if (!out.initialEnd) return out;

  out.termEnd = out.initialEnd;
  const canRoll = mechanism === "automatic" && isUsableDuration(renewalNumber, renewalUnit);
  if (today && out.termEnd < today) {
    if (canRoll) {
      let guard = 0;
      while (out.termEnd < today && guard < 400) {
        out.termEnd = termEndFromStart(addDays(out.termEnd, 1), renewalNumber, renewalUnit);
        out.renewalsPassed += 1;
        guard += 1;
      }
    } else if (mechanism === "one_time_extension_then_ends" && isUsableDuration(renewalNumber, renewalUnit)) {
      // The initial term has passed, so the single silent extension has started (or run out). Nothing renews after it.
      out.termEnd = termEndFromStart(addDays(out.termEnd, 1), renewalNumber, renewalUnit);
      out.renewalsPassed = 1;
      out.finalTerm = true;
      if (out.termEnd < today) out.expired = true;
    } else {
      out.expired = true;
    }
  }

  if (out.finalTerm) {
    out.decideBy = addDays(out.termEnd, -leadDays);
    return out;
  }

  if (isUsableDuration(noticeNumber, noticeUnit)) {
    out.cancelBy = subtractDuration(out.termEnd, noticeNumber, noticeUnit);
    out.sendBy = sendByFor(out.cancelBy, deemedNumber, deemedUnit);
    out.decideBy = addDays(out.sendBy, -leadDays);
    if (today && out.cancelBy < today && !out.expired) {
      out.windowClosed = true;
      if (RENEWING.has(mechanism) && isUsableDuration(renewalNumber, renewalUnit)) {
        out.renewsOn = addDays(out.termEnd, 1);
        out.nextTermEnd = termEndFromStart(out.renewsOn, renewalNumber, renewalUnit);
        if (mechanism === "automatic") out.nextCancelBy = subtractDuration(out.nextTermEnd, noticeNumber, noticeUnit);
      }
    }
  } else {
    // No notice mechanics: the working date is the end of the term itself.
    out.decideBy = addDays(out.termEnd, -leadDays);
  }
  if (!out.renewsOn && RENEWING.has(mechanism)) out.renewsOn = addDays(out.termEnd, 1);
  return out;
}

export function sendByFor(cancelBy, deemedNumber, deemedUnit) {
  let date = cancelBy;
  if (isUsableDuration(deemedNumber, deemedUnit)) {
    date = normalizeUnit(deemedUnit) === "business_days" ? subtractBusinessDays(date, deemedNumber) : addDays(date, -deemedNumber);
  }
  date = previousBusinessDayOnOrBefore(date);
  return subtractBusinessDays(date, SAFETY_MARGIN_BUSINESS_DAYS);
}

// The answer an owner gave for the term start can look wrong. These checks decide when procurement must confirm it.
export function oddStartReasons(startDate, agreementDate, today) {
  const reasons = [];
  if (!startDate) return reasons;
  if (agreementDate && startDate < agreementDate) reasons.push(`It is before the agreement was signed on ${formatDate(agreementDate)}.`);
  if (today && startDate > today) reasons.push("It is in the future.");
  if (agreementDate && daysBetween(agreementDate, startDate) > 548) reasons.push("It is more than 18 months after signing.");
  return reasons;
}

// Main entry point.
//   extraction  the model's structured reading
//   documents   [{ id, name, text }] exactly as sent to the model
//   record      saved human input: { answers, resolutions }
//   supplier    { name, category, annualValue, currency, owner }
//   today       Date
export function buildBrief({ extraction, documents, record = {}, supplier = {}, today }) {
  const x = extraction || {};
  const answers = record.answers || {};
  const resolutions = record.resolutions || {};
  const manual = resolutions.passages || {};
  // A conflict choice is stored as { side, reason, by, on, legal }; older records hold just the side letter.
  const pickedRaw = resolutions.conflicts || {};
  const pickedConflicts = {};
  for (const [k, v] of Object.entries(pickedRaw)) {
    const side = typeof v === "string" ? v : v?.side;
    if (side === "a" || side === "b") pickedConflicts[k] = side;
  }
  const leadDays = leadDaysFor(supplier.category);
  const facts = [];
  const blockers = [];
  const assumptions = [];
  const calc = [];

  const term = x.term || {};
  const renewal = x.renewal || {};
  const notice = x.notice || {};
  const price = x.price_on_renewal || {};
  const exit = x.exit_rights || {};
  const precedence = x.precedence || {};
  const contract = x.contract || {};

  const agreementDate = parseISO(contract.agreement_date);
  const agreementEvidence = checkEvidence(contract.agreement_date_evidence, documents);

  // ---- Signed or draft
  const signed = contract.signed_status || "unclear";
  if (signed === "unsigned_or_draft" && manual.signed_status !== "confirmed") {
    // A draft can read exactly like a contract. No date from it is treated as real until a person says it is the signed version.
    blockers.push({
      type: "unsigned", field: "signed_status", route: "procurement",
      message: "This reads as a draft, not a signed copy. Its terms may differ from what was signed, so no date is taken from it.",
    });
  } else if (signed === "unclear") {
    blockers.push({
      type: "unsigned", field: "signed_status", route: "procurement", soft: true,
      message: "The text does not show clearly that both parties signed. Check that this is the signed copy.",
    });
  }

  // ---- Renewal mechanism
  const mechanism = renewal.mechanism || "not_found";
  const renewalEvidence = checkEvidence(renewal.evidence, documents);
  const mechanismFound = !["not_found", "unclear"].includes(mechanism);
  let mechanismStatus = statusFromEvidence(mechanismFound, renewalEvidence, manual.renewal_mechanism);
  if (mechanism === "unclear") mechanismStatus = "conflict";
  const mechanismConflict = conflictFor(x, "renewal_mechanism");
  if (mechanismConflict && !pickedConflicts.renewal_mechanism) mechanismStatus = "conflict";
  // Code cross-checks the model against itself: a contract classed as ending on silence must not also be described as extending on silence.
  const silentText = String(renewal.if_no_one_acts || "");
  const contradicts = ENDS_ON_SILENCE.has(mechanism) && saysItContinues(silentText);
  if (contradicts && !manual.renewal_mechanism) {
    mechanismStatus = "unverified";
    blockers.push({
      type: "inconsistent", field: "renewal_mechanism", route: "procurement",
      message: `The reading contradicts itself. It classes this as "${MECHANISM_LABEL[mechanism] || mechanism}", but also says: "${stripDot(silentText)}". A person must read the renewal clause.`,
    });
  }
  facts.push(fact("renewal_mechanism", "What happens at the end of the term", MECHANISM_LABEL[mechanism] || mechanism, mechanismStatus, renewalEvidence, renewal.if_no_one_acts || ""));

  // ---- Term start
  const startEvidence = checkEvidence(term.start_evidence, documents);
  const startBasis = term.start_basis || "not_found";
  const startLabel = term.start_label || "start date";
  let start = null;
  let startStatus = "not_found";
  let startValue = "";
  let question = null;
  let startSource = "";
  const startConflict = conflictFor(x, "term_start");

  if (startConflict && !pickedConflicts.term_start) {
    startStatus = "conflict";
    startValue = "Two readings";
  } else if (startConflict && pickedConflicts.term_start) {
    const side = pickedConflicts.term_start === "b" ? "b" : "a";
    start = parseISO(startConflict[`${side}_date`]);
    startStatus = start ? "procurement_confirmed" : "not_found";
    startValue = start ? formatDate(start) : "";
    startSource = "reading chosen by procurement";
  } else if ((startBasis === "fixed_calendar_date" || startBasis === "defined_date_stated_in_documents") && parseISO(term.start_date)) {
    start = parseISO(term.start_date);
    startStatus = statusFromEvidence(true, startEvidence, manual.term_start);
    startValue = `${formatDate(start)}${startLabel ? ` (${startLabel})` : ""}`;
    startSource = "stated in the documents";
  } else if (startBasis === "event_or_date_not_stated_in_documents") {
    const answer = answers.term_start_date;
    const answered = answer && parseISO(answer.value);
    question = {
      id: "term_start_date",
      label: startLabel,
      event: term.start_event_description || "",
      text: `The term of this contract runs from the ${startLabel}${term.start_event_description ? ` (${lowerFirst(stripDot(term.start_event_description))})` : ""}. On what date did that happen?`,
      why: "The documents do not give this date, and every deadline is counted from it.",
      evidence: startEvidence,
      askOf: "owner",
    };
    if (answered) {
      start = answered;
      const odd = oddStartReasons(start, agreementDate, today);
      if (odd.length && answer.procurement !== "confirmed") {
        startStatus = "awaiting_confirmation";
        startValue = `${formatDate(start)} (answered by ${answer.by || "the owner"})`;
        blockers.push({
          type: "awaiting_confirmation", field: "term_start", route: "procurement",
          message: `The owner's answer needs a second look. ${odd.join(" ")}`,
          reasons: odd,
        });
      } else {
        startStatus = answer.procurement === "confirmed" ? "procurement_confirmed" : "owner_confirmed";
        startValue = `${formatDate(start)} (answered by ${answer.by || "the owner"})`;
      }
      startSource = answer.evidenceNote ? `answered by ${answer.by || "the owner"}, evidence: ${answer.evidenceNote}` : `answered by ${answer.by || "the owner"}, no evidence attached`;
      if (answer.procurement === "confirmed" && answer.checkedAgainst) startSource += `; checked by ${answer.checkedBy || "procurement"} against ${answer.checkedAgainst}`;
    } else {
      startStatus = "needs_answer";
      startValue = `Runs from the ${startLabel}. No date in the documents.`;
      blockers.push({ type: "needs_answer", field: "term_start", route: "owner", message: question.text });
    }
  } else {
    startStatus = "not_found";
    startValue = "";
    blockers.push({ type: "not_found", field: "term_start", route: "procurement", message: "The documents do not say when the term starts." });
  }
  facts.push(fact("term_start", "Term starts", startValue, startStatus, startEvidence, term.start_event_description || ""));

  // ---- Initial term
  const initialEvidence = checkEvidence(term.initial_term_evidence, documents);
  let initialNumber = Number(term.initial_term_number) || 0;
  let initialUnit = normalizeUnit(term.initial_term_unit);
  const fixedEnd = parseISO(term.fixed_end_date);
  const initialConflict = conflictFor(x, "initial_term");
  let initialStatus;
  let initialValue = "";
  const mechanismNeedsTerm = mechanism !== "continues_until_terminated";
  if (initialConflict && !pickedConflicts.initial_term) {
    initialStatus = "conflict";
    initialValue = "Two readings";
  } else {
    if (initialConflict && pickedConflicts.initial_term) {
      const side = pickedConflicts.initial_term === "b" ? "b" : "a";
      initialNumber = Number(initialConflict[`${side}_number`]) || 0;
      initialUnit = normalizeUnit(initialConflict[`${side}_unit`]);
    }
    const found = Boolean(fixedEnd) || isUsableDuration(initialNumber, initialUnit);
    initialStatus = initialConflict && pickedConflicts.initial_term ? (found ? "procurement_confirmed" : "not_found") : statusFromEvidence(found, initialEvidence, manual.initial_term);
    initialValue = fixedEnd ? `Until ${formatDate(fixedEnd)}` : describeDuration(initialNumber, initialUnit);
    if (!found && mechanismNeedsTerm) {
      blockers.push({ type: "not_found", field: "initial_term", route: "procurement", message: "The documents do not give the length of the term." });
    }
  }
  if (mechanism === "continues_until_terminated" && initialStatus === "not_found") initialStatus = "not_applicable";
  facts.push(fact("initial_term", "Initial term", initialValue, initialStatus, initialEvidence));

  // ---- Renewal period
  let renewalNumber = Number(renewal.renewal_term_number) || 0;
  let renewalUnit = normalizeUnit(renewal.renewal_term_unit);
  const renewalTermConflict = conflictFor(x, "renewal_term");
  let renewalTermStatus = "not_applicable";
  if (RENEWING.has(mechanism)) {
    if (renewalTermConflict && !pickedConflicts.renewal_term) renewalTermStatus = "conflict";
    else {
      if (renewalTermConflict && pickedConflicts.renewal_term) {
        const side = pickedConflicts.renewal_term === "b" ? "b" : "a";
        renewalNumber = Number(renewalTermConflict[`${side}_number`]) || 0;
        renewalUnit = normalizeUnit(renewalTermConflict[`${side}_unit`]);
      }
      renewalTermStatus = statusFromEvidence(isUsableDuration(renewalNumber, renewalUnit), renewalEvidence, manual.renewal_mechanism);
    }
    facts.push(fact("renewal_term", mechanism === "automatic" ? "Each renewal lasts" : "The extension lasts", describeDuration(renewalNumber, renewalUnit), renewalTermStatus, renewalEvidence));
  }

  // ---- Notice
  const noticeEvidence = checkEvidence(notice.evidence, documents);
  let noticeNumber = Number(notice.period_number) || 0;
  let noticeUnit = normalizeUnit(notice.period_unit);
  const noticeConflict = conflictFor(x, "notice_period");
  const noticeNeeded = mechanism === "automatic" || mechanism === "customer_must_give_notice_to_renew" || mechanism === "one_time_extension_then_ends";
  let noticeStatus = "not_applicable";
  let noticeValue = "";
  if (noticeConflict && !pickedConflicts.notice_period) {
    noticeStatus = "conflict";
    noticeValue = "Two readings";
  } else {
    if (noticeConflict && pickedConflicts.notice_period) {
      const side = pickedConflicts.notice_period === "b" ? "b" : "a";
      noticeNumber = Number(noticeConflict[`${side}_number`]) || 0;
      noticeUnit = normalizeUnit(noticeConflict[`${side}_unit`]);
    }
    const found = isUsableDuration(noticeNumber, noticeUnit);
    if (found || noticeNeeded) {
      noticeStatus = noticeConflict && pickedConflicts.notice_period ? (found ? "procurement_confirmed" : "not_found") : statusFromEvidence(found, noticeEvidence, manual.notice_period);
      noticeValue = found ? `${describeDuration(noticeNumber, noticeUnit)} ${noticePurposeText(notice.purpose, mechanism)}` : "";
      if (!found && noticeNeeded) {
        blockers.push({ type: "not_found", field: "notice_period", route: "procurement", message: "The documents do not give a notice period for stopping or triggering renewal." });
      }
    }
  }
  const who = notice.who_may_give || "not_found";
  if (noticeStatus !== "not_applicable") {
    facts.push(fact("notice_period", "Notice period", noticeValue, noticeStatus, noticeEvidence, whoText(who)));
  }
  if (mechanism === "automatic" && who === "supplier_only") {
    blockers.push({ type: "legal", field: "notice_period", route: "legal", message: "As written, only the supplier can stop the renewal. Legal should read this clause." });
  }
  const countedFrom = notice.counted_back_from || "end_of_current_term";
  if (noticeNeeded && ["a_fixed_calendar_date", "other_or_unclear"].includes(countedFrom) && isUsableDuration(noticeNumber, noticeUnit)) {
    blockers.push({ type: "legal", field: "notice_period", route: "procurement", message: "The notice period is not counted back from the end of the term. This code does not calculate that pattern, so the date needs a person." });
  }

  // ---- Delivery of notice
  const deliveryEvidence = checkEvidence(notice.delivery_evidence, documents);
  const deemedNumber = Number(notice.deemed_receipt_number) || 0;
  const deemedUnit = normalizeUnit(notice.deemed_receipt_unit);
  const deliveryFound = hasValue(notice.delivery_methods);
  const deliveryStatus = statusFromEvidence(deliveryFound, deliveryEvidence, manual.notice_delivery);
  const deliveryBits = [];
  if (deliveryFound) deliveryBits.push(stripDot(notice.delivery_methods));
  if (notice.email_is_valid === "no") deliveryBits.push("email does not count");
  if (isUsableDuration(deemedNumber, deemedUnit)) deliveryBits.push(`deemed received after ${describeDuration(deemedNumber, deemedUnit)}`);
  facts.push(fact("notice_delivery", "How notice must be sent", deliveryBits.join("; "), deliveryStatus, deliveryEvidence, notice.notice_address ? `Address: ${notice.notice_address}` : ""));

  // ---- Price on renewal
  const priceEvidence = checkEvidence(price.evidence, documents);
  const priceFound = hasValue(price.rule) && price.rule !== "not_addressed";
  facts.push(fact("price_on_renewal", "Price on renewal", price.summary || (priceFound ? price.rule : ""), statusFromEvidence(priceFound, priceEvidence, manual.price_on_renewal), priceEvidence));

  // ---- Exit rights
  const exitEvidence = checkEvidence(exit.evidence, documents);
  const exitFound = hasValue(exit.summary) && exit.customer_can_terminate_for_convenience !== "not_stated";
  facts.push(fact("exit_rights", "Other ways to exit", exit.summary || "", statusFromEvidence(exitFound || isVerified(exitEvidence), exitEvidence, manual.exit_rights), exitEvidence));

  // ---- Which document wins
  const precedenceEvidence = checkEvidence(precedence.evidence, documents);
  const precedenceFound = hasValue(precedence.rule) && !["not_stated", "unclear"].includes(precedence.rule);
  if ((documents || []).length > 1 || precedenceFound) {
    const precedenceStatus = precedence.rule === "unclear" ? "conflict" : statusFromEvidence(precedenceFound, precedenceEvidence, manual.precedence);
    facts.push(fact("precedence", "If documents conflict", precedence.summary || "", precedenceStatus, precedenceEvidence));
  }

  // ---- A conflict settled by a person: the fact shows the chosen passage, and the rejected one stays visible
  for (const f of facts) {
    const c = conflictFor(x, f.key);
    const side = pickedConflicts[f.key];
    if (!c || !side) continue;
    const other = side === "a" ? "b" : "a";
    const raw = typeof pickedRaw[f.key] === "object" ? pickedRaw[f.key] : {};
    f.evidence = checkEvidence(c[`evidence_${side}`], documents);
    f.note = `Reading ${side.toUpperCase()} chosen${raw.by ? ` by ${raw.by}` : ""}${raw.on ? ` on ${formatDate(parseISO(raw.on))}` : ""}${raw.reason ? `: ${stripDot(raw.reason)}` : ""}.${raw.legal ? " Legal approved this reading in writing." : ""}`;
    f.rejected = { label: `Not chosen, reading ${other.toUpperCase()}`, reading: c[`reading_${other}`], evidence: checkEvidence(c[`evidence_${other}`], documents) };
  }
  // Contradictory precedence clauses stay a problem only while a date-critical conflict is still open.
  const criticalConflicts = (x.conflicts || []).filter((c) => ["term_start", "initial_term", "renewal_mechanism", "renewal_term", "notice_period"].includes(c.field));
  const precedenceFact = facts.find((f) => f.key === "precedence");
  if (precedenceFact && precedenceFact.status === "conflict" && criticalConflicts.length && criticalConflicts.every((c) => pickedConflicts[c.field])) {
    precedenceFact.status = "procurement_confirmed";
    precedenceFact.note = "Settled for this contract by the choice recorded above.";
  }

  // ---- Conflicts and unverified passages become blockers when they sit on a date-critical field
  const critical = [
    ["term_start", startStatus], ["initial_term", initialStatus], ["renewal_mechanism", mechanismStatus],
    ["notice_period", noticeStatus], ["renewal_term", renewalTermStatus],
  ];
  for (const [field, status] of critical) {
    if (status === "conflict") {
      const c = conflictFor(x, field);
      blockers.push({
        type: "conflict", field, route: "procurement",
        message: c ? `Two documents disagree: ${stripDot(c.reading_a)} versus ${lowerFirst(stripDot(c.reading_b))}. ${c.why_unresolved || ""}`.trim() : "The renewal wording can be read more than one way.",
        conflict: c,
      });
    }
    if (status === "unverified" && !blockers.some((b) => b.type === "inconsistent" && b.field === field)) {
      blockers.push({ type: "unverified", field, route: "procurement", message: "The passage the model quoted for this could not be found in the uploaded text, so the reading is not confirmed." });
    }
  }
  if (!mechanismFound && mechanism === "not_found") {
    blockers.push({ type: "not_found", field: "renewal_mechanism", route: "procurement", message: "No renewal wording was found in these documents. That is not the same as the contract having none." });
  }

  // ---- Later documents that changed a term
  const changes = (x.changes_by_later_documents || []).map((c) => ({
    field: c.field,
    earlier: c.earlier_value,
    later: c.later_value,
    governs: c.which_governs,
    basis: c.basis,
    earlierEvidence: checkEvidence(c.earlier_evidence, documents),
    laterEvidence: checkEvidence(c.later_evidence, documents),
  }));
  for (const c of changes) {
    if (c.governs === "unclear" && ["term_start", "initial_term", "renewal_mechanism", "renewal_term", "notice_period"].includes(c.field) && !pickedConflicts[c.field]) {
      if (!blockers.some((b) => b.type === "conflict" && b.field === c.field)) {
        blockers.push({ type: "conflict", field: c.field, route: "legal", message: `A later document changes this term, and it is unclear which version governs: ${stripDot(c.earlier)} or ${lowerFirst(stripDot(c.later))}.` });
      }
    }
  }

  // ---- One family, several separately renewing parts: one date would be wrong for some of them
  const parts = Number(x.separately_renewing_parts) || 0;
  if (parts > 1) {
    blockers.push({
      type: "split", field: "term_start", route: "procurement",
      message: `This family holds ${parts} parts that renew separately. ${x.parts_summary ? `${stripDot(x.parts_summary)}. ` : ""}Add each order form or statement of work as its own contract, with the master agreement, so each gets its own date.`,
    });
  }

  // ---- Missing documents
  const missing = (x.missing_documents || []).map((m) => ({ name: m.name, why: m.why_it_matters, evidence: checkEvidence(m.evidence, documents) }));

  // ---- Dates
  const hard = blockers.filter((b) => !b.soft && ["unsigned", "split", "inconsistent", "conflict", "unverified", "not_found", "legal"].includes(b.type));
  const pending = blockers.filter((b) => ["needs_answer", "awaiting_confirmation"].includes(b.type));
  // A notice period only moves the renewal dates when the contract's renewal depends on notice.
  // A general right to terminate on notice at any time is an exit right, not a renewal deadline.
  const noticeDrivesDates = noticeNeeded && !["to_terminate_at_any_time", "not_applicable"].includes(notice.purpose || "");
  const base = {
    initialNumber, initialUnit, fixedEnd, mechanism, renewalNumber, renewalUnit,
    noticeNumber: noticeDrivesDates ? noticeNumber : 0, noticeUnit: noticeDrivesDates ? noticeUnit : "none",
    deemedNumber, deemedUnit, leadDays, today,
  };

  let outcome;
  let dates = null;
  let provisional = null;
  const alternatives = [];
  const noDeadlineMechanism = mechanism === "continues_until_terminated";

  const canCompute = (s) => Boolean(s || fixedEnd) && (Boolean(fixedEnd) || isUsableDuration(initialNumber, initialUnit));

  if (noDeadlineMechanism && !hard.some((b) => b.field === "renewal_mechanism")) {
    outcome = "no_deadline";
  } else if (hard.length === 0 && pending.length === 0 && canCompute(start)) {
    dates = computeDates({ ...base, start });
    outcome = (ENDS_ON_SILENCE.has(mechanism) || dates.finalTerm) && !dates.cancelBy ? "ends" : "confirmed";
    // When a person supplied the start date, show what guessing from the signing date would have said.
    if (question && agreementDate && start && toISO(start) !== toISO(agreementDate)) {
      const guess = computeDates({ ...base, start: agreementDate });
      if (guess.cancelBy && dates.cancelBy && toISO(guess.cancelBy) !== toISO(dates.cancelBy)) {
        dates.guessedCancelBy = guess.cancelBy;
      }
    }
  } else if (hard.length === 0 && pending.length > 0) {
    outcome = "provisional";
    const awaiting = pending.find((b) => b.type === "awaiting_confirmation");
    if (awaiting && start && canCompute(start)) {
      provisional = { dates: computeDates({ ...base, start }), basis: `if the owner's answer of ${formatDate(start)} is right` };
    } else if (agreementDate && canCompute(agreementDate)) {
      provisional = {
        dates: computeDates({ ...base, start: agreementDate }),
        basis: `if the term began on the signing date, ${formatDate(agreementDate)}. If it began earlier, every date below is earlier too`,
        agreementEvidence,
      };
    }
  } else {
    outcome = "blocked";
    // For a conflict on a duration, show the date each reading would give.
    for (const b of hard.filter((h) => h.type === "conflict" && h.conflict)) {
      const c = b.conflict;
      for (const side of ["a", "b"]) {
        const variant = { ...base };
        let s = start;
        if (c.field === "notice_period") { variant.noticeNumber = Number(c[`${side}_number`]) || 0; variant.noticeUnit = normalizeUnit(c[`${side}_unit`]); }
        if (c.field === "initial_term") { variant.initialNumber = Number(c[`${side}_number`]) || 0; variant.initialUnit = normalizeUnit(c[`${side}_unit`]); }
        if (c.field === "renewal_term") { variant.renewalNumber = Number(c[`${side}_number`]) || 0; variant.renewalUnit = normalizeUnit(c[`${side}_unit`]); }
        if (c.field === "term_start") s = parseISO(c[`${side}_date`]);
        const otherHard = hard.filter((h) => h !== b);
        if (otherHard.length === 0 && s && (variant.fixedEnd || isUsableDuration(variant.initialNumber, variant.initialUnit))) {
          alternatives.push({ field: c.field, side, reading: c[`reading_${side}`], evidence: checkEvidence(c[`evidence_${side}`], documents), dates: computeDates({ ...variant, start: s }) });
        } else {
          alternatives.push({ field: c.field, side, reading: c[`reading_${side}`], evidence: checkEvidence(c[`evidence_${side}`], documents), dates: null });
        }
      }
    }
  }

  // ---- Plain-language working
  const d = dates || provisional?.dates || null;
  if (d && d.termStart) pushCalc(calc, `Term starts ${formatDate(d.termStart)} (${dates ? startSource || "from the documents" : "provisional"}).`);
  if (d && d.initialEnd) {
    pushCalc(calc, fixedEnd ? `The documents give an end date of ${formatDate(d.initialEnd)}.` : `An initial term of ${describeDuration(initialNumber, initialUnit)} ends on ${formatDate(d.initialEnd)}. Convention: the term ends the day before the same calendar day.`);
    if (!fixedEnd && d.termStart && d.termStart.getUTCDate() >= 29 && ["months", "years"].includes(normalizeUnit(initialUnit))) {
      assumptions.push("The term starts on the 29th, 30th or 31st, and some months are shorter. Where the end could be read one day later, the earlier reading is used, because it gives the safer deadline.");
    }
  }
  if (d && d.finalTerm) {
    pushCalc(calc, `That date has passed, so the single extension of ${describeDuration(renewalNumber, renewalUnit)} applies, assuming no notice to renew was given. It runs to ${formatDate(d.termEnd)} and then the contract ends.`);
    assumptions.push("The initial term has ended. The dates assume no notice to renew was given, so the one silent extension applied. These documents cannot show that.");
  } else if (d && d.renewalsPassed > 0) {
    pushCalc(calc, `That date has passed. Assuming it renewed each time since (${d.renewalsPassed} renewal${d.renewalsPassed === 1 ? "" : "s"} of ${describeDuration(renewalNumber, renewalUnit)}), the current term ends on ${formatDate(d.termEnd)}.`);
    assumptions.push("The initial term has ended. The dates assume the contract renewed each time and that no notice was given. These documents cannot show that.");
  }
  if (d && d.cancelBy) {
    pushCalc(calc, `Notice of ${describeDuration(noticeNumber, noticeUnit)} before the end of the term gives a last notice date of ${formatDate(d.cancelBy)}.`);
    const deemedText = isUsableDuration(deemedNumber, deemedUnit) ? `The contract treats notice as received ${describeDuration(deemedNumber, deemedUnit)} after sending. ` : "";
    pushCalc(calc, `${deemedText}With a ${SAFETY_MARGIN_BUSINESS_DAYS} working day safety margin, send by ${formatDate(d.sendBy)}.`);
    pushCalc(calc, `${supplier.category || "Other"} contracts get ${leadDays} days to decide before that (house rule), so decide by ${formatDate(d.decideBy)}.`);
    if (normalizeUnit(noticeUnit) === "business_days" || normalizeUnit(deemedUnit) === "business_days") {
      assumptions.push("Working days are counted Monday to Friday. Public holidays are not applied, so the true dates can only be earlier.");
    }
  }
  if (d && d.expired) pushCalc(calc, "The term in these documents has already ended.");

  // ---- What silence costs
  // Only a confirmed date is ever written into the sentence about silence.
  const silence = describeSilence({ mechanism, d: dates, renewalNumber, renewalUnit, price, supplier });

  return {
    outcome, facts, blockers, hard, pending, question, dates, provisional, alternatives, changes, missing, calc, assumptions, silence,
    mechanism, leadDays,
    agreementDate, agreementEvidence,
    contract: { title: contract.title || "", supplier: contract.supplier_name || "", customer: contract.customer_name || "", type: contract.contract_type || "", signed },
    readerNote: x.reader_note || "",
    exitSummary: exit.summary || "",
    notice: { address: notice.notice_address || "", methods: notice.delivery_methods || "", emailValid: notice.email_is_valid || "not_stated", who, deemedNumber, deemedUnit, methodsVerified: isVerified(deliveryEvidence) || manual.notice_delivery === "confirmed" },
  };
}

function describeSilence({ mechanism, d, renewalNumber, renewalUnit, price, supplier }) {
  const annual = Number(supplier.annualValue) || 0;
  const currency = supplier.currency || "INR";
  const months = monthsOf(renewalNumber, renewalUnit);
  const out = { text: "", amount: 0, amountText: "", upliftText: "" };
  if (mechanism === "automatic" || mechanism === "one_time_extension_then_ends") {
    const period = describeDuration(renewalNumber, renewalUnit);
    out.text = mechanism === "automatic"
      ? `If nobody acts, it renews${period ? ` for ${period}` : ""}${d?.renewsOn ? ` from ${formatDate(d.renewsOn)}` : ""}.`
      : `If nobody acts, it extends once${period ? ` for ${period}` : ""}${d?.renewsOn ? ` from ${formatDate(d.renewsOn)}` : ""}, then ends.`;
    if (annual && months) {
      out.amount = (annual * months) / 12;
      out.amountText = `${formatMoney(out.amount, currency)} committed by silence`;
      const cap = Number(price.cap_percent) || 0;
      // A silent one-time extension is normally on the same terms, so a price rule is only applied to a true automatic renewal.
      if (mechanism !== "automatic") return out;
      if (price.rule === "capped_increase" && cap > 0) out.upliftText = `plus up to ${formatMoney((out.amount * cap) / 100, currency)} if the ${cap}% cap is used`;
      else if (["supplier_may_change_with_notice", "market_or_list_price", "index_linked"].includes(price.rule)) out.upliftText = "and the price can rise on renewal";
    }
  } else if (mechanism === "customer_must_give_notice_to_renew") {
    out.text = `If nobody acts, it ends${d?.termEnd ? ` on ${formatDate(d.termEnd)}` : ""}. Keeping the supplier needs notice.`;
  } else if (mechanism === "mutual_written_agreement" || mechanism === "no_renewal_fixed_term") {
    out.text = `If nobody acts, it ends${d?.termEnd ? ` on ${formatDate(d.termEnd)}` : ""}. Any work after that is outside the contract.`;
  } else if (mechanism === "continues_until_terminated") {
    out.text = "There is no renewal date. It runs until someone ends it.";
    if (annual) out.amountText = `${formatMoney(annual, currency)} a year while it runs`;
  }
  return out;
}

function monthsOf(number, unit) {
  const u = normalizeUnit(unit);
  if (!isUsableDuration(number, u)) return 0;
  if (u === "months") return number;
  if (u === "years") return number * 12;
  if (u === "weeks") return (number * 7) / 30.4375;
  return number / 30.4375;
}

function noticePurposeText(purpose, mechanism) {
  if (purpose === "to_renew" || mechanism === "customer_must_give_notice_to_renew") return "before the end of the term, to renew";
  if (purpose === "to_terminate_at_any_time") return "at any time, to end it";
  return "before the end of the term, to stop renewal";
}

function whoText(who) {
  if (who === "either_party") return "Either party may give it.";
  if (who === "customer_only") return "Only the customer may give it.";
  if (who === "supplier_only") return "Only the supplier may give it.";
  return "";
}

// True when a sentence says the contract carries on by itself. "Is not extended" does not count.
function saysItContinues(text) {
  const re = /\b(extend(?:s|ed)?|automatically (?:renews?|continues?)|renews? automatically)\b/gi;
  let m;
  while ((m = re.exec(text))) {
    const before = text.slice(Math.max(0, m.index - 24), m.index).toLowerCase();
    if (!/\b(not|no|never|without|nor|neither|cannot|won't)\b[^.;]*$/.test(before)) return true;
  }
  return false;
}

function stripDot(s) {
  return String(s || "").trim().replace(/[.\s]+$/, "");
}

function lowerFirst(s) {
  const t = String(s || "");
  return t ? t[0].toLowerCase() + t.slice(1) : t;
}

export { toISO };
