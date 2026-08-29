// Stale-PDF → text extractor. Solves the pilot's tooling gaps so a cited-but-
// unread programa/planificación PDF becomes machine-readable text (the raw
// material an LLM stage turns into an L2 class skeleton).
//
//   node fetch-extract.js <url> <outName> [--ocr-pages N]
//
// - HTTP-tolerant (does NOT force HTTPS) and follows redirects (curl -L).
// - Google-Drive share links → direct download.
// - pdftotext -layout first; if the text layer is empty/thin (a scan), OCR
//   fallback via pdftoppm → tesseract (spa if installed, else eng).
// Prints a JSON status line; writes the text to out/<outName>.txt.
const { execFileSync, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const [, , url, outName, ...rest] = process.argv;
if (!url || !outName) { console.error("usage: fetch-extract.js <url> <outName> [--ocr-pages N]"); process.exit(2); }
const ocrPagesArg = rest.indexOf("--ocr-pages");
const OCR_PAGE_CAP = ocrPagesArg >= 0 ? parseInt(rest[ocrPagesArg + 1], 10) : 40;
const MIN_TEXT = 800; // below this over multiple pages ⇒ treat as a scan

const OUT = path.join(__dirname, "out");
fs.mkdirSync(OUT, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pdfx-"));
const pdf = path.join(tmp, "doc.pdf");

function driveDirect(u) {
  const m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?[^]*id=)([\w-]{20,})/);
  return m ? `https://drive.google.com/uc?export=download&id=${m[1]}` : u;
}
function langs() {
  try { return execSync("tesseract --list-langs 2>/dev/null").toString().includes("spa") ? "spa+eng" : "eng"; }
  catch { return "eng"; }
}
const done = (o) => { console.log(JSON.stringify(o)); try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {} process.exit(o.ok ? 0 : 1); };

try {
  const fetchUrl = driveDirect(url);
  // curl: follow redirects, allow http, sane timeouts, browsery UA
  execFileSync("curl", ["-sL", "--max-time", "90", "--retry", "2", "-A", "Mozilla/5.0", "-o", pdf, fetchUrl], { stdio: "ignore" });
  if (!fs.existsSync(pdf) || fs.statSync(pdf).size < 1000) return done({ ok: false, url, reason: "empty_or_unreachable" });
  const head = fs.readFileSync(pdf, { encoding: "latin1", flag: "r" }).slice(0, 5);
  if (!head.startsWith("%PDF")) return done({ ok: false, url, reason: "not_a_pdf_maybe_html_or_login" });

  let pages = 0;
  try { pages = parseInt((execFileSync("pdfinfo", [pdf]).toString().match(/Pages:\s+(\d+)/) || [])[1] || "0", 10); } catch {}

  const txtPath = path.join(OUT, outName + ".txt");
  let text = "", pdfErr = "";
  try {
    const r = require("child_process").spawnSync("pdftotext", ["-layout", pdf, "-"], { maxBuffer: 64 * 1024 * 1024 });
    text = (r.stdout || "").toString(); pdfErr = (r.stderr || "").toString();
  } catch {}

  // A text layer that parses can still be corrupt (fmed scans: "Unknown font tag"
  // errors + clipped right margin). Distrust it and fall through to OCR.
  const fontErrors = (pdfErr.match(/Unknown font tag|Syntax Error/g) || []).length;
  const corruptLayer = fontErrors > 5;

  if (!corruptLayer && text.replace(/\s/g, "").length >= MIN_TEXT) {
    fs.writeFileSync(txtPath, text);
    return done({ ok: true, url, method: "text", pages, chars: text.length, out: txtPath });
  }

  // --- OCR fallback (scan) ---
  const n = Math.min(pages || OCR_PAGE_CAP, OCR_PAGE_CAP);
  execFileSync("pdftoppm", ["-f", "1", "-l", String(n), "-r", "200", "-png", pdf, path.join(tmp, "pg")], { stdio: "ignore" });
  const imgs = fs.readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
  const L = langs();
  let ocr = "";
  for (const img of imgs) {
    const base = path.join(tmp, img.replace(/\.png$/, ""));
    // --psm 1: OSD auto-orientation — landscape scans (fmed programas) come out mirrored without it
    try { execFileSync("tesseract", [path.join(tmp, img), base, "-l", L, "--psm", "1"], { stdio: "ignore" });
      ocr += fs.readFileSync(base + ".txt", "utf8") + "\n"; } catch {}
  }
  fs.writeFileSync(txtPath, ocr);
  return done({ ok: ocr.replace(/\s/g, "").length > 200, url, method: "ocr", lang: L, pages, ocrPages: imgs.length, truncated: (pages || 0) > n, chars: ocr.length, out: txtPath });
} catch (e) {
  return done({ ok: false, url, reason: "error:" + (e.message || "").slice(0, 120) });
}
