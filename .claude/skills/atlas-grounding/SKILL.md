---
name: atlas-grounding
description: Expand and ground the UBA Atlas graph — source a real UBA career or materia into grounded nodes at the honest grounding level (L1 plan → L2 skeleton), fail-hard. Use when a queue job asks to index a career or generate a node, or when adding real UBA program structure under /p/learn/nodes.
---

# atlas-grounding

Turn a real UBA program into grounded graph nodes — honestly. Full methodology:
`/p/learn/RESEARCHING-PROGRAMS.md`. Laws: `/p/learn/CONCEPT.md`. Tools: `/p/learn/extract/`.

## The laws (never bent)

1. **Grounded or it doesn't exist** — a node is backed by a real source or it isn't born. Fail hard; never fabricate to fill a gap.
2. **Link only to the indexed structure** — a node's children are exactly the real sub-parts found in a source.
3. **The word matches the ground** — everything a node says traces to its cited source.
4. **Nodes are experience, not commentary** — node copy is impersonal, for whoever navigates. No meta.

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

**generate-node (a materia at L2):** find the cátedra programa PDF. Run
`node extract/fetch-extract.js "<url>" <name>` (handles scans via OCR spa+eng, Drive links,
HTTP-only sites, rejects HTML/login). From the text pull: cuatrimestre, topics (what it's
about), and **book references** (title + author + edition). Stale PDFs are fine — the class
is time-invariant. Book *contents* (L3) are a separate per-book index; a materia is real at L2.

**index-career (fan-out):** wave 1 — one agent finds the plan (→ career becomes `to create`
with materia children). Wave 2 — one subagent per materia extracts its L2. Verify
adversarially: every claim traces to a cited source or it's downgraded/sealed.

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
