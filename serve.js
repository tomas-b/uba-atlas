// Tiny local server for the UBA Atlas grounded navigator.
// Serves the shell + graph + node cache; accepts self-describing jobs into a
// queue the idle watcher wakes on. See CLAUDE.md for the workflow.
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const NODES = path.join(ROOT, "nodes");
const QUEUE = path.join(ROOT, "queue.json");
const PORT = 4137;

const send = (res, code, body, type = "application/json") => {
  res.writeHead(code, { "Content-Type": type, "Access-Control-Allow-Origin": "*" });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
};
const readQueue = () => { try { return JSON.parse(fs.readFileSync(QUEUE, "utf8")); } catch { return []; } };
const writeQueue = (q) => fs.writeFileSync(QUEUE, JSON.stringify(q, null, 2));

// --- the grounding graph as mermaid, scoped to a root + depth window ---
function buildMermaid(root, maxDepth) {
  root = root || "uba";
  maxDepth = Number.isFinite(maxDepth) ? maxDepth : 2;

  const files = fs.existsSync(NODES) ? fs.readdirSync(NODES).filter((f) => f.endsWith(".json")) : [];
  const nodes = {};
  for (const f of files) { try { const n = JSON.parse(fs.readFileSync(path.join(NODES, f), "utf8")); nodes[n.address] = n; } catch {} }
  const drawn = new Set(Object.keys(nodes));

  const all = new Set(drawn);
  for (const a of drawn) { const parts = a.split("."); for (let i = 1; i < parts.length; i++) all.add(parts.slice(0, i).join(".")); }
  for (const a of drawn) for (const ex of (nodes[a].groups || []).flatMap((g) => g.exits || [])) all.add(ex.address);

  // scope: root + descendants within maxDepth levels
  const rSeg = root.split(".").length;
  const inScope = (a) => a === root || (a.startsWith(root + ".") && a.split(".").length - rSeg <= maxDepth);
  const scoped = [...all].filter(inScope);
  const scopedSet = new Set(scoped);

  const LEVELMAP = { "institución": "institution", "facultad": "faculty", "carrera": "career", "programa": "course", "libros": "book" };
  const exitKind = {};
  for (const a of drawn) for (const ex of (nodes[a].groups || []).flatMap((g) => g.exits || [])) if (ex.kind) exitKind[ex.address] = ex.kind.replace(/-/g, "");
  const depthKind = (a) => { const s = a.split("."); if (a === "uba") return "institution"; if (a === "uba.cbc") return "cbc"; if (s.length === 2) return "faculty"; if (s.length === 3) return "career"; if (s.length === 4) return "course"; return "book"; };
  const kindOf = (a) => { const n = nodes[a]; if (n && n.kind) return n.kind.replace(/-/g, ""); if (n && n.level && LEVELMAP[n.level]) return a === "uba.cbc" ? "cbc" : LEVELMAP[n.level]; if (exitKind[a]) return exitKind[a]; return depthKind(a); };
  const cls = (a) => { if (nodes[a] && nodes[a].sealed) return "sealed"; const k = kindOf(a); return drawn.has(a) ? k : k + "_f"; };
  const KIND_STYLE = {
    institution: ["#e6e3da", "#6f6d67"], cbc: ["#f4ead9", "#bd7514"], cbcarea: ["#f7f0e4", "#c98a2e"],
    faculty: ["#dfe8f2", "#2c4257"], career: ["#e7e3f2", "#4a3aa7"], course: ["#e2efe8", "#3f7d5a"],
    unit: ["#dcecef", "#2b7a86"], book: ["#f2e3ea", "#a34a72"],
  };
  const labelOf = (a) => {
    const n = nodes[a];
    if (n && n.breadcrumb) return n.breadcrumb[n.breadcrumb.length - 1].label;
    for (const p of drawn) for (const ex of (nodes[p].groups || []).flatMap((g) => g.exits || [])) if (ex.address === a) return ex.name;
    return a.split(".").pop();
  };
  const clean = (s) => String(s || "").replace(/["\[\]|(){}]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
  const id = (a) => "n_" + a.replace(/[^a-z0-9]/gi, "_");
  const hasChildren = (a) => [...all].some((x) => x.startsWith(a + ".") && x.split(".").length === a.split(".").length + 1);

  const lines = ["flowchart LR"];
  for (const a of scoped) {
    const n = nodes[a];
    const suf = n && n.groundingLevel && !n.sealed ? ` · ${n.groundingLevel}` : "";
    // a node at the depth edge that still has hidden children gets a "+" cue
    const more = a !== root && a.split(".").length - rSeg >= maxDepth && hasChildren(a) ? " +" : "";
    lines.push(`  ${id(a)}["${clean(labelOf(a)) + suf + more}"]`);
  }
  const edges = new Set();
  for (const a of scoped) { const parent = a.split(".").slice(0, -1).join("."); if (parent && scopedSet.has(parent)) edges.add(`  ${id(parent)} --> ${id(a)}`); }
  lines.push(...edges);
  for (const a of scoped) lines.push(`  click ${id(a)} call nodeClick("${a}")`);
  const byClass = {};
  for (const a of scoped) (byClass[cls(a)] ??= []).push(id(a));
  for (const [k, ids] of Object.entries(byClass)) lines.push(`  class ${ids.join(",")} ${k};`);
  for (const [k, [fill, stroke]] of Object.entries(KIND_STYLE)) {
    lines.push(`  classDef ${k} fill:${fill},stroke:${stroke},color:#23262b;`);
    lines.push(`  classDef ${k}_f fill:${fill},stroke:${stroke},color:#5a5f66,stroke-dasharray:5 4;`);
  }
  lines.push("  classDef sealed fill:#f6e4e2,stroke:#c0453f,color:#7a2a26,stroke-dasharray:4 3;");

  const crumb = [];
  { const segs = root.split("."); for (let i = 0; i < segs.length; i++) { const a = segs.slice(0, i + 1).join("."); crumb.push({ address: a, label: labelOf(a) }); } }

  const isC = (a) => drawn.has(a) && !(nodes[a] && nodes[a].sealed);
  return {
    mermaid: lines.join("\n"), root, depth: maxDepth, crumb,
    counts: { total: all.size, shown: scoped.length, created: scoped.filter(isC).length, frontier: scoped.filter((a) => !drawn.has(a)).length, sealed: scoped.filter((a) => nodes[a] && nodes[a].sealed).length },
  };
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);
  const p = u.pathname;

  if (p === "/" || p === "/index.html") return send(res, 200, fs.readFileSync(path.join(ROOT, "shell.html"), "utf8"), "text/html; charset=utf-8");
  if (p === "/graph" || p === "/graph.html") return send(res, 200, fs.readFileSync(path.join(ROOT, "graph.html"), "utf8"), "text/html; charset=utf-8");
  if (p === "/mermaid") return send(res, 200, buildMermaid(u.searchParams.get("root") || "uba", parseInt(u.searchParams.get("depth") || "2", 10)));

  if (p === "/index") {
    const files = fs.existsSync(NODES) ? fs.readdirSync(NODES).filter((f) => f.endsWith(".json")) : [];
    return send(res, 200, { addresses: files.map((f) => f.replace(/\.json$/, "")) });
  }
  if (p.startsWith("/nodes/")) {
    const file = path.join(NODES, path.basename(p));
    return fs.existsSync(file) ? send(res, 200, fs.readFileSync(file, "utf8")) : send(res, 404, { error: "not_drawn" });
  }
  if (p.startsWith("/sources/")) {
    const file = path.join(ROOT, "sources", path.basename(p));
    return fs.existsSync(file) ? send(res, 200, fs.readFileSync(file, "utf8")) : send(res, 404, { error: "missing" });
  }

  if (p === "/request" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      let j = {}; try { j = JSON.parse(body); } catch {}
      const address = j.address;
      if (!address) return send(res, 400, { error: "no_address" });
      if (fs.existsSync(path.join(NODES, address + ".json"))) return send(res, 200, { exists: true });
      const action = j.action === "index" ? "index" : "create";
      const label = j.label || address.split(".").pop();
      const description = action === "index"
        ? `Index "${label}" (${address}): find its plan / children from official UBA sources and write its node with the real children as exits. Fail-hard.`
        : `Generate "${label}" (${address}): source it (career → plan; materia → programa PDF via extract/fetch-extract.js → cuatrimestre + topics + book references) and write its grounded node. Fail-hard.`;
      const q = readQueue();
      if (!q.some((x) => x.address === address && x.status === "pending")) {
        q.push({ address, action, label, description, status: "pending", requestedAt: new Date().toISOString() });
        writeQueue(q);
      }
      return send(res, 200, { queued: true, action });
    });
    return;
  }

  send(res, 404, { error: "not_found" });
});

if (!fs.existsSync(QUEUE)) writeQueue([]);
server.listen(PORT, () => console.log(`UBA Atlas on http://localhost:${PORT}  ·  graph at /graph`));
