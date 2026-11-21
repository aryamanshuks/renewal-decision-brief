// GET /api/selftest
// Runs one tiny, fixed contract through the live model and checks the answer.
// It exists so the live link can prove, in one click, that the AI call works end to end.
import { readContractFamily, ModelError, serverConfig } from "../server/anthropic.js";
import { sendJson } from "../server/guard.js";

export const config = { maxDuration: 120 };

const SAMPLE = `SOFTWARE SUBSCRIPTION AGREEMENT

This Agreement is made on 12 January 2026 (the "Effective Date") between Brightdesk Software Private Limited ("Supplier") and Meridian Retail Limited ("Customer").

1. Term. This Agreement starts on the Effective Date and continues for an initial term of twelve (12) months.

2. Renewal. At the end of the initial term and each renewal term, this Agreement renews automatically for a further period of twelve (12) months unless either party gives the other written notice of non-renewal at least sixty (60) days before the end of the then-current term.

3. Fees on renewal. Supplier may increase the fees for a renewal term by no more than seven percent (7%).

4. Notices. Notices must be in writing and sent by registered post to the other party's registered office. Email is not a valid means of giving notice. A notice sent by registered post is deemed received three (3) business days after posting.

Signed for Brightdesk Software Private Limited on 12 January 2026.
Signed for Meridian Retail Limited on 12 January 2026.`;

let lastRun = 0;

export default async function handler(req, res) {
  const configNow = serverConfig();
  if (!configNow.keyConfigured) {
    return sendJson(res, 200, { ok: false, stage: "key", message: "No AI key is set on the server yet." });
  }
  const now = Date.now();
  if (now - lastRun < 15000) {
    return sendJson(res, 429, { ok: false, stage: "rate", message: "Self-test ran a moment ago. Wait 15 seconds." });
  }
  lastRun = now;
  try {
    const { result, meta } = await readContractFamily([{ id: "D1", name: "Self-test subscription agreement", text: SAMPLE }]);
    const quote = result?.renewal?.evidence?.quote || "";
    const squash = (s) => String(s).toLowerCase().replace(/\s+/g, " ").trim();
    const checks = [
      { name: "renewal is automatic", pass: result?.renewal?.mechanism === "automatic", got: result?.renewal?.mechanism },
      { name: "renewal period is 12 months", pass: result?.renewal?.renewal_term_number === 12 && result?.renewal?.renewal_term_unit === "months", got: `${result?.renewal?.renewal_term_number} ${result?.renewal?.renewal_term_unit}` },
      { name: "notice period is 60 days", pass: result?.notice?.period_number === 60 && result?.notice?.period_unit === "days", got: `${result?.notice?.period_number} ${result?.notice?.period_unit}` },
      { name: "start date is 2026-01-12", pass: result?.term?.start_date === "2026-01-12", got: result?.term?.start_date },
      { name: "email is not valid for notice", pass: result?.notice?.email_is_valid === "no", got: result?.notice?.email_is_valid },
      { name: "quoted passage appears in the text", pass: Boolean(quote) && squash(SAMPLE).includes(squash(quote)), got: quote.slice(0, 80) },
    ];
    const passed = checks.filter((c) => c.pass).length;
    return sendJson(res, 200, { ok: passed === checks.length, stage: "done", passed, of: checks.length, checks, meta });
  } catch (error) {
    if (error instanceof ModelError) {
      return sendJson(res, 200, { ok: false, stage: "model", code: error.code, message: error.message, detail: error.detail });
    }
    return sendJson(res, 200, { ok: false, stage: "server", message: String(error?.message || error).slice(0, 300) });
  }
}
