// POST /api/extract
// Takes the text of one contract family and returns the model's structured reading.
// No dates are calculated here. The browser verifies every quoted passage and does the date arithmetic in plain code.
import { readContractFamily, ModelError } from "../server/anthropic.js";
import { checkRate, clientIp, readJsonBody, sendJson, validateDocuments } from "../server/guard.js";

export const config = { maxDuration: 240 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { ok: false, error: { code: "method", message: "Use POST." } }, { allow: "POST" });
  }
  const body = readJsonBody(req);
  if (!body) {
    return sendJson(res, 400, { ok: false, error: { code: "bad_body", message: "The request was not valid JSON." } });
  }
  const checked = validateDocuments(body.documents);
  if (checked.error) {
    return sendJson(res, 400, { ok: false, error: { code: "bad_input", message: checked.error } });
  }
  const rate = checkRate(clientIp(req));
  if (!rate.ok) {
    return sendJson(
      res,
      429,
      { ok: false, error: { code: "demo_rate_limit", message: rate.reason, retry_after: rate.retryAfter } },
      { "retry-after": String(rate.retryAfter) }
    );
  }
  try {
    const { result, meta } = await readContractFamily(checked.documents, { model: body.model, effort: body.effort });
    return sendJson(res, 200, {
      ok: true,
      result,
      meta: {
        ...meta,
        documents: checked.documents.map((d) => ({ id: d.id, name: d.name, chars: d.text.length })),
      },
    });
  } catch (error) {
    if (error instanceof ModelError) {
      const headers = error.retryAfter ? { "retry-after": String(error.retryAfter) } : {};
      return sendJson(
        res,
        error.status,
        { ok: false, error: { code: error.code, message: error.message, detail: error.detail, retry_after: error.retryAfter } },
        headers
      );
    }
    return sendJson(res, 500, {
      ok: false,
      error: { code: "server", message: "The server hit an unexpected problem.", detail: String(error?.message || error).slice(0, 300) },
    });
  }
}
