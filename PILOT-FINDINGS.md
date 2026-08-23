# Sourcing pilot — findings (2026-07-22)

5 careers, one researcher + one adversarial verifier each, then synthesis. 11 agents,
0 errors, ~437k tokens. **The result that matters most: zero fabrication survived
verification** — the fail-hard law held. Every gap was an honest gap, never an invention.
The problem is *thinness and extraction*, not lying.

## Coverage

| Career | Verified ceiling | Materias | Bibliography (art-layer oxygen) | Weekly schedule public? |
|---|---|---|---|---|
| Filosofía | L2 (1 materia) | 8 verified / 6 sealed | **none** 0/14 | yes (Drive PDFs, unextracted) |
| Medicina | L2 (2 materias) | 49 / 0 | partial 2/49 | no (doesn't exist publicly) |
| Ing. Informática | L2 (1 materia) | 30 / 0 | partial 1/30 | yes |
| Abogacía | L2 (5, Penal-CPO only) | 25 / 0 | partial 5/25 | yes (Libro CPO, verbatim) |
| Paleontología | L1 | 27 / 0 | none 0/27 | yes (fetcher bug missed it) |

## The three-level verdict

- **L1 (plan skeleton) — solid everywhere.** Materia names, years, correlatividades: clean,
  cheap, fabrication-free across all five. The structure graph is fully reachable university-wide.
- **L2 (bibliography + topics) — real but pocketed.** Surfaces for a *minority* of materias
  (never > ~20%; two careers got zero). But where it lands, quality is excellent and verified —
  full authors, titles, editions. The aesthetic anchors are real when extractable.
- **L3 (class-by-class bound to dates) — effectively not public.** Reachable exactly once
  (Ingeniería's dated calendar in planificación PDF 7541) and even that was a stale 2020 template.
  Everywhere else it's login-gated (Moodle, Campus Virtual) or doesn't exist. **Drop L3 from scope.**

## The key diagnosis: the blocker is EXTRACTION, not availability

The books and schedules are more *there* than the pilot captured. It missed them to tooling gaps,
not absence:

- DSpace (FILO:Digital) serves HTML not PDF text; 2017 program PDFs return HTTP 410.
- Un-OCR'd EPSON scans (Medicina programas — the books are on the page as pixels).
- Forced-HTTPS → ECONNREFUSED on HTTP-only cátedra sites (Paleontología schedules exist, weren't fetched).
- Drive-hosted schedule PDFs never opened (Filosofía días/horarios).
- Dated cronogramas behind logins (the only genuinely-gated layer).

**This means the art layer isn't blocked by reality — it's blocked by an OCR/fetcher pipeline we haven't built.** Solvable.

## Schedule → the "now" feed reframed

Dated per-class cronograma is not public. But **weekly-recurring schedule (which materia meets
which day + franja horaria) IS public for ~4/5 fields** — from heterogeneous per-faculty sources.
So the "¿qué se enseña ahora en Ciudad Universitaria?" feed keys off the **weekly recurring
schedule**, not dated cronogramas. That's enough for "what's being taught right now," and it's public.

## Recommendation — staged

1. **L1 skeleton fan-out, now (~90 careers).** Feasible, cheap, honest. Makes the navigator real
   across the whole university — every carrera a grounded node, materias listed, `sin trazar`
   below. No new infra needed.
2. **Build the extraction pipeline (the real unlock).** OCR + pdftotext + DSpace-PDF handling +
   an HTTP-tolerant, Drive-following fetcher + per-faculty schedule adapters. This is the gate for
   **both** L2 bibliography (art layer's DNA source) **and** weekly schedule (the now-feed). Until
   it exists, the fan-out yields name-only skeletons with almost no books.
3. **Drop L3 dated content.** Treat any L3 hit as opportunistic/stale.

## What this means for the whole project

- The **navigator** can go university-wide immediately (L1). Real, now.
- The **art layer** has a clear, bounded blocker (the extraction pipeline) — not a fundamental one.
  Where books were extracted, they're perfect DNA anchors; we just need to reach more of them.
- The **fail-hard discipline is validated at scale** — 11 agents, zero surviving fabrication.
- The extraction pipeline is the highest-leverage next build: it simultaneously feeds the art
  layer's bibliographies and the now-feed's schedules.
