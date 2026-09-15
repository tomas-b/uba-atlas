# atlas-coverage — what's missing, what's next

**Announce yourself.** First action on invocation:

```bash
echo '📊 atlas-coverage ▸ midiendo la frontera'
```

Coverage is measurable because the ground truth is indexed: every career node
declares its real materia count, so absence is countable, not guessed.

## Measure

```bash
# careers: declared materias vs drawn L2 children (the honest completion %)
for c in $(grep -l '"kind": "career"' nodes/*.json); do
  addr=$(basename "$c" .json)
  total=$(python3 -c "import json;print(json.load(open('$c')).get('metadata',{}).get('materias','?'))")
  drawn=$(ls nodes/$addr.*.json 2>/dev/null | wc -l | tr -d ' ')
  echo "$addr  $drawn / $total"
done | sort -t/ -k1 -rn

# nodes without a verdict (generated before the loop, or wave not closed)
comm -23 <(ls nodes | sort) <(ls verification | sort) | grep -v '^uba.json'

# honest gaps: sealed nodes, with their declared reason
grep -l '"sealed": true' nodes/*.json

# L1 careers whose plan is sourced but no materia is drawn yet (next-wave candidates)
grep -l '"groundingLevel": "L1"' nodes/*.json
```

## Propose the next wave

Strategy is **deep-first and contiguous**, not scattered: finish the career in
progress, then complete its faculty, then move faculty by faculty. Scattered
coverage reads as demo confetti; contiguous coverage reads as a method.

Output of this skill when planning: an ordered list of wave candidates, each
with `career address · materias remaining · source situation` (known site,
known repo, or unscouted), sized so one wave closes something nameable
("Letras 62/62", not "37 assorted materias").

## Honesty rules for reporting coverage

- A sealed node counts as covered honestly, not as missing — the gap is the
  finding. Report "62 de 62 (2 selladas con causa)" not "60 de 62".
- Never report a % the chips don't back. If the README or a carrera chip
  disagrees with the recount, that is a bug to fix in the same breath.
- "100% verified" means every L2 course node has a file in `verification/` —
  check it, don't assert it.


---

# atlas-query — read the data

**Announce yourself.** First action on invocation:

```bash
echo '🔎 atlas-query ▸ leyendo el grafo'
```

The data is flat files. No database, no server needed.

| File | What it holds |
|---|---|
| `nodes/<address>.json` | one drawn node per file, named by its address |
| `verification/<address>.json` | one adversarial verdict per verified node — the audit trail (see `verify.md` for the schema; verdict = pre-fix state, verdict + git = full trail) |
| `sources/uba.json` | ground truth: the 13 faculties and their real careers |
| `extract/manifest.json` | provenance of every extract: URL, method (text/ocr/html), size |
| `queue.json` | the job log — pending and done jobs with timestamps |
| `extract/out/*.txt` | extracted syllabus text (local only, gitignored — copyright) |

## The address scheme

Dotted path, one segment per level: `uba` → `uba.der` → `uba.der.abogacia` →
`uba.der.abogacia.comercial` → deeper units. The filename is the address.

## The node schema (the parts that matter)

- `address`, `level` (institución | facultad | carrera | programa | libros), `kind`
- `groundingLevel` — `L1` (from the plan) or `L2` (from the syllabus PDF: topics + books)
- `sealed` — true when there is no source; a sealed node has no children and no content
- `breadcrumb` — the path up, with labels
- `groups[].exits[]` — the children, each `{ address, name, role, kind }`. Exits are the only links; they come from real sources.
- `title`, `lede`, `frame`, `meta[]` — the rendered copy
- `source` — `{ label, url }`, the citation

## Recipes

```bash
# how many nodes, per branch
ls nodes | sed 's/\.json$//' | cut -d. -f1-2 | sort | uniq -c | sort -rn

# coverage by grounding level
cat nodes/*.json | grep -o '"groundingLevel": "L[0-9]"' | sort | uniq -c

# sealed nodes (honest gaps)
grep -l '"sealed": true' nodes/*.json

# verdicts by outcome
grep -h '"verdict"' verification/*.json | sort | uniq -c

# every fabrication the loop caught, with its node
grep -l '"verdict": "fabrication"' verification/*.json

# what a verifier refuted on one node
python3 -c "import json;v=json.load(open('verification/uba.ffyl.historia.historia-medieval.json'));print(*v['not_found'],sep='\n\n')"

# every book reference in the atlas
grep -h '"kind": "book"' -A2 nodes/*.json | grep '"name"'

# one node, readable
cat nodes/uba.cbc.biosalud.biologia-celular.json | python3 -m json.tool
```

Trust rule: what a node says is recoverable from its `source`. If a claim is
not in the source, the claim is a bug — report it, do not patch around it.


---

# atlas-run — operate the machine

**Announce yourself.** First action on invocation:

```bash
echo '⚙️ atlas-run ▸ operando la máquina'
```

The machine has three parts. All of them run local. The deployed site is only
the artifact they produce.

| Part | Command | What it does |
|---|---|---|
| server | `node serve.js &` | serves the local navigator on `:4137` (`/` and `/graph`) and accepts jobs into `queue.json` |
| watcher | `node watch-queue.js &` | sleeps on `queue.json`; on a change, prints the pending jobs and exits — that wakes the agent |
| site build | `node build-site.js` | renders `nodes/` + `site-src/` into `site/` (the static artifact) |
| checker | `node check-graph.js` | validates graph invariants (schema, cross-links, citations); errors exit 1 |

## Work the queue

1. Read `queue.json`. Each pending job is self-contained: `{ address, action, label, description }`.
2. Route by size: `generate-node` (one node) → run `grounding.md` on its
   `description`; `index-career` (a whole subtree) → run `wave.md`, which
   fans out researchers and adversarial verifiers and closes with a commit.
3. Mark the job `done`. Restart the watcher so the loop continues.

Rules: fail hard. If the source is not there, seal the node — do not invent.
A job never renders past its grounding level.

After every batch of node writes, run `node check-graph.js`. Commit only when it
reports zero errors, and commit nodes together with their `verification/`
verdicts — the audit trail travels with the data. Every wave is one commit,
so a bad wave is one `git revert` away.

## Deploy the artifact

```bash
node build-site.js
vercel deploy --cwd site --prod --yes
```

- The Vercel project is `uba-atlas` on the personal scope `tomasbs-projects`. Production: https://uba-atlas.vercel.app
- `site/` is gitignored and regenerable. The link lives in `site/.vercel` — `build-site.js` never wipes the directory.
- The site has no queue and no endpoints. Generation stays local, always.

## Known faults

- The local graph shows "sin respuesta (¿watcher?)" → the watcher is not running. Start it: `node watch-queue.js &`.
- A career or materia PDF does not extract → use `node extract/fetch-extract.js "<pdf-url>" <name>` (handles OCR, Drive links, HTTP-only sites). See `extract/README.md`.
- Port 4137 busy → an old `serve.js` is alive. Kill it first.
