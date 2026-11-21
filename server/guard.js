// Input checks and a small in-memory rate limit.
// The memory limit is best effort: it resets when the server instance restarts.
// The hard ceilings are the prepaid credit, the spend limit in the Claude Console and the firewall rule in Vercel.

export const LIMITS = {
  maxDocuments: 6,
  maxCharsPerDocument: 140000,
  maxCharsTotal: 160000,
  minCharsTotal: 200,
  perMinutePerIp: 6,
  perDayPerIp: 80,
  perDayAllIps: 600,
};

const hits = new Map(); // ip -> array of timestamps
let dayStamp = "";
let dayCount = 0;

export function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || "").split(",")[0];
  return (first || req.headers["x-real-ip"] || "unknown").trim();
}

export function checkRate(ip, now = Date.now()) {
  const today = new Date(now).toISOString().slice(0, 10);
  if (today !== dayStamp) {
    dayStamp = today;
    dayCount = 0;
    hits.clear();
  }
  if (dayCount >= LIMITS.perDayAllIps) {
    return { ok: false, retryAfter: 3600, reason: "The demo has reached its daily limit of live AI reads." };
  }
  const list = (hits.get(ip) || []).filter((t) => now - t < 86400000);
  const lastMinute = list.filter((t) => now - t < 60000);
  if (lastMinute.length >= LIMITS.perMinutePerIp) {
    const wait = Math.ceil((60000 - (now - lastMinute[0])) / 1000);
    return { ok: false, retryAfter: Math.max(wait, 1), reason: "Too many live AI reads in one minute." };
  }
  if (list.length >= LIMITS.perDayPerIp) {
    return { ok: false, retryAfter: 3600, reason: "This connection has reached its daily limit of live AI reads." };
  }
  list.push(now);
  hits.set(ip, list);
  dayCount += 1;
  return { ok: true, retryAfter: 0, reason: "" };
}

// Cleans and checks the documents sent by the browser. Returns { documents } or { error }.
export function validateDocuments(input) {
  if (!Array.isArray(input) || input.length === 0) {
    return { error: "Send at least one document." };
  }
  if (input.length > LIMITS.maxDocuments) {
    return { error: `This demo reads up to ${LIMITS.maxDocuments} documents in one contract family.` };
  }
  const documents = [];
  let total = 0;
  const seen = new Set();
  for (let i = 0; i < input.length; i += 1) {
    const raw = input[i] || {};
    const text = typeof raw.text === "string" ? raw.text.replace(/\u0000/g, "").trim() : "";
    if (!text) return { error: `Document ${i + 1} has no readable text.` };
    if (text.length > LIMITS.maxCharsPerDocument) {
      return {
        error: `Document ${i + 1} is ${text.length.toLocaleString("en-IN")} characters. This demo reads up to ${LIMITS.maxCharsPerDocument.toLocaleString("en-IN")} per document. Paste the sections on term, renewal, notices and pricing.`,
      };
    }
    let id = typeof raw.id === "string" && /^[A-Za-z0-9_-]{1,12}$/.test(raw.id) ? raw.id : `D${i + 1}`;
    if (seen.has(id)) id = `D${i + 1}`;
    seen.add(id);
    const name = typeof raw.name === "string" && raw.name.trim() ? raw.name.trim().slice(0, 120) : `Document ${i + 1}`;
    total += text.length;
    documents.push({ id, name, text });
  }
  if (total < LIMITS.minCharsTotal) return { error: "That is too little text to be a contract." };
  if (total > LIMITS.maxCharsTotal) {
    return {
      error: `Together these documents are ${total.toLocaleString("en-IN")} characters. This demo reads up to ${LIMITS.maxCharsTotal.toLocaleString("en-IN")} per contract family.`,
    };
  }
  return { documents };
}

export function readJsonBody(req) {
  const body = req.body;
  if (body && typeof body === "object" && !Buffer.isBuffer(body)) return body;
  try {
    const text = Buffer.isBuffer(body) ? body.toString("utf8") : String(body || "");
    return text ? JSON.parse(text) : {};
  } catch {
    return null;
  }
}

export function sendJson(res, status, payload, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
  res.end(JSON.stringify(payload));
}
