// Local development server. Serves public/ and runs the functions in api/ the way Vercel does.
// Usage: node scripts/dev-server.mjs [port]
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const port = Number(process.argv[2]) || 4173;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".txt": "text/plain; charset=utf-8" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    const name = url.pathname.slice(5).replace(/[^a-z0-9_-]/gi, "");
    if (process.env.MOCK && (name === "extract" || name === "health")) {
      // Dev only: hand-written readings, so screens can be tested without a key.
      const chunks = [];
      for await (const c of req) chunks.push(c);
      res.setHeader("content-type", "application/json");
      if (name === "health") return res.end(JSON.stringify({ ok: true, key_configured: true, model: "mock (dev only)", effort: "none" }));
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
      const { mockFor } = await import(pathToFileURL(join(root, "scripts", "mock-extract.mjs")).href);
      await new Promise((r) => setTimeout(r, Number(process.env.MOCK_DELAY) || 300));
      if (/MOCK-FAIL/.test(JSON.stringify(body.documents || []))) {
        res.statusCode = 429;
        return res.end(JSON.stringify({ ok: false, error: { code: "rate_limited", message: "Too many reads in a short time. This prototype limits live reads to protect its budget.", detail: "mock", retry_after: 20 } }));
      }
      return res.end(JSON.stringify({ ok: true, result: mockFor(body.documents || []), meta: { model: "mock (dev only)", effort: "none", ms: 300, input_tokens: 0, output_tokens: 0, stop_reason: "end_turn", request_id: "mock", ran_at: new Date().toISOString(), documents: (body.documents || []).map((d) => ({ id: d.id, name: d.name, chars: d.text.length })) } }));
    }
    try {
      const mod = await import(pathToFileURL(join(root, "api", `${name}.js`)).href);
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const raw = Buffer.concat(chunks).toString("utf8");
      try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = raw; }
      req.query = Object.fromEntries(url.searchParams);
      await mod.default(req, res);
    } catch (e) {
      res.statusCode = 404; res.end(JSON.stringify({ ok: false, error: { message: String(e.message || e) } }));
    }
    return;
  }
  let path = normalize(url.pathname).replace(/^(\.\.[/\\])+/, "");
  if (path === "/" || path === "\\") path = "/index.html";
  try {
    const data = await readFile(join(root, "public", path));
    res.setHeader("content-type", types[extname(path)] || "application/octet-stream");
    res.end(data);
  } catch {
    res.statusCode = 404; res.end("Not found");
  }
}).listen(port, () => console.log(`http://localhost:${port}`));
