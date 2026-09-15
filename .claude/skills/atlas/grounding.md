# atlas-grounding

**Announce yourself.** First action on invocation:

```bash
echo '✍️ atlas-grounding ▸ <target>'
```

(Replace `<target>` with the career or materia you were given.)

Turn a real UBA program into grounded graph nodes — honestly. This skill is
the **research + expand** half of the mental model: the atlas is a tree
(`UBA → career L1 → course L2 → book L3`), each level has one source of truth,
and a node moves `to index ──research──▶ to create ──generate──▶ created`.
This skill pushes the frontier down one level for one career or one course;
`verify.md` attacks what it produces. Full methodology:
`/p/learn/RESEARCHING-PROGRAMS.md`. Laws: `/p/learn/CONCEPT.md`. Tools: `/p/learn/extract/`.

## The laws (never bent)

1. **Grounded or it doesn't exist** — a node is backed by a real source or it isn't born. Fail hard; never fabricate to fill a gap.
2. **Link only to the indexed structure** — a node's children are exactly the real sub-parts found in a source.
3. **The word matches the ground** — everything a node says traces to its cited source. Conserve the source's spelling, errata included; declare every normalization. A number the source never prints cannot appear, not even in a decorative map.
4. **Nodes are experience, not commentary** — node copy is impersonal, for whoever navigates. No meta.
5. **Contradictions are recorded, never resolved** — when the source disagrees with itself (two years on one cover, two imprints for one volume), the node carries both. Resolving is inventing.
6. **Count both ways** — every selection or exclusion declares its ratio in both directions ("drew 61 of 111; the 40 excluded are these, and why"). The arithmetic must close.
7. **Grep before asserting an absence** — "the programa doesn't mention X" requires having searched X. A false absence is a fabrication in reverse. (Known trap: approval boilerplate prints "estructura de cátedra" — boilerplate is not content.)
8. **Stale is fine only declared, and only proven stale** — an old programa serves with its year visible, after probing that nothing newer exists: the career site's news pages and their Drive folders (site search does not index them), and the sibling department that actually teaches the materia.

## A job describes its own research

The queue element you act on is self-contained:
`{ type: index-career | generate-node, address, description, groundingTarget }`.
The `description` says what to source and how. Execute it; don't invent scope.

## The graph is a TREE — exits are dotted children only

A node's `exits` must be its **dotted children** (`parent.child`, e.g. `uba.fcen.computacion`
→ `uba.fcen.computacion.aed`). **No cross-links** — never point an exit at something that
isn't your own descendant. A routing link like `uba.cbc.exactas → uba.fcen` is forbidden: a
faculty is not a child of a CBC orientation. If you feel the urge to cross-link, the thing
belongs somewhere else, not as your child.

**CBC is self-contained.** All CBC content lives under `uba.cbc`: the universal materias
(Pensamiento Científico, Sociedad y Estado) directly under it, and each orientation's own
materias under `uba.cbc.<area>`. The CBC **never routes out to faculties**, and CBC subjects
are **never copied into a career**. A career holds only its own (non-CBC) materias.

## Place children at the right level — consult the ancestors

A node's children are **only its own distinct sub-parts.** Before emitting exits, look up
the ancestor chain and the existing graph: if a thing already lives higher up, it belongs
there — link to it or leave it, never duplicate it downward. (Example of the mistake: the
universal CBC subjects — Pensamiento Científico, Sociedad y Estado — belong to `uba.cbc`,
the parent; an orientation area like `uba.cbc.exactas` must NOT re-list them. Its only real
children are the faculties it routes to.) This is a corollary of "link only to the indexed
structure": duplicating a parent-owned node into a child is inventing structure that isn't
there. When unsure where something belongs, put it once, at the highest level it's true.

## The three states you move nodes through

`to index → (research) → to create → (generate) → created`.
Can't create the un-indexed; can't index the un-sourced (seal it `NOT INDEXED`).

## Procedure

**generate-node (a career at L1):** find the official plan de estudios (faculty/depto site,
uba.ar). Emit the career node with every materia by año + cuatrimestre + correlatividades as
`exits` (each a `to create` child). Cite the plan URL. Never invent a materia.

**generate-node (a materia at L2):** find the cátedra programa PDF — and verify it by
reading its cover, never by its filename (filenames lie: wrong cátedra letters, dropped
words, stale years). Run `node extract/fetch-extract.js "<url>" <name>` (curl with
redirects and Drive links, `pdftotext -layout`, OCR fallback for scans and corrupt text
layers; self-registers provenance in `extract/manifest.json`). **Read the full extract**,
then draw: units, bibliography with every entry counted (law 6), régimen, quotes literal.
When several cátedras publish, draw one and declare the selection both ways, citing the
alternates from covers you opened yourself. Book *contents* (L3) are a separate per-book
index; a materia is real at L2.

**index-career (fan-out):** runs as a wave — scout, parallel researchers (this skill,
one per materia), parallel adversarial verifiers (`verify.md`, one per node), fix
batch, gate, one commit. Orchestration: `wave.md`.

## Every node is typed — `kind` + `metadata`

Give each node a **`kind`** (its structural type) and a **`metadata`** block of facts proper
to that kind. The grounding level is just one metadata field, and it belongs ONLY to content
kinds — not to structural ones. This is what keeps a routing node from wrongly wearing "L1".

| `kind` | structural? | carries `groundingLevel`? | metadata examples |
|---|---|---|---|
| `institution` | yes | no | faculties count |
| `cbc` | yes | no | formula "6 = 2+2+2", maxYears, modes |
| `cbc-area` | yes | no | `routesTo` (faculties), `ownsSubjects:false` |
| `faculty` | yes | no | `careers` count |
| `career` | **content** | **yes → L1** | `plan` year, `años`, `materias` count, `correlativas` |
| `course` (materia) | **content** | **yes → L2** | `régimen`, `cargaHoraria`, `cuatrimestre`, cátedra, `bibliography` |
| `book` | **content** | **yes → L3** | author, edition, publisher |

Rule: **grounding levels (L1/L2/L3) apply from the career down** (career→course→book).
Structural nodes above the career (institution / faculty / cbc / cbc-area) have no level —
they're either created + sourced, or not. Never label a structural node L1.

## Output — the node schema

Write `nodes/<address>.json`:
`{ address, level (institución|facultad|carrera|programa|libros), kind, metadata{…},
groundingLevel (only for content kinds), breadcrumb[], eyebrow, title, lede, frame,
groups[{ kind, eyebrow, title, note, map?, exits[{ address, name, role, tag, kind }] }],
source { label, url }, sealed? }`.
Exits are children taken from the real plan only. **Every exit declares its child's `kind`**
(institution|cbc|cbc-area|faculty|career|course|unit|book) — that's how a not-yet-created
child gets the right color/type in the graph; never leave it to be guessed from address depth.
`unit` = a section/unidad *inside* a course; distinct from `course` (a materia). `sealed:true`
for `NOT INDEXED` terminals.

## Fail-hard checklist

- No source URL → don't state it.
- Programa unreadable after extract → seal at L1, don't guess topics/books.
- Thinness is fine; invention is a total failure.
