// Checks that a passage quoted by the model really appears in the uploaded text.
// Plain code. A fact whose passage cannot be found is never shown as confirmed.

const CHAR_MAP = {
  "‘": "'", "’": "'", "‚": "'", "‛": "'", "′": "'",
  "“": '"', "”": '"', "„": '"', "‟": '"', "″": '"',
  "‐": "-", "‑": "-", "‒": "-", "–": "-", "—": "-", "―": "-", "−": "-",
  " ": " ", " ": " ", " ": " ", " ": " ", " ": " ",
};
const DROP = new Set(["­", "​", "‌", "‍", "﻿"]);

// Returns the normalised string and, for each normalised character, its index in the original.
function normalizeWithMap(text, { alnumOnly = false } = {}) {
  const out = [];
  const map = [];
  let lastWasSpace = true;
  for (let i = 0; i < text.length; i += 1) {
    let ch = text[i];
    if (DROP.has(ch)) continue;
    if (CHAR_MAP[ch]) ch = CHAR_MAP[ch];
    if (/\s/.test(ch)) {
      if (alnumOnly) continue;
      if (lastWasSpace) continue;
      out.push(" ");
      map.push(i);
      lastWasSpace = true;
      continue;
    }
    const lower = ch.toLowerCase();
    if (alnumOnly && !/[\p{L}\p{N}]/u.test(lower)) continue;
    out.push(lower);
    map.push(i);
    lastWasSpace = false;
  }
  // Trim one trailing space.
  if (out.length && out[out.length - 1] === " ") {
    out.pop();
    map.pop();
  }
  return { text: out.join(""), map };
}

function locate(haystack, needle) {
  if (!needle.text) return null;
  const index = haystack.text.indexOf(needle.text);
  if (index === -1) return null;
  const start = haystack.map[index];
  const end = haystack.map[index + needle.text.length - 1] + 1;
  return { start, end };
}

// Result levels:
//   exact    the passage appears as written, ignoring only spacing, case and typographic quotes or dashes
//   relaxed  the passage appears once punctuation is ignored as well
//   partial  only the opening and closing words were found close together
//   missing  not found
export function verifyQuote(documentText, quote) {
  const cleanQuote = String(quote || "").trim();
  if (!cleanQuote) return { level: "missing", start: -1, end: -1 };
  const text = String(documentText || "");

  const hay = normalizeWithMap(text);
  const needle = normalizeWithMap(cleanQuote);
  const exact = locate(hay, needle);
  if (exact) return { level: "exact", ...exact };

  const hayLoose = normalizeWithMap(text, { alnumOnly: true });
  const needleLoose = normalizeWithMap(cleanQuote, { alnumOnly: true });
  if (needleLoose.text.length >= 20) {
    const relaxed = locate(hayLoose, needleLoose);
    if (relaxed) return { level: "relaxed", ...relaxed };
  }

  // Opening and closing words, for quotes where the model skipped something in the middle.
  const words = needle.text.split(" ").filter(Boolean);
  if (words.length >= 12) {
    const head = words.slice(0, 6).join(" ");
    const tail = words.slice(-6).join(" ");
    const headAt = hay.text.indexOf(head);
    if (headAt !== -1) {
      const tailAt = hay.text.indexOf(tail, headAt + head.length);
      const span = tailAt - headAt;
      if (tailAt !== -1 && span <= needle.text.length * 1.6 + 80) {
        return {
          level: "partial",
          start: hay.map[headAt],
          end: hay.map[tailAt + tail.length - 1] + 1,
        };
      }
    }
  }
  return { level: "missing", start: -1, end: -1 };
}

export function isVerified(result) {
  return Boolean(result) && (result.level === "exact" || result.level === "relaxed");
}

// Splits a document into before, passage, after so the interface can highlight the passage in place.
export function excerptAround(documentText, start, end, pad = 220) {
  const text = String(documentText || "");
  if (start < 0 || end <= start) return null;
  const from = Math.max(0, start - pad);
  const to = Math.min(text.length, end + pad);
  return {
    before: (from > 0 ? "…" : "") + text.slice(from, start),
    passage: text.slice(start, end),
    after: text.slice(end, to) + (to < text.length ? "…" : ""),
  };
}
