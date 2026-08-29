// Mine Claude Code session transcripts (~/.claude/projects/<slug>/*.jsonl) to
// recover the pipeline's intermediate data that never landed in the repo:
//   1. fetch-extract status lines  -> extract/manifest.json   (url, method, pages, chars per extract)
//   2. adversarial-verifier verdicts -> verification/<address>.json  (only if not already saved live)
// Usage: node tools/mine-transcripts.js [transcriptDir]
const fs = require("fs");
const path = require("path");
const os = require("os");

const DIR = process.argv[2] || path.join(os.homedir(), ".claude", "projects", "-Users-tomb-p-learn");
const REPO = path.join(__dirname, "..");
const files = fs.readdirSync(DIR).filter(f => f.endsWith(".jsonl"));

// Collect every string value nested anywhere in a JSON structure.
function strings(x, out) {
  if (typeof x === "string") out.push(x);
  else if (Array.isArray(x)) for (const v of x) strings(v, out);
  else if (x && typeof x === "object") for (const k in x) strings(x[k], out);
  return out;
}
// Find balanced {...} substrings starting at each occurrence of `needle` inside `s`,
// and return the ones that JSON.parse cleanly.
function jsonObjectsAround(s, needle) {
  const found = [];
  let i = 0;
  while ((i = s.indexOf(needle, i)) !== -1) {
    const start = s.lastIndexOf("{", i);
    if (start === -1) { i += needle.length; continue; }
    let depth = 0, inStr = false, esc = false, end = -1;
    for (let j = start; j < s.length && j < start + 200000; j++) {
      const c = s[j];
      if (esc) { esc = false; continue; }
      if (c === "\\") { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === "{") depth++;
      else if (c === "}") { depth--; if (depth === 0) { end = j; break; } }
    }
    if (end !== -1) {
      try { found.push(JSON.parse(s.slice(start, end + 1))); } catch {}
    }
    i += needle.length;
  }
  return found;
}

const manifest = {};   // outName -> {url, method, pages, chars, mtime}
const verdicts = {};   // address -> verdict object (last wins = most recent)

for (const f of files) {
  const rl = require("readline").createInterface({ input: fs.createReadStream(path.join(DIR, f)) });
  const session = f.replace(/\.jsonl$/, "");
  // readline is async; do it synchronously instead via full read + split (files are large but fit)
}
// Synchronous pass (103MB is fine in one buffer per file, processed line by line)
for (const f of files) {
  const raw = fs.readFileSync(path.join(DIR, f), "utf8");
  let idx = 0;
  for (const line of raw.split("\n")) {
    if (!line) continue;
    let obj; try { obj = JSON.parse(line); } catch { continue; }
    const ss = strings(obj, []);
    for (const s of ss) {
      // 1. fetch-extract statuses: {"ok":true,"url":...,"method":...,"out":".../out/<name>.txt"}
      if (s.includes('"ok":') && s.includes('"url":') && s.includes('"out":')) {
        for (const o of jsonObjectsAround(s, '"ok":')) {
          if (o && typeof o.url === "string" && typeof o.out === "string" && o.out.includes("/out/")) {
            const name = path.basename(o.out, ".txt");
            manifest[name] = {
              url: o.url, method: o.method || null,
              pages: o.pages ?? null, ocrPages: o.ocrPages ?? null,
              chars: o.chars ?? null, ok: !!o.ok,
              reason: o.reason || undefined, session: f.replace(/\.jsonl$/, ""),
            };
          }
        }
      }
      // 2. verifier verdicts: objects with "address" + "verdict" keys
      if (s.includes('"address"') && s.includes('"verdict"')) {
        for (const o of jsonObjectsAround(s, '"address"')) {
          if (o && typeof o.address === "string" && o.address.startsWith("uba.") &&
              typeof o.verdict === "string" && ("books_total" in o || "units_total" in o || "notes" in o)) {
            verdicts[o.address] = { ...o, recovered: true, session: f.replace(/\.jsonl$/, "") };
          }
        }
      }
    }
  }
}

// Write manifest (merge over an existing one; live entries win over recovered only if newer run)
const manPath = path.join(REPO, "extract", "manifest.json");
let existing = {};
try { existing = JSON.parse(fs.readFileSync(manPath, "utf8")); } catch {}
const merged = { ...existing, ...manifest };
fs.writeFileSync(manPath, JSON.stringify(merged, null, 2) + "\n");

// Write recovered verdicts only where no live verdict file exists
const vDir = path.join(REPO, "verification");
fs.mkdirSync(vDir, { recursive: true });
let wrote = 0, skipped = 0;
for (const [addr, v] of Object.entries(verdicts)) {
  const p = path.join(vDir, addr + ".json");
  if (fs.existsSync(p)) { skipped++; continue; }
  fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
  wrote++;
}
console.log(JSON.stringify({
  transcripts: files.length,
  manifestEntries: Object.keys(merged).length,
  manifestRecovered: Object.keys(manifest).length,
  verdictsFound: Object.keys(verdicts).length,
  verdictsWritten: wrote,
  verdictsSkippedExisting: skipped,
}, null, 2));
