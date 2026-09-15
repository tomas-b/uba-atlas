---
name: atlas-wave
description: Expand the UBA Atlas graph to a career — run one wave. Use when the user asks to expand, index or trace a career or faculty ("expandí Edición", "index Psicología"), when a queue job says index-career, or to close a wave in progress. Orchestrates scout, parallel researchers, parallel adversarial verifiers, fix batch, gate, commit, deploy.
---

# atlas-wave — expand the graph by one wave

**Announce yourself.** First action on invocation, before anything else:

```bash
echo '🌊 atlas-wave ▸ expandiendo el grafo'
```

Every skill in this repo opens with its banner, and every brief you write must
tell its agent to open with theirs — that is how a wave stays readable in the
transcripts: you always know which operator is talking.

## The mental model (read this first)

The atlas is a tree that grows one level at a time, and each level has one
source of truth:

```
UBA → career (L1: the official plan) → course (L2: the cátedra's syllabus) → book (L3: leaf)
```

A node moves through three states:

```
to index ──research──▶ to create ──generate──▶ created
```

Can't create the un-indexed; can't index the un-sourced (seal it honestly —
the gap is information). **Expansion = research pushes the frontier down one
level. Verification = an adversary attacks every new leaf before it ships.**
A wave is one push on one career: from unsourced to grounded, audited,
committed and deployed. One wave = one commit = one revert point.

The orchestrator (this session) never writes nodes and never audits them. It
writes briefs, launches agents, persists verdicts, and closes.

## The pipeline

```
scout          1 agent    verified source table (reads every cover, never trusts filenames)
researchers    1/materia  each runs the atlas-grounding skill → writes nodes/<address>.json
verifiers      1/node     each runs the atlas-verify skill → verdict JSON (clean context!)
persist        you        verification/<address>.json, as each verdict arrives
fix batch      1 agent    applies ONLY what the verdicts enumerate, re-derived from extracts
gate           script     node check-graph.js — red means no commit, no exceptions
close          you        coverage chips + README numbers → commit nodes AND verdicts
                          together → node build-site.js → vercel deploy --cwd site --prod --yes
```

Researchers run in parallel (launch them in one message); verifiers too.
Pipeline across batches: batch-1 verifiers run while batch-2 researchers work.

## Briefs — the part that makes it work

House style for every report (put it in every brief): **short**. Emojis as
status marks (✅ done · ❌ refuted · 📄 source · 🔢 counts), markdown lists,
no filler prose. One line per fact.


Every agent starts with an empty context. The brief is its whole world, so:

- **Restate the laws in the brief**, applied to the case. CLAUDE.md loads for
  every session in the repo, but specificity wins: "grep before asserting an
  absence" lands harder as "the REDEC boilerplate prints 'estructura de
  cátedra' — boilerplate is not content".
- **Point at exemplars**: name 1-2 existing nodes to copy structure and voice from.
- **Give each agent a scratchpad prefix** — parallel agents share the scratchpad
  and have collided on filenames.
- **Make the deliverable checkable**: JSON.parse-validated node, counts both
  ways, a report you can hand to the verifier's brief.
- **The brief is refutable.** If an agent finds the brief wrong (a "stale"
  source with a current edition, a cátedra the brief denies), evidence wins.
  Expect it; it is the loop working. Correct sibling briefs mid-flight when one
  agent's finding invalidates them.

## Scout discipline

Verify every URL by downloading and reading page 1 (`pdftotext -l 1`). A
not-found is a valid result when it carries the searches that failed. Before
accepting "no current programa exists": probe the career site's news pages and
their Drive folders (site search does not index them), and the sibling
department that actually teaches the materia. See
`memory/ffyl-source-hunting-traps.md` for the traps already paid for.

## Persisting verdicts

Write each verdict to `verification/<address>.json` as it arrives — do not
batch at the end (a crashed session loses them; they are the audit trail).
Schema and semantics: see `atlas-verify`. A re-grounded node keeps a `history`
field preserving what the earlier verdict caught.

## Fix batch rules

Scope = the union of `not_found[]` across the wave's verdicts, nothing else.
String-level edits in the node's own voice, each re-derived from the extract
(never from memory), `JSON.parse` after every write, nothing flagged left
silently unfixed. Then the gate again.

## Close checklist

1. `node check-graph.js` green.
2. Coverage chips on the carrera node (`Trazadas N / M`).
3. README numbers (nodes, addresses, verdicts, catches table if the wave earned a row).
4. `extract/manifest.json` has an entry per extract used (fetch-extract self-registers; verify).
5. Commit nodes + verdicts together; push; `node build-site.js`; deploy.
