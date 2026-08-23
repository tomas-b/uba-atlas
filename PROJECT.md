# CASA — the whole thing, top to bottom
### a grounded, LLM-driven, navigable artifact-graph over the real UBA — as tool, as art, as place

> Master scope. The grounding law lives in `CONCEPT.md`; this is the map of the
> whole project — every layer, what's built, what's next, and the realizable path.

## What it is, in one breath

Point at the real Universidad de Buenos Aires and walk it — from the whole institution
down to the class being taught this hour, and the book open on that desk. Every view is a
**node**, generated on demand, in one visual language, **never rendered past what the real
source supports**. On top of that grounded graph sits an **art layer** that turns what's
actually being taught right now into images/memes, and a **physical layer** that lets it
spill out of the screen. It's a study map, a generative-art project, and an installation
about the city's biggest public university — the same graph, three faces.

## The laws (non-negotiable — from CONCEPT.md)

1. **Grounding integrity.** A node exists only if backed by real material. Fail hard, never soft. Better a blank than a beautiful lie.
2. **Link only to the indexed structure.** Top-to-bottom: if a link's target isn't already a node of the real UBA structure, it does not render. `NOT INDEXED` is the honest terminal — bare, unexplained.
3. **Nodes are experience, not commentary.** Node copy is product copy for whoever navigates. No meta, no talking to the maker inside the piece.
4. **Addressable.** Every node is a URL; the tree is navigable up and down; the 1:1 is always the anchor to reground against.

## The layers, ground to sky

**L0 · The ground — the 1:1 corpus.** Real UBA structure and content:
`UBA → facultad → carrera → año → clase → { fuentes · contenidos · fechas · autores · temas · bibliografía }`.
The authority for what is linkable. Built by the sourcing operation.

**L1 · The index / structure graph.** The addressable tree of real nodes + a coverage map
(per node, the grounding level actually held). The engine reads this to enforce law #2.

**L2 · The sourcing orchestration.** One researcher per carrera (~90 across 13 faculties),
each building a well-structured node tree down to the class level, verified adversarially,
fail-hard. → its own section below.

**L3 · The generation engine.** An LLM materializes any node on demand at a chosen
resolution, in the design language, grounded, sealed where thin. Local live loop today
(`serve.js` + `watch-queue.js` + agent-as-generator); a **grounding skill** later makes
fail-hard/linking automatic instead of hand-held.

**L4 · The navigator (the surface).** The wayfinding artifact-graph — concrete / monospace /
ochre, resolution scale, drill up/down. Plus a **HUD overlay** that renders the whole graph
*growing*: grounded interior vs. sealed frontier, god's-eye + first-person together.

**L5 · The art layer — a catalog of materias, grounded in their source books.**
Not memes. For each materia, a researcher agent reads the real source books and **extracts its
aesthetic DNA** — the visual idea of the subject, grounded in its actual content (authors, era,
materials, mood): Filosofía Antigua as marble + Mediterranean light, Paleontología as sediment +
amber, Anatomía as clinical specimen light. All renders share a **house style** — consistent
lighting, lens/bokeh, focal length, finish — so the whole graph reads as one catalog, while each
materia expresses its own palette/mood/props within it. The "now in Ciudad Universitaria" feed is
this catalog, keyed to the live schedule (which materia meets this hour).

**This reuses proven infra, not new research** — Synergy-Shock's `catalog-style-transfer`
(fal.ai Seedream v4; a structured DNA schema `aesthetic.json` [lighting: direction/kelvin/shadow/
rim/contrast; composition: framing + `depth_of_field` + aspect; surfaces; mood] + `color.json`
[palette roles/frequencies, grain, filter, grading]; a 4-asset "style firewall": aesthetic-hero ·
bokeh-plate · palette+grain swatch · lighting-on-neutral; a Change/Keep final-prompt contract;
already packaged as a Claude skill). **Mapping:** brand→materia, curated IG feed→the materia's real
source books, per-brand envelope→per-materia DNA + shared house style. **One adaptation:** the
catalog pipeline preserves a real product (image 0); CASA has no product — it generates the hero
*from the DNA/concept* (closer to the middle-asset generation than the final edit). Everything
upstream transfers; only the terminal stage flips from edit-preserve to generate-from-DNA. So the
art layer is a **sibling skill** of catalog-style-transfer, adapted.

**The vibe is the index; the modality is downstream.** Sense is built bottom-up — a
researcher reads the leaves (books) and proposes the materia's aesthetic DNA ("vibe"). That
one grounded vibe then drives *multiple* generative modalities, chosen by where it's used:
- **style-transfer photo** — the catalog hero (navigator cards, the "now" feed).
- **game-building textures** — the same DNA as wall/facade/material textures for L7's study-house
  (Filosofía Antigua's marble becomes the pabellón's actual surfaces). This is the seam that
  wires L5 → L7: the art layer *is* the game's texture pipeline.
- **text-to-3D** — objects/props/forms generated from the materia concept for the walkable space.
So the art-documentation skill is multi-dimensional: the DNA schema (lighting/composition/color/
mood — already structured) is the shared grounded index, and photo / texture / 3D are output heads
hung off it. Same fail-hard law at every head: the vibe must trace to the real books.

**L6 · The physical layer (arduino).** Let the agents' output *end in a theme, a feel, a
grounded one* — off the screen. An ambient object/installation that reflects what's being
taught now (a light, a print, a display tied to the live schedule + the art layer). The graph
made physical, sited in or about Ciudad Universitaria.

**L7 · The game (north star).** The 3D casa de altos estudios you walk; each faculty a world;
leaves open the real graph. The navigator is its floor-plan.

## The sourcing operation (the researcher contract)

Each researcher takes **one carrera** and returns a grounded node tree:

```
UBA → facultad → carrera → año → clase ⇒ { fuentes, contenidos, fechas, autores, temas, bibliografía }
```

- **Find:** plan de estudios (materias by year/cuatrimestre + correlatividades), each materia's
  programa (unit contents, authors, topics), the class schedule/dates where published, the
  bibliography, cátedra sources — anything online.
- **Return:** structured nodes matching the schema, each with its **grounding level** and **source URLs**.
- **Fail hard:** anything not on a real source → `NOT INDEXED` / sealed. Never invent. Alignment-to-source is pass/fail.
- **Verify:** a second adversarial pass per carrera confirms every claimed class/content traces
  to a cited source; unverifiable → downgraded to sealed. This is law #1 enforced at scale.

**Grounding ceiling per field (the real unknown):** L1 (plan) is public everywhere; L2
(programa/bibliografía) is uneven; **L3 (class-by-class + dates + live schedule) may not be
publicly gettable for many careers.** The pilot exists to find that ceiling before spending on 90.

## Realizable path (phased — de-risked, on-demand)

- **Phase 0 — done.** Navigator PoC; grounding + linking laws; the design language; the live local loop; two published snapshots; Filosofía grounded to L2 as the gold standard.
- **Phase 1 — pilot (next, needs go).** ~5 diverse careers — Filosofía (have), Medicina, Ing. Informática, Abogacía, Paleontología — one researcher + one verifier each, building to `año → clase`. **Output: the real grounding ceiling per field + a locked researcher/verifier/node-schema.** This is what tells us whether L3 is even reachable.
- **Phase 2 — full fan-out.** One researcher per remaining carrera (~90), pipelined research → verify → write, grounded, sealed where thin. Output: the real index down to class level + coverage map. *(This is the ~50-researcher orchestration — big spend, runs on explicit go.)*
- **Phase 3 — the grounding skill + engine.** Fail-hard/linking enforced automatically; generation bound by the coverage map.
- **Phase 4 — art layer.** Real-time-class-grounded image/meme generation per node; the "now in Ciudad Universitaria" feed.
- **Phase 5 — HUD overlay + physical/arduino installation.**
- **Phase 6 — the game.**

## Open questions to answer before scaling (not after)

1. **Is L3 public?** Do careers publish class-by-class content + schedules online, or only plans+programas? (Pilot answers — decides whether the art layer's "right now" is even possible or needs a different data source.)
2. **Live schedule data.** Where does "which class meets this hour" come from — SIU-Guaraní, cátedra pages, scraped cronogramas? Needed for L5's "now."
3. **Cost.** ~90 researchers + verifiers is a large multi-agent spend; the pilot sizes it.
4. **Art grounding & house style.** Reuse catalog-style-transfer's DNA-extraction + firewall (proven). Two decisions: (a) the shared-house-style vs per-materia balance — Tomas wants strong shared lighting/bokeh/focal-length with per-materia palette/mood/props; (b) adapt the terminal stage from edit-preserve-product to generate-from-DNA (no image 0). Same fail-hard discipline applied to pixels: DNA derived from the real books, never invented.

## The one-line north star

The real university, addressable and grounded to the class — and then made to think out loud
in images, and to glow on a desk. Nothing rendered that isn't true.
