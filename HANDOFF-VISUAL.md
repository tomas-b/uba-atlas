# Handoff — visual work on UBA Atlas

You work in THIS clone (`~/p/uba-atlas-visual`, branch `visual`). The data agent
works in `~/p/learn` on `main`. Same GitHub remote (`tomas-b/uba-atlas`).

## Your scope

- `site-src/` — the three pages of the static artifact (`index.html` navigator,
  `graph.html`, `audit.html`). All CSS/JS is inline; no build tooling, no deps.
- `build-site.js` — renders `nodes/` + `verification/` + `site-src/` into `site/`.
  You may extend what it precomputes (e.g. richer `graph-data.json`), but keep it
  zero-dependency and keep the output static.
- `serve.js` — local preview on :4137.

## Hard boundaries

- **Do NOT edit `nodes/` or `verification/` content.** That data is adversarially
  verified; a visual change never rewrites a claim. If a page needs data in a
  different shape, precompute it in `build-site.js` from the JSONs as they are.
- **Do NOT deploy.** This clone has no `site/.vercel` link on purpose. Production
  deploys happen only from `~/p/learn` after review.
- **Commit to the `visual` branch and push it.** The data agent merges into
  `main` after checking that `node check-graph.js` and `node build-site.js`
  still pass and that no node/verdict JSON changed.

## Preview loop

```bash
node build-site.js && node serve.js &   # then open http://localhost:4137
```

## Design ground rules already in place

- Aesthetic: paper/ink + monospace display font, light & dark via
  `prefers-color-scheme`, tokens in `:root`. Keep both themes working.
- The audit surfaces (per-node "Verificación adversarial" panel, `/audit.html`)
  show ONE pattern — no migration/era storytelling in UI copy.
- Everything must work as a static page (no endpoints, no external fetches
  beyond the artifact's own JSON files).

## Open visual ideas (from the backlog, none committed)

- README screenshots/GIF (`docs/graph.png`, `docs/node.gif`) for the repo page.
- Graph view: level-of-detail rendering at 6k+ addresses, faculty coloring,
  verified-badge glyphs from `meta[a].v`.
- Node page: grounding-ladder visual (L0→L3), better mobile layout for the
  meta grid, book-exit typography.
- Audit page: per-wave grouping, sparkline of catches per wave.
