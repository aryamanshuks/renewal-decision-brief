// Calls to our own server. The browser never sees the AI key.

export class ApiError extends Error {
  constructor(message, { code = "error", detail = "", retryAfter = 0, status = 0 } = {}) {
    super(message);
    this.code = code;
    this.detail = detail;
    this.retryAfter = retryAfter;
    this.status = status;
  }
}

export async function getHealth() {
  try {
    const response = await fetch("/api/health", { cache: "no-store" });
    if (!response.ok) return { ok: false, key_configured: false };
    return await response.json();
  } catch {
    return { ok: false, key_configured: false, unreachable: true };
  }
}

export async function extract(documents, { model, effort } = {}) {
  let response;
  try {
    response = await fetch("/api/extract", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ documents: documents.map((d) => ({ id: d.id, name: d.name, text: d.text })), model, effort }),
    });
  } catch (error) {
    throw new ApiError("Could not reach the server. Check the connection and try again.", { code: "network", detail: String(error?.message || error) });
  }
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (response.ok && body?.ok) return { result: body.result, meta: body.meta };
  const err = body?.error || {};
  throw new ApiError(err.message || `The server answered with status ${response.status}.`, {
    code: err.code || "error",
    detail: err.detail || "",
    retryAfter: err.retry_after || 0,
    status: response.status,
  });
}
