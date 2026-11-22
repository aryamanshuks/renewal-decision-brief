// One place that talks to the Claude API. The key is read from the server environment only.
import { EXTRACTION_SCHEMA, SYSTEM_PROMPT, JSON_ONLY_INSTRUCTION, PROMPT_VERSION, buildUserMessage } from "./schema.js";
import { toReading, extractJson } from "./normalize.js";

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

// The API can enforce the schema itself, but on 22 Nov 2026 it refused this one as too large to compile,
// even flattened. So by default the shape is described in the prompt and code checks every field.
// Set ANTHROPIC_TRY_SCHEMA=1 to try schema enforcement again; it falls back automatically if refused.
let schemaModeBroken = process.env.ANTHROPIC_TRY_SCHEMA !== "1";

function isSchemaComplexityError(error) {
  return error instanceof ModelError && error.code === "bad_request" && /grammar|too complex|schema/i.test(error.detail || "");
}

const RETRY_NOTE = "Your previous answer could not be parsed as JSON. Escape every double quotation mark inside a string value as \\\" and put no raw line breaks inside strings.";

function payloadFor(documents, model, effort, mode, retry = false) {
  const base = {
    model,
    max_tokens: 16000,
    messages: [{ role: "user", content: buildUserMessage(documents) }],
  };
  if (mode === "schema") {
    return { ...base, system: SYSTEM_PROMPT, output_config: { effort, format: { type: "json_schema", schema: EXTRACTION_SCHEMA } } };
  }
  return { ...base, system: `${SYSTEM_PROMPT}\n\n${JSON_ONLY_INSTRUCTION}${retry ? `\n\n${RETRY_NOTE}` : ""}`, output_config: { effort } };
}

// Reads one contract family and returns the structured facts.
export async function readContractFamily(documents, { model, effort } = {}) {
  const config = serverConfig();
  const chosenModel = ALLOWED_MODELS.includes(model) ? model : config.model;
  const chosenEffort = ALLOWED_EFFORT.includes(effort) ? effort : config.effort;

  const started = Date.now();
  let mode = schemaModeBroken ? "prompt" : "schema";
  let attempts = 0;
  let parsed = null;
  let body = null;
  let requestId = "";
  let stop = "";
  // Without schema enforcement a model can occasionally return text that is not valid JSON. One retry fixes most of these.
  while (parsed === null) {
    attempts += 1;
    let reply;
    try {
      reply = await postMessages(payloadFor(documents, chosenModel, chosenEffort, mode, attempts > 1));
    } catch (error) {
      if (mode !== "schema" || !isSchemaComplexityError(error)) throw error;
      schemaModeBroken = true;
      mode = "prompt";
      reply = await postMessages(payloadFor(documents, chosenModel, chosenEffort, mode));
    }
    body = reply.body;
    requestId = reply.requestId;
    stop = body.stop_reason || "";
    if (stop === "refusal") {
      throw new ModelError("refused", "The AI declined to read this text.", { status: 422, detail: JSON.stringify(body.stop_details || {}) });
    }
    if (stop === "max_tokens") {
      throw new ModelError("cut_off", "The AI ran out of room before finishing. Try a shorter document.", { status: 422 });
    }
    const text = (body.content || []).filter((block) => block.type === "text").map((block) => block.text).join("");
    try {
      parsed = extractJson(text);
    } catch {
      if (attempts >= 2) throw new ModelError("bad_json", "The AI answer could not be read as structured data, twice. Try again.", { status: 502, detail: text.slice(0, 300) });
    }
  }
  const ms = Date.now() - started;


  return {
    result: toReading(parsed),
    meta: {
      model: body.model || chosenModel,
      effort: chosenEffort,
      mode,
      attempts,
      ms,
      input_tokens: body.usage?.input_tokens ?? null,
      output_tokens: body.usage?.output_tokens ?? null,
      stop_reason: stop,
      request_id: requestId,
      ran_at: new Date().toISOString(),
      prompt: PROMPT_VERSION,
    },
  };
}
