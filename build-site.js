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
fs.mkdirSync(OUT, { recursive: true });

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

// --- verification/: the audit trail rides along with the artifact ---
const VER = path.join(ROOT, "verification");
const verdicts = [];
if (fs.existsSync(VER)) {
  fs.mkdirSync(path.join(OUT, "verification"), { recursive: true });
  for (const f of fs.readdirSync(VER).filter((f) => f.endsWith(".json"))) {
    try {
      const v = JSON.parse(fs.readFileSync(path.join(VER, f), "utf8"));
      if (!v.address || !v.verdict) continue;
      fs.copyFileSync(path.join(VER, f), path.join(OUT, "verification", f));
      verdicts.push({
        a: v.address, v: v.verdict,
        u: v.units_found ?? null, ut: v.units_total ?? null,
        b: v.books_found ?? null, bt: v.books_total ?? null,
        w: v.wave || null, d: v.date || null, r: v.recovered ? 1 : 0,
      });
    } catch {}
  }
  verdicts.sort((x, y) => x.a.localeCompare(y.a));
  fs.writeFileSync(path.join(OUT, "audit-data.json"), JSON.stringify({ verdicts }));
}
const verifiedSet = new Set(verdicts.map((v) => v.a));
for (const a of all) if (meta[a]) meta[a].v = verifiedSet.has(a) ? 1 : 0;

// Graph-only presentation index. Keep source text and group order; a referenced
// child does not acquire its parent's grounding level or audit verdict.
const plain = (s) => String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const groups = {};
for (const a of all) {
  const n = nodes[a], m = meta[a];
  m.p = a === "uba" ? null : a.split(".").slice(0, -1).join(".");
  m.f = a === "uba" ? null : a.split(".").slice(0, 2).join(".");
  if (n) {
    m.title = plain(n.title);
    m.description = plain(n.lede);
    m.source = n.source || null;
    m.sources = n.sources || [];
    groups[a] = (n.groups || []).filter((g) => g.exits?.length).map((g, i) => ({
      id: a + "::" + i,
      label: plain(g.eyebrow || g.title || "Contenido"),
      title: plain(g.title), note: plain(g.note),
      children: g.exits.map((e) => e.address),
    }));
    for (const [i, g] of (n.groups || []).filter((g) => g.exits?.length).entries()) {
      for (const [order, ex] of g.exits.entries()) {
        if (!meta[ex.address]) continue;
        Object.assign(meta[ex.address], {
          group: i, order, role: plain(ex.role), tag: plain(ex.tag),
          referenceParent: a,
        });
      }
    }
  }
}
const children = {};
for (const a of all) if (meta[a].p) (children[meta[a].p] ??= []).push(a);
for (const a of [...all].sort((a, b) => b.split(".").length - a.split(".").length)) {
  const m = meta[a];
  m.counts = { addresses: 1, pages: m.d && !m.s ? 1 : 0, sealed: m.s,
    courses: m.k === "course" ? 1 : 0,
    coursePages: m.k === "course" && m.d && !m.s ? 1 : 0,
    units: m.k === "unit" ? 1 : 0, books: m.k === "book" ? 1 : 0,
    audits: m.v, l2Courses: m.k === "course" && m.g === "L2" ? 1 : 0 };
  for (const c of children[a] || []) for (const k of Object.keys(m.counts)) m.counts[k] += meta[c].counts[k];
}
for (const v of verdicts) if (meta[v.a]) meta[v.a].audit = { verdict: v.v, date: v.d, wave: v.w };

// --- write site/ (never wipe: site/.vercel holds the project link) ---
fs.mkdirSync(path.join(OUT, "nodes"), { recursive: true });
for (const f of files) fs.copyFileSync(path.join(NODES, f), path.join(OUT, "nodes", f));
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify({ addresses: [...drawn].sort() }));
fs.writeFileSync(path.join(OUT, "graph-data.json"), JSON.stringify({ schemaVersion: 2, generatedAt: new Date().toISOString(), meta, groups }));
for (const f of fs.readdirSync(SRC)) fs.cpSync(path.join(SRC, f), path.join(OUT, f), { recursive: true });

const sealed = [...drawn].filter((a) => nodes[a].sealed).length;
console.log(`site/ built: ${drawn.size} nodes (${sealed} sealed), ${all.size} addresses in the graph, ${verdicts.length} verdicts`);
