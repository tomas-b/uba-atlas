// check-graph.js — graph invariants checker. Run after any batch of node
// writes, before commit/deploy. Errors break the build; warnings inform.
//   node check-graph.js            → report; exit 1 on errors
const fs = require("fs");
const path = require("path");
const NODES = path.join(__dirname, "nodes");

const CONTENT_KINDS = new Set(["career", "course", "book"]);
const STRUCTURAL_KINDS = new Set(["institution", "cbc", "cbc-area", "faculty"]);
const EXIT_KINDS = new Set(["institution", "cbc", "cbc-area", "faculty", "career", "course", "unit", "book"]);

const errors = [], warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

const files = fs.readdirSync(NODES).filter((f) => f.endsWith(".json"));
const nodes = {};

for (const f of files) {
  let n;
  try { n = JSON.parse(fs.readFileSync(path.join(NODES, f), "utf8")); }
  catch (e) { err(f, "JSON does not parse: " + e.message); continue; }
  nodes[n.address] = n;

  const addr = f.replace(/\.json$/, "");
  if (n.address !== addr) err(f, `address "${n.address}" != filename`);

  // breadcrumb must be the prefix chain ending at the address
  if (!Array.isArray(n.breadcrumb) || !n.breadcrumb.length) err(f, "missing breadcrumb");
  else {
    const last = n.breadcrumb[n.breadcrumb.length - 1];
    if (last.address !== n.address) err(f, `breadcrumb ends at "${last.address}", not the node address`);
    for (const b of n.breadcrumb)
      if (b.address !== n.address && !n.address.startsWith(b.address + ".")) err(f, `breadcrumb entry "${b.address}" is not an ancestor`);
  }

  // exits: dotted children only, exactly one segment deeper, typed
  const seen = new Set();
  for (const g of n.groups || []) for (const ex of g.exits || []) {
    if (!ex.address) { err(f, "exit without address"); continue; }
    if (seen.has(ex.address)) warn(f, `duplicate exit ${ex.address}`);
    seen.add(ex.address);
    if (!ex.address.startsWith(n.address + ".")) err(f, `exit ${ex.address} is not a child (cross-link)`);
    else if (ex.address.slice(n.address.length + 1).includes(".")) err(f, `exit ${ex.address} skips a level`);
    if (!ex.name) err(f, `exit ${ex.address} has no name`);
    if (!ex.kind) warn(f, `exit ${ex.address} has no kind`);
    else if (!EXIT_KINDS.has(ex.kind)) warn(f, `exit ${ex.address} has unknown kind "${ex.kind}"`);
  }

  // typed-node rules
  if (n.kind && CONTENT_KINDS.has(n.kind) && !n.groundingLevel && !n.sealed)
    warn(f, `content kind "${n.kind}" without groundingLevel`);
  if (n.kind && STRUCTURAL_KINDS.has(n.kind) && n.groundingLevel)
    warn(f, `structural kind "${n.kind}" carries groundingLevel "${n.groundingLevel}"`);

  // grounding: a non-sealed node cites its source
  if (!n.sealed && !(n.source && n.source.url)) warn(f, "no source.url (grounding citation missing)");
  if (!n.title || !n.lede) warn(f, "missing title or lede");
}

// orphans: a drawn node (except the root) whose parent chain has no drawn ancestor at all
for (const a of Object.keys(nodes)) {
  if (a === "uba") continue;
  const parent = a.split(".").slice(0, -1).join(".");
  if (!nodes[parent]) warn(a + ".json", `parent "${parent}" not drawn (frontier gap above a drawn node)`);
}

console.log(`checked ${files.length} nodes`);
if (warnings.length) { console.log(`\n⚠ ${warnings.length} warnings:`); for (const w of warnings) console.log("  " + w); }
if (errors.length) { console.log(`\n✗ ${errors.length} ERRORS:`); for (const e of errors) console.log("  " + e); process.exit(1); }
console.log("\n✓ graph invariants hold");
