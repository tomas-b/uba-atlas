# atlas-wave — expand the graph by one wave

First action: `echo '🌊 atlas-wave ▸ expandiendo el grafo'`
(every skill announces itself; every brief you write makes its agent do the same)

## Mental model

```
UBA → career (L1: official plan) → course (L2: cátedra syllabus) → book (L3: leaf)

to index ──research──▶ to create ──generate──▶ created
```

- Can't create the un-indexed; can't index the un-sourced → **seal it honestly** (the gap is information).
- **Expansion** = research pushes the frontier down one level.
- **Verification** = an adversary attacks every new leaf before it ships.
- One wave = one career = **one commit = one revert point**.
- You (orchestrator) never write nodes, never audit them: briefs, launches, verdicts, close.

## Pipeline

```
scout        1 agent    verified source table — reads every COVER, never trusts filenames
researchers  1/materia  parallel · atlas-grounding → nodes/<address>.json
verifiers    1/node     parallel · CLEAN CONTEXT · atlas-verify → verdict JSON
persist      script     tools/persist-verdicts.js — run it after EVERY verifier report; it copies
                        valid verdicts into verification/ and prints one progress line
fix batch    1 agent    scope = not_found[] only, re-derived from extracts
gate         script     node check-graph.js — red = no commit
close        you        chips + README → commit nodes AND verdicts → build → deploy
```

## Briefs (each agent's whole world — they start empty)

- 📜 Restate the laws applied to the case; name 1-2 exemplar nodes to copy.
- 🏷️ Unique scratchpad prefix per agent (they collide otherwise).
- ✅ Checkable deliverable: JSON.parse-validated node, counts both ways.
- ⚖️ **The brief is refutable** — evidence wins; correct sibling briefs mid-flight.
- ✂️ House style for reports: short, markdown lists, emojis as status (✅ ❌ 📄 🔢).

## Progress (what the user sees while the wave runs)

Verifiers write verdicts to ONE shared scratch dir (`<scratch>/verdicts/<address>.json`).
After each verifier reports, run exactly this and relay its single line, nothing else:

```bash
node tools/persist-verdicts.js <scratch>/verdicts uba.<fac>.<career> <wave-name>
# 📥 preloop-computacion 103/111 · ✅ 17 ⚠️ 83 ❌ 3 · faltan: arquitectura ×5 · redes ×3
```

- The number is subtree coverage (courses + units with a verdict / all), so it never
  jumps backwards and never needs explaining.
- Never narrate the mechanics: no "persisted 0", no "already persisted", no per-run
  deltas. Verdicts land whenever a verifier finishes writing, which is before it
  reports — that is expected, not news.
- Keep a `FIXNOTES.md` in the scratch dir: one line per course with the leads the
  fix batch needs (fabrications, re-grounding sources found). Relay the fabrications
  as they arrive; everything else waits for the close report.

## Traps already paid for

- Before accepting "no current programa": probe the career site's news pages + their **Drive folders** (site search doesn't index them) and the sibling department.
- Quote cross-document divergences only from `pdftotext -layout` (default mode eats hyphens).

## Close

1. Gate green → 2. carrera chip `Trazadas N/M` → 3. README numbers → 4. manifest complete → 5. commit + push + `node build-site.js` + deploy.
