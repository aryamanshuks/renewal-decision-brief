// GET /api/health
// Says whether the server has an AI key and which model it will use. Never returns the key.
import { serverConfig } from "../server/anthropic.js";
import { LIMITS, sendJson } from "../server/guard.js";

export default function handler(req, res) {
  const config = serverConfig();
  return sendJson(res, 200, {
    ok: true,
    key_configured: config.keyConfigured,
    model: config.model,
    effort: config.effort,
    limits: { max_documents: LIMITS.maxDocuments, max_chars_total: LIMITS.maxCharsTotal },
    server_time: new Date().toISOString(),
  });
}
