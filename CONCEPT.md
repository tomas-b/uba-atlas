# The Grounded Resolution Navigator
### a concept

## One paragraph

Point at a real body of structured knowledge — a university's plan de estudios — and
navigate it at any **resolution** you choose: the whole institution in one screen, a
career as a floor-plan, a course as an argument, a book as itself. Each view is a
**node**: addressable by URL, generated on demand, always in the same visual language,
and — the law everything else serves — **never rendered beyond what the real source
supports**. You compress for orientation and expand toward the 1:1; when a view drifts,
it regrounds against the source sitting underneath it. It is not a wiki and not a
summarizer. It is a map whose every point can be traced down to the territory, or it
does not exist.

## The primitive: the node

The unit is not a page or a level — it's a **node**, one addressable point in the
grounded space. Every node carries five things and nothing invented:

1. **the concept, rendered** at this resolution (a map, an axis-cross, a pipeline, a throughline — the shape the *field* dictates, not a template)
2. **where it came from** — provenance up the tree
3. **where it can go** — exits taken *from the real plan*, never imagined
4. **how to conceptualize it** — the curatorial frame that makes it navigable instead of a table
5. **its grounding** — which real source backs it, and to what depth

The internal shape is free (philosophy is two crossing axes; library science is a
directed pipeline). The **contract** is fixed. That's why it generalizes: the invariant
is the contract, not the layout.

## The first law: grounding integrity

**Alignment to the source is the highest value. A node that is not backed by real
material does not get born.**

- **Fail hard, never soft.** If the ground isn't there, you do not generate a
  plausible-looking structure to cover the gap. A confident render over missing source
  is a lie with good typography — and it's the one failure that destroys trust in the
  whole map, because the reader can no longer tell drawn-from-truth from drawn-from-vibe.
- **Ungrounded nodes are not reachable.** A parent does not offer a real door to a child
  it cannot ground. The only thing an ungrounded address may become is a **minimal leaf**
  that says, plainly, "no source yet — sealed." It has no structure, no children, no
  invented content. It fails loudly and stops.
- **The word must match the ground.** Whatever the node *says* must be recoverable from
  the source it cites. If it can't be, it doesn't say it.

This is the law I broke once (a pipeline invented for a career whose UBA plan I didn't
have) and the reason this document exists. Later it should be enforced by a dedicated
**grounding skill**, not left to the generator's discretion.

## Grounding levels (the coverage ladder)

A node may only be drawn to the depth its source actually supports. Below that depth, it
seals.

| Level | What's sourced | What a node may render |
|------|----------------|------------------------|
| **L0 · name** | exists in the index | a sealed leaf: name only |
| **L1 · plan** | in the plan: año + correlatividades | the career as structure; materia doors |
| **L2 · class skeleton** | cuatrimestre (1º/2º) + what-it's-about (topics) + **book references** (titles/authors) — from programa/planificación PDFs, **stale is fine** | the materia as what-it-*is*: topic map + reading list |
| **L3 · book contents** | the actual texts behind the references — a **separate, harder index** | the book as its own map; the aesthetic-DNA source |

**Principle — the class is time-invariant.** We source what a class *is*, not when it
meets this term, so a stale (even 2020) programa/planificación is a *perfect* source for
the skeleton — recency is irrelevant. Timing granularity is only **cuatrimestre (1º/2º)**;
there is no dated-cronograma target (it was never the point, and it isn't public anyway).
Book **references** live in the class node (L2); getting the book **contents** (L3) is a
**separate index point** — hard, decoupled, and the thing the art DNA reads down-to-up.
A node needs L2 to be a real class; it does not need L3 to exist.

Reachability (from the pilot): **L1 solid across UBA. L2 (skeleton) reachable from stale
programa/planificación PDFs** — the bottleneck is reading them (OCR/PDF/fetcher), not their
existence. **L3 (contents) is a separate acquisition index**, pursued per-book, not per-class.

## The engine's job

The engine (the generator + the loop) has exactly one responsibility beyond rendering:
**keep every node aligned to the map.** Concretely — it (a) refuses to exceed a node's
grounding level, (b) carries provenance so any claim is traceable, (c) seals rather than
invents, and (d) regrounds an expanded view against the 1:1 when context is lost. The
pretty part is downstream; the discipline is the product.

## Resolution navigation (why "levels" is the wrong word)

Zooming out is not deletion, it's **re-selection** — like a map at country scale showing
cities, not shrunken streets. A compressed node picks the load-bearing few for its
altitude; an expanded node adds detail *from the source*. The 1:1 is always the anchor
you fall back to, which is what makes compression safe instead of lossy-in-the-bad-way.

## Runtimes

- **Live local loop** (built): a tiny server serves the node cache and queues expansion
  requests; the agent watches the queue, grounds + draws the node, writes it back; the
  page renders it. Dumb plumbing, intelligent generator, grounding on disk.
- **Snapshots**: any node publishes as a self-contained shareable artifact.
- **Generator + skill** (next): the grounding law encoded as a skill so generation is
  bound by source automatically, not by hand.

## Implementation order (what has to be true before free generation)

1. **Source all UBA material, hard.** This is the scopable prerequisite — see below.
2. **Record each node's grounding level** so the engine can enforce the ladder.
3. **Write the grounding skill** that makes fail-hard the default, not a choice.
4. *Then* let the generator run open — it can only draw as deep as the source reaches.

### The sourcing task (scopable)

The goal is to know, for every carrera, **what's actually out there** and at what level:

- **Have / easy (L1):** the 13 faculties and their carreras (done), each career's plan de
  estudios (materias list + correlatividades) — public on faculty sites.
- **Have partially (L2):** materia *programas* (units + bibliography) — public per cátedra,
  uneven coverage; philosophy is good.
- **The hard bar (L3):** class names, order, and content **by semester** — often not
  published centrally; lives in cátedra sites, cronogramas, apuntes. Where we get it,
  the node earns L3; where we don't, it seals at L2.

The deliverable of sourcing is a **coverage map**: per carrera and per materia, the
grounding level we actually hold. That map is what tells the engine how deep each node is
allowed to draw. Nothing is generated past its row in that map.

## Roadmap (not now — noted)

- **The concept as a node.** This document is itself a node in the space (address like
  `meta.concept`) — the map should be able to explain itself.
- **The HUD overlay.** As nodes are drawn, an overlay renders the **whole graph growing** —
  the addressable tree filling in, sealed frontiers vs. grounded interior visible at a
  glance. Navigation and the god's-eye view, together.
- **The study-house game.** The eventual 3D casa de altos estudios the 2D navigator is the
  floor-plan of.

## The one non-negotiable, restated

Better a sealed leaf than a beautiful lie. If the ground isn't there, the node isn't
there. Everything else is negotiable; this is not.
