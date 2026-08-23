# CASA — The Grounded Resolution Navigator

**A navigable, generative graph over the real Universidad de Buenos Aires — where a map
point either traces down to the territory, or it does not exist.**

Point at the real UBA and walk it: the whole institution in one screen, a faculty as a
floor-plan, a career as structure, a course as what it actually *is* — its topics and its
reading list, extracted from the real programa PDF of the real cátedra. Every view is a
**node**: addressable, generated on demand by an LLM agent, and — the law everything else
serves — **never rendered beyond what the real source supports**.

> *"A node that is not backed by real material does not get born. Fail hard, never soft.
> A confident render over missing source is a lie with good typography — and it's the one
> failure that destroys trust in the whole map."* — the first law, [CONCEPT.md](CONCEPT.md)

This is a personal project / proof of concept: an anti-hallucination discipline turned
into the constitution of a system, then stress-tested with a multi-agent pilot.

<!-- TODO(screenshots): docs/graph.png — the /graph surface with the three node states;
     docs/node.gif — click-to-expand → enqueue → watcher wakes → node drawn. See PUBLICAR.md. -->

## The hard data: 11 agents, zero surviving fabrication

Before scaling, a sourcing pilot ran over **5 diverse careers** (Filosofía, Medicina,
Ingeniería Informática, Abogacía, Paleontología): one researcher agent + one **adversarial
verifier** agent per career, then synthesis — **11 agents, 0 errors, ~437k tokens**.

**The result that matters most: zero fabrication survived verification.** Every gap was an
honest gap, never an invention. The diagnosed limit was *thinness and extraction* (un-OCR'd
scans, dead links, Drive-hosted PDFs) — not lying. Full findings, per-career coverage
tables, and the honest ceiling per grounding level: [PILOT-FINDINGS.md](PILOT-FINDINGS.md).

## How it works

### The grounding ladder

A node may only be drawn to the depth its source actually supports. Below that, it seals.

| Level | Sourced | The node may render |
|---|---|---|
| **L0 · name** | exists in an index | a sealed leaf: name only |
| **L1 · plan** | plan de estudios: year + correlatividades | the career as structure |
| **L2 · skeleton** | semester + topics + book references, from programa PDFs (stale is fine — a class is time-invariant) | the course as what-it-is: topic map + reading list |
| **L3 · contents** | the actual texts behind the references | the book as its own map |

### The machinery (no frameworks, event-driven)

- **`serve.js`** — local server (`:4137`): serves the shell (`/`) and the graph (`/graph`),
  the node cache (`nodes/*.json`, addressable as `uba.cbc.biosalud.biologia-celular`),
  and accepts jobs onto the queue.
- **`queue.json`** — a queue of **self-describing jobs**, not clicks:
  `{ type, address, description, groundingTarget }`, where `description` states what to
  source and how ("extract L2 for materia Y from its programa PDF — fail-hard, never
  invent"). A job carries its own research brief.
- **`watch-queue.js`** — an **idle watcher**: `fs.watchFile` sleeps until the queue
  changes, then hands pending jobs to the agent and returns to idle. No busy polling.
  The agent runs the grounding skill per job, writes nodes, marks them done.
- **Node state machine**: `to index → research → to create → generate → created`.
  You can't create the un-indexed; you can't index the un-sourced (it seals as
  `NOT INDEXED`). Clicking the graph is always free navigation; only the deliberate
  *Index* / *Create* actions enqueue work — wandering never triggers LLM spend.
- **`extract/`** — the stale-PDF → text pipeline (`pdftotext -layout`, OCR fallback via
  tesseract, HTTP-tolerant fetcher, Google-Drive link resolution, rejects login pages
  instead of pretending). This is what turns cited-but-unreadable programa PDFs into
  L2 ground truth. See [extract/README.md](extract/README.md).
- **`.claude/skills/casa-grounding/`** — the grounding methodology packaged as an agent
  skill, so fail-hard is enforced by contract, not by discretion.

### The laws (never bent)

1. **Grounded or it doesn't exist.** Better a sealed leaf than a beautiful lie.
2. **Link only to the indexed structure.** Un-sourced targets render as `NOT INDEXED`.
3. **The word matches the ground.** Anything a node says is recoverable from its cited source.
4. **Nodes are experience, not commentary.** No meta inside the piece.

## Run it

```bash
node serve.js &          # navigator + graph on http://localhost:4137 (/ and /graph)
node watch-queue.js &    # idle watcher — wakes the agent when a job is queued
node extract/fetch-extract.js "<pdf-url>" <name>   # stale PDF → text (L2 source)
```

Ground truth lives in `sources/uba.json` (the 13 faculties and their real careers, from
official UBA sources); generated nodes in `nodes/*.json` (446 nodes at time of writing —
deep pilots through a few branches: CBC, Exactas, Derecho, Filosofía y Letras, Medicina —
not the whole university, and the project says so; that's law #2).

## Docs

- [CONCEPT.md](CONCEPT.md) — the laws, the node contract, the grounding ladder
- [PROJECT.md](PROJECT.md) — full scope, all layers (navigator → art layer → installation)
- [PILOT-FINDINGS.md](PILOT-FINDINGS.md) — the 11-agent pilot, measured
- [RESEARCHING-PROGRAMS.md](RESEARCHING-PROGRAMS.md) — the grounding methodology (spec of the skill)
- [ROADMAP.md](ROADMAP.md) — what's next (faculty-wide scraping fan-out, per-module micro-videos)

## License

[MIT](LICENSE). The grounded nodes summarize publicly available UBA academic documents
(planes de estudio, programas de cátedra) and cite their sources; raw extracted PDF text
is kept out of the repo.
