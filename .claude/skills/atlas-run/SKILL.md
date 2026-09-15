---
name: atlas-run
description: Operate the UBA Atlas machine — start the local server and the idle watcher, work the job queue, build the static site, and deploy it. Use when the user says to run the atlas, process the queue, rebuild the site, or deploy.
---

# atlas-run — operate the machine

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
2. Route by size: `generate-node` (one node) → run `atlas-grounding` on its
   `description`; `index-career` (a whole subtree) → run `atlas-wave`, which
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
