// One place that talks to the Claude API. The key is read from the server environment only.
import { EXTRACTION_SCHEMA, SYSTEM_PROMPT, buildUserMessage } from "./schema.js";

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2026-10-21";

export const ALLOWED_MODELS = ["claude-sonnet-5-5", "claude-haiku-5-5"];
export const ALLOWED_EFFORT = ["low", "medium", "high"];

export function serverConfig() {
  const envModel = (process.env.ANTHROPIC_MODEL || "").trim();
  const envEffort = (process.env.ANTHROPIC_EFFORT || "").trim();
  return {
    keyConfigured: Boolean((process.env.ANTHROPIC_API_KEY || "").trim()),
    model: ALLOWED_MODELS.includes(envModel) ? envModel : "claude-sonnet-5-5",
    effort: ALLOWED_EFFORT.includes(envEffort) ? envEffort : "medium",
    workspaceId: (process.env.ANTHROPIC_WORKSPACE_ID || "").trim(),
  };
}

export class ModelError extends Error {
  constructor(code, message, { status = 502, detail = "", retryAfter = 0 } = {}) {
    super(message);
    this.code = code;
    this.status = status;
    this.detail = detail;
    this.retryAfter = retryAfter;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function explainUpstream(status, body) {
  const type = body?.error?.type || "";
  const message = body?.error?.message || "";
  const code = body?.error?.details?.error_code || "";
  if (status === 401) return ["key_rejected", "The AI key was rejected. It may be wrong, expired or disabled."];
  if (status === 403) return ["key_forbidden", "The AI key is not allowed to use this model."];
  if (status === 400 && /specified (workspace )?API usage limits/i.test(message)) {
    return ["spend_limit", "The monthly spend limit set for this demo has been reached."];
  }
  if (status === 400 && /credit balance/i.test(message)) return ["no_credit", "The demo's AI credit has run out."];
  if (status === 400 && /anthropic-workspace-id/i.test(message)) {
    return ["workspace_missing", "The AI key is not tied to a workspace. Set ANTHROPIC_WORKSPACE_ID or create a workspace key."];
  }
  if (status === 429 && code === "enforced_spend_limit_reached") return ["spend_cap", "The account's monthly usage cap has been reached."];
  if (status === 429) return ["rate_limited", "The AI service is limiting requests right now."];
  if (status === 529 || type === "overloaded_error") return ["overloaded", "The AI service is busy right now."];
  if (status >= 500) return ["upstream_error", "The AI service returned an error."];
  return ["bad_request", "The AI service did not accept the request."];
}

// Sends one request and retries briefly on rate limits and overload.
async function postMessages(payload, { timeoutMs = 150000, maxAttempts = 3 } = {}) {
  const config = serverConfig();
  const key = (process.env.ANTHROPIC_API_KEY || "").trim();
  if (!key) throw new ModelError("no_key", "No AI key is configured on the server yet.", { status: 503 });

  const headers = {
    "content-type": "application/json",
    "x-api-key": key,
    "anthropic-version": API_VERSION,
  };
  if (config.workspaceId) headers["anthropic-workspace-id"] = config.workspaceId;

  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const raw = await response.text();
      let body = null;
      try {
        body = JSON.parse(raw);
      } catch {
        body = null;
      }
      if (response.ok && body) {
        return { body, requestId: response.headers.get("request-id") || body?.request_id || "" };
      }
      const [code, message] = explainUpstream(response.status, body);
      const retryAfter = Number(response.headers.get("retry-after")) || 0;
      const detail = (body?.error?.message || raw || "").slice(0, 600);
      lastError = new ModelError(code, message, {
        status: response.status === 429 ? 429 : response.status >= 500 ? 503 : 502,
        detail,
        retryAfter,
      });
      const retryable = (code === "rate_limited" || code === "overloaded" || code === "upstream_error") && attempt < maxAttempts;
      if (!retryable) throw lastError;
      const wait = Math.min(Math.max(retryAfter, 2 * attempt), 20);
      await sleep(wait * 1000);
    } catch (error) {
      if (error instanceof ModelError) {
        if (attempt >= maxAttempts || !["rate_limited", "overloaded", "upstream_error"].includes(error.code)) throw error;
        continue;
      }
      if (error?.name === "AbortError") {
        throw new ModelError("timeout", "The AI took too long to answer.", { status: 504 });
      }
      lastError = new ModelError("network", "Could not reach the AI service.", {
        status: 502,
        detail: String(error?.message || error).slice(0, 300),
      });
      if (attempt >= maxAttempts) throw lastError;
      await sleep(1500 * attempt);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError || new ModelError("unknown", "The AI request failed.");
}

function lowerEnums(value) {
  // Structured outputs do not guarantee the capitalisation of enum values, so compare in lower case.
  if (Array.isArray(value)) return value.map(lowerEnums);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = lowerEnums(v);
    return out;
  }
  return value;
}

const ENUM_KEYS = new Set([
  "signed_status", "role", "start_basis", "initial_term_unit", "mechanism", "renewal_term_unit", "period_unit",
  "purpose", "counted_back_from", "who_may_give", "email_is_valid", "deemed_receipt_unit", "rule",
  "customer_can_terminate_for_convenience", "convenience_notice_unit", "field", "which_governs", "a_unit", "b_unit",
]);

function normalizeEnums(value) {
  if (Array.isArray(value)) return value.map(normalizeEnums);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (ENUM_KEYS.has(k) && typeof v === "string") out[k] = v.toLowerCase().trim().replace(/\s+/g, "_");
      else out[k] = normalizeEnums(v);
    }
    return out;
  }
  return value;
}

// Reads one contract family and returns the structured facts.
export async function readContractFamily(documents, { model, effort } = {}) {
  const config = serverConfig();
  const chosenModel = ALLOWED_MODELS.includes(model) ? model : config.model;
  const chosenEffort = ALLOWED_EFFORT.includes(effort) ? effort : config.effort;

  const payload = {
    model: chosenModel,
    max_tokens: 12000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserMessage(documents) }],
    output_config: {
      effort: chosenEffort,
      format: { type: "json_schema", schema: EXTRACTION_SCHEMA },
    },
  };

  const started = Date.now();
  const { body, requestId } = await postMessages(payload);
  const ms = Date.now() - started;

  const stop = body.stop_reason || "";
  if (stop === "refusal") {
    throw new ModelError("refused", "The AI declined to read this text.", { status: 422, detail: JSON.stringify(body.stop_details || {}) });
  }
  const text = (body.content || [])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
  if (stop === "max_tokens") {
    throw new ModelError("cut_off", "The AI ran out of room before finishing. Try a shorter document.", { status: 422 });
  }
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ModelError("bad_json", "The AI answer could not be read as structured data.", { status: 502, detail: text.slice(0, 300) });
  }

  return {
    result: normalizeEnums(parsed),
    meta: {
      model: body.model || chosenModel,
      effort: chosenEffort,
      ms,
      input_tokens: body.usage?.input_tokens ?? null,
      output_tokens: body.usage?.output_tokens ?? null,
      stop_reason: stop,
      request_id: requestId,
      ran_at: new Date().toISOString(),
    },
  };
}

export { lowerEnums };
