# How to research a UBA program
### the grounding methodology — for a researcher (human or agent) sourcing one program

This is the procedure that turns a real UBA program into grounded nodes, honestly.
It doubles as the spec for the eventual **grounding skill**. Companion: `CONCEPT.md`
(the laws), `PILOT-FINDINGS.md` (what's actually reachable), `extract/` (the tools).

## The laws (never bent)

1. **Grounded or it doesn't exist.** A node is backed by a real source or it does not get born. Fail hard; never fabricate to fill a gap.
2. **Link only to the indexed structure.** A node's children are exactly the real sub-parts found in a source. If a link's target isn't a real node of the UBA structure, it does not render.
3. **The word matches the ground.** Anything a node says is recoverable from the source it cites.
4. **Nodes are experience, not commentary.** Node copy is for whoever navigates — impersonal, functional. No meta, no talking to the maker inside the node.

## Grounding levels (the class is time-invariant)

We source *what a class is*, not when it meets this term — so a **stale (even 2020)
programa/planificación is a perfect source**. Recency is irrelevant; timing granularity
is only cuatrimestre (1º/2º).

| Level | Sourced | The node holds |
|---|---|---|
| **L0 · name** | exists in an index | name only (sealed leaf) |
| **L1 · plan** | in the plan: año + correlatividades | the career as structure; materia doors |
| **L2 · skeleton** | cuatrimestre + topics (what it's about) + **book references** — from programa/planificación PDFs | the materia as what-it-*is*: topic map + reading list |
| **L3 · contents** | the actual texts behind the references — a **separate, per-book index** | the book as its own map; the art-DNA source |

## Node architecture (the schema)

Every node is one addressable point: `address` (dotted path), `level`
(institución→facultad→carrera→programa→libros), `breadcrumb` (up the tree),
`groundingLevel`, `eyebrow/title/lede`, `frame` (how to conceptualize it),
`groups[]` (curated sections, each with `exits[]` = children **taken from the real
plan**), `source` (the citation). `sealed:true` marks a `NOT INDEXED` terminal.

## The three states of a node

Every point in the graph is in exactly one state — this is what the UI shows and what
the queue acts on:

- **to index** — the real structure *below* this isn't sourced yet (e.g., a career whose
  materia list we haven't found). The job here is **discovery**: research to find what's
  really there. Until then it has no children.
- **to create** — the children *are* indexed (real, sourced) but this node isn't drawn/
  deepened yet (e.g., a materia we know exists from the plan but haven't grounded to L2).
  The job is **generation**: draw it from its source.
- **created** — drawn and grounded. A real view exists.

Transitions: `to index → (research) → to create → (generate) → created`. A node never
skips a step; you can't create what isn't indexed, and you can't index what has no source
(that seals as `NOT INDEXED`).

## Procedure — sourcing ONE program

Work top-down, cite everything, seal what you can't reach.

1. **Plan (L1).** Find the official plan de estudios (faculty site, dc/depto pages,
   uba.ar). Extract every materia by año + cuatrimestre + correlatividades. Cite the plan URL.
2. **Programa per materia (L2).** For each materia, find the cátedra programa PDF. Run it
   through `extract/fetch-extract.js` (handles scans via OCR, Drive links, HTTP-only sites).
   From the text, pull: cuatrimestre, topics (what it's about), and **book references**
   (title + author + edition). Stale PDFs are fine.
3. **Book contents (L3) — separate.** The actual texts are a per-book index, pursued
   independently (they feed the art DNA). A materia is fully real at L2 without them.
4. **Verify (adversarial).** Every claim traces to a cited source, or it's downgraded/
   sealed. Catch fabrication. Thinness is acceptable; invention is not.
5. **Seal honestly.** Anything not on a real source → `NOT INDEXED` / a lower level. Bare,
   unexplained.

## At career scale — index all below

Choosing a career triggers a **fan-out**: one researcher per program part (per año, or per
materia), each running the procedure above on its slice, in parallel. The career moves
`to index → to create` as the plan is found, and each materia fills to L2 as its programa
is extracted. The queue holds these **jobs** (index-career, generate-node), not raw clicks
— exploration is free; only a deliberate index/create enqueues work.
