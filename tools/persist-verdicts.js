// Persist adversarial verdicts as they arrive and print ONE progress line.
//   node tools/persist-verdicts.js <verdictsDir> <addressPrefix> [wave]
// - copies every valid <verdictsDir>/<address>.json into verification/ (idempotent)
// - the target set = the whole subtree under <addressPrefix> (courses + units), so the number IS the coverage
// - prints:  📥 <wave> 83/93 · ✅ 12 ⚠️ 68 ❌ 3 · faltan: arquitectura ×5 · redes ×3 · pse · tesis
// Never prints "already persisted" or per-run deltas: the wave total is the only progress number.
const fs = require("fs");
const path = require("path");
const [dir, prefix, wave = "wave"] = process.argv.slice(2);
if (!dir || !prefix) { console.error("usage: persist-verdicts.js <verdictsDir> <addressPrefix> [wave]"); process.exit(2); }
const REPO = path.join(__dirname, "..");
const REQ = ["address","wave","date","verifier","source_reachable","units_total","units_found","books_total","books_found","not_found","omitted","metadata_matches","verdict","notes"];
const VERDICTS = new Set(["clean","errors","fabrication","unverifiable"]);
const ICON = { clean: "✅", errors: "⚠️", fabrication: "❌", unverifiable: "🕳️" };

// target set: prefix subtree (excluding the root node itself)
const targets = fs.readdirSync(path.join(REPO, "nodes"))
  .filter(f => f.startsWith(prefix + ".") && f.endsWith(".json") && f !== prefix + ".json").map(f => f.slice(0, -5));

const bad = [];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".json"))) {
  let v; try { v = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch (e) { bad.push(`${f}: invalid JSON`); continue; }
  const a = v.address;
  const miss = REQ.filter(k => !(k in v));
  if (miss.length) { bad.push(`${f}: missing ${miss.join(",")}`); continue; }
  if (f !== a + ".json") { bad.push(`${f}: filename ≠ address ${a}`); continue; }
  if (!fs.existsSync(path.join(REPO, "nodes", a + ".json"))) { bad.push(`${f}: no such node`); continue; }
  if (!VERDICTS.has(v.verdict)) { bad.push(`${f}: verdict "${v.verdict}"`); continue; }
  const dst = path.join(REPO, "verification", a + ".json");
  if (!fs.existsSync(dst)) fs.writeFileSync(dst, JSON.stringify(v, null, 2) + "\n");
}

// tally over the whole target set (what is persisted now, regardless of when)
const tally = { clean: 0, errors: 0, fabrication: 0, unverifiable: 0 };
const pending = [];
for (const a of targets) {
  const p = path.join(REPO, "verification", a + ".json");
  if (!fs.existsSync(p)) { pending.push(a); continue; }
  const v = JSON.parse(fs.readFileSync(p, "utf8")).verdict; if (v in tally) tally[v]++;
}
const done = targets.length - pending.length;
// group pending by the segment right after the prefix
const groups = {};
for (const a of pending) { const seg = a.slice(prefix.length + 1).split(".")[0]; groups[seg] = (groups[seg] || 0) + 1; }
const faltan = Object.entries(groups).map(([k, n]) => n > 1 ? `${k} ×${n}` : k).join(" · ");
const counts = Object.entries(tally).filter(([, n]) => n).map(([k, n]) => `${ICON[k]} ${n}`).join(" ");
console.log(`📥 ${wave} ${done}/${targets.length} · ${counts}${faltan ? " · faltan: " + faltan : " · completo"}`);
for (const b of bad) console.log(`❌ rechazado ${b}`);
