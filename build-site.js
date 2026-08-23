// build-site.js — render the static artifact: the atlas as a site, no machinery.
// Reads nodes/*.json and site-src/, writes site/. The queue, the watcher, and the
// agent stay local; the deploy is only the data they produced.
//   node build-site.js && vercel deploy --cwd site --prod
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const NODES = path.join(ROOT, "nodes");
const SRC = path.join(ROOT, "site-src");
const OUT = path.join(ROOT, "site");

// --- load every drawn node ---
const files = fs.readdirSync(NODES).filter((f) => f.endsWith(".json"));
const nodes = {};
for (const f of files) {
  try { const n = JSON.parse(fs.readFileSync(path.join(NODES, f), "utf8")); nodes[n.address] = n; } catch {}
}
const drawn = new Set(Object.keys(nodes));

// --- the full address space: drawn + implied parents + declared exits ---
const all = new Set(drawn);
for (const a of drawn) { const parts = a.split("."); for (let i = 1; i < parts.length; i++) all.add(parts.slice(0, i).join(".")); }
for (const a of drawn) for (const ex of (nodes[a].groups || []).flatMap((g) => g.exits || [])) all.add(ex.address);

// --- label + kind resolution (same rules as serve.js) ---
const LEVELMAP = { "institución": "institution", "facultad": "faculty", "carrera": "career", "programa": "course", "libros": "book" };
const exitKind = {}, exitName = {};
for (const a of drawn) for (const ex of (nodes[a].groups || []).flatMap((g) => g.exits || [])) {
  if (ex.kind) exitKind[ex.address] = ex.kind.replace(/-/g, "");
  if (ex.name && !exitName[ex.address]) exitName[ex.address] = ex.name;
}
const depthKind = (a) => { const s = a.split("."); if (a === "uba") return "institution"; if (a === "uba.cbc") return "cbc"; if (s.length === 2) return "faculty"; if (s.length === 3) return "career"; if (s.length === 4) return "course"; return "book"; };
const kindOf = (a) => { const n = nodes[a]; if (n && n.kind) return n.kind.replace(/-/g, ""); if (n && n.level && LEVELMAP[n.level]) return a === "uba.cbc" ? "cbc" : LEVELMAP[n.level]; if (exitKind[a]) return exitKind[a]; return depthKind(a); };
const labelOf = (a) => {
  const n = nodes[a];
  if (n && n.breadcrumb) return n.breadcrumb[n.breadcrumb.length - 1].label;
  return exitName[a] || a.split(".").pop();
};

// --- graph-data.json: everything the static graph page needs, precomputed ---
const meta = {};
for (const a of all) {
  const n = nodes[a];
  meta[a] = {
    l: labelOf(a),
    k: kindOf(a),
    d: drawn.has(a) ? 1 : 0,
    s: n && n.sealed ? 1 : 0,
    g: (n && n.groundingLevel) || null,
  };
}

// --- write site/ (never wipe: site/.vercel holds the project link) ---
fs.mkdirSync(path.join(OUT, "nodes"), { recursive: true });
for (const f of files) fs.copyFileSync(path.join(NODES, f), path.join(OUT, "nodes", f));
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify({ addresses: [...drawn].sort() }));
fs.writeFileSync(path.join(OUT, "graph-data.json"), JSON.stringify({ generatedAt: new Date().toISOString(), meta }));
for (const f of fs.readdirSync(SRC)) fs.copyFileSync(path.join(SRC, f), path.join(OUT, f));

const sealed = [...drawn].filter((a) => nodes[a].sealed).length;
console.log(`site/ built: ${drawn.size} nodes (${sealed} sealed), ${all.size} addresses in the graph`);
