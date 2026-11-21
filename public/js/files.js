// Turns an uploaded file into plain text in the browser. The file itself is never uploaded anywhere.
// Only the extracted text is sent to the server, and only when the user asks for a read.

let pdfjsPromise = null;
let mammothPromise = null;

function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("../vendor/pdfjs/pdf.min.mjs").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("../vendor/pdfjs/pdf.worker.min.mjs", import.meta.url).href;
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

function loadMammoth() {
  if (!mammothPromise) {
    mammothPromise = new Promise((resolve, reject) => {
      if (window.mammoth) return resolve(window.mammoth);
      const script = document.createElement("script");
      script.src = new URL("../vendor/mammoth.browser.min.js", import.meta.url).href;
      script.onload = () => resolve(window.mammoth);
      script.onerror = () => reject(new Error("Could not load the Word reader."));
      document.head.appendChild(script);
    });
  }
  return mammothPromise;
}

async function pdfToText(buffer) {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const pages = [];
  for (let n = 1; n <= doc.numPages; n += 1) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    let line = "";
    const lines = [];
    for (const item of content.items) {
      if (typeof item.str !== "string") continue;
      line += item.str;
      if (item.hasEOL) {
        lines.push(line);
        line = "";
      }
    }
    if (line) lines.push(line);
    pages.push(lines.join("\n"));
  }
  return pages.join("\n\n");
}

export async function fileToText(file) {
  const name = file.name || "document";
  const lower = name.toLowerCase();
  if (file.size > 12 * 1024 * 1024) throw new Error("That file is over 12 MB. Paste the text of the relevant sections instead.");
  if (lower.endsWith(".pdf") || file.type === "application/pdf") {
    const text = await pdfToText(await file.arrayBuffer());
    if (text.replace(/\s/g, "").length < 200) {
      throw new Error("This PDF has no readable text layer. It is probably a scan. Paste the text, or use a PDF made from a document. Reading scans needs text recognition, which this prototype does not do.");
    }
    return { name, text };
  }
  if (lower.endsWith(".docx")) {
    const mammoth = await loadMammoth();
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return { name, text: result.value || "" };
  }
  if (lower.endsWith(".txt") || lower.endsWith(".md") || file.type.startsWith("text/")) {
    return { name, text: await file.text() };
  }
  throw new Error("Use a text-based PDF, a Word .docx file, or a .txt file. Or paste the text.");
}
