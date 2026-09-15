# UBA Atlas — grounded, navigable, generative graph over the real UBA

The main workflow. One addressable graph of the University of Buenos Aires —
institution → faculty → career → materia → book — grounded 1:1 in real material,
navigable, and (later) generative as art. **Nothing renders that isn't true.**

Deep docs: `CONCEPT.md` (the laws + levels), `RESEARCHING-PROGRAMS.md` (the grounding
methodology), `PROJECT.md` (the full scope, all layers), `PILOT-FINDINGS.md` (what's
reachable), `extract/` (the stale-PDF → text pipeline).

## The workflow

The **graph** (`/graph`) is the surface: every point is a node in one of three states.
The **queue** is a job queue (not raw clicks). Two **skills** do the work.

### Node states

- **to index** — the real structure below it isn't sourced yet → job: *research/discover*.
- **to create** — children are indexed (real) but this node isn't drawn → job: *generate*.
- **created** — drawn + grounded.

Flow: `to index → research → to create → generate → created`. Can't create the un-indexed;
can't index the un-sourced (that seals as `NOT INDEXED`).

### Interaction (kills accidental spend)

- **Graph click = expand/navigate** — free, always; reveals already-indexed structure.
- **Index / Create = deliberate** — the only actions that enqueue a job. A `to index` node
  offers *indexar*; a `to create` node offers *generar*. Wandering never triggers work.

### The queue (self-describing jobs, not clicks)

A queue element is a **job that describes its own research** — not just an address:
`{ type, address, description, groundingTarget }`, where `description` says what to source
and how (e.g. "find the plan of X" / "extract L2 for materia Y from its programa PDF"). So
a job is self-contained work the atlas/grounding.md skill can execute without extra context.

- **index-career** — runs as a **wave** (the `atlas` skill (wave.md)): scout → parallel researchers
  (atlas/grounding.md, one per materia) → parallel **adversarial verifiers**
  (atlas/verify.md, one per node, clean context) → fix batch → `check-graph.js` gate →
  one commit, nodes and verdicts together. Verdicts persist to `verification/`.
- **generate-node** — draw one node from its source (atlas/grounding.md).

**The watcher is idle until the queue changes.** `watch-queue.js` (fs.watchFile) sleeps,
wakes on a queue write, hands the new job(s) to the agent, then returns to idle — no busy
polling. A queued job → agent runs the grounding skill on its description → writes node(s)
→ marks done → idle again.

## The skill (the machine ships its own operator)

- **`atlas`** (`.claude/skills/atlas/`) — one skill, four role docs beside it:
  `wave.md` (expand a career: scout ▸ write ×N ▸ audit ×N ▸ ship),
  `grounding.md` (research one materia, the 8 laws), `verify.md` (refute one
  node, emit its verdict), `ops.md` (coverage, queries, build & deploy).


## The laws (never bent)

Grounded-or-it-doesn't-exist · link only to indexed structure · the word matches the
ground · nodes are experience, not meta.

## Run it

```bash
node serve.js &          # navigator + graph on :4137 (/ and /graph)
node watch-queue.js &    # tracked watcher — fires the agent on a queued job
node extract/fetch-extract.js "<pdf-url>" <name>   # stale PDF → text (L2 source)
```
Node cache: `nodes/*.json`. Ground truth: `sources/`.
