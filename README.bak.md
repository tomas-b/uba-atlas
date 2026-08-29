# 🧭 UBA Atlas

**The entire Universidad de Buenos Aires as one navigable graph — built by
agents, published as a static artifact.**

**Live: [uba-atlas.vercel.app](https://uba-atlas.vercel.app) · graph view: [/graph.html](https://uba-atlas.vercel.app/graph.html)**

Every node traces to a real document (a plan de estudios, a syllabus PDF). If
there is no document, there is no node.

<!-- TODO: docs/graph.png + docs/node.gif -->

## What this project is

An **AI engineering** project with a hard split down the middle:

- 🤖 **The machine** — lives in this repo, runs local: a job queue, an idle
  watcher, and Claude Code agents bound by skills. It researches the real UBA
  and writes nodes, one grounded JSON at a time.
- 🌐 **The artifact** — the deploy. A static site with zero endpoints: just the
  JSON the machine produced, rendered. Nothing generates online. You cannot
  write a file and get an answer — that loop is local only.

The rule that connects them: **no source → no node**. The map never guesses; a
gap renders as a sealed node.

> "A confident render over missing source is a lie with good typography."

## How the artifact gets built

```
syllabus PDF ─▶ extract (pdftotext/OCR) ─▶ agent writes node.json ─▶ build ─▶ static site
```

1. 📬 A **job** lands in `queue.json`. Jobs are self-describing: each one states
   what to source and how ("extract topics + books for X from its syllabus —
   never invent"). Clicking around the local graph is free; only a deliberate
   *Index* / *Create* enqueues work.
2. 😴 The **idle watcher** (`watch-queue.js`) sleeps on the file, wakes the
   agent when a job lands. No polling.
3. 📖 The agent runs the **skills** — the repo ships its own operators:
   - `atlas-grounding` — how to source a career or course, fail-hard
   - `atlas-run` — how to run the machine, work the queue, deploy
   - `atlas-query` — how to read the data: schema, addresses, coverage
   Open the repo in Claude Code and the machine knows how to drive itself.
4. 🏗️ `build-site.js` renders `nodes/` into `site/` — the whole deploy is that
   folder. One command, zero dependencies, zero servers.

## Does "never invent" hold at scale? Tested ✅

| | |
|---|---|
| careers probed end to end | **5** — Filosofía · Medicina · Informática · Abogacía · Paleontología |
| agents | **11** — 1 researcher + 1 adversarial verifier per career |
| fabrications that survived | **0** (in ~437k tokens) |
| grounded nodes on the site today | **446** |
| syllabus PDFs → text (OCR included) | **52** |

Every gap was an honest gap. The bottleneck is extraction (scans, dead links,
Drive PDFs) — not honesty, and not availability.

## Run the machine

```bash
node serve.js &          # local navigator + graph on :4137
node watch-queue.js &    # wakes the agent when a job lands
node build-site.js       # render the static artifact into site/
```

Or open the repo in Claude Code and say **"run the atlas"** — the `atlas-run`
skill is the runbook.

## Next: scan everything

1. 🔎 **Inventory** — one scraper per faculty: every plan + syllabus URL
2. ⬇️ **Download** — batch-fetch and extract all of it (deterministic, resumable)
3. ✍️ **Summarize** — one agent per course, from the source text only
4. 🚀 **Publish** — redeploy the artifact, faculty by faculty, until the whole
   university is on the map

Further out: a ~1 min micro-video per course, generated from the same node JSON.

---

MIT · Deep docs in the repo: `CONCEPT.md` · `PROJECT.md` · `PILOT-FINDINGS.md` · `PLAN-SCRAPEO.md`
