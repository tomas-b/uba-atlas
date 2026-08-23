# 🧭 UBA Atlas

**Walk the entire Universidad de Buenos Aires — from the whole institution down
to one course and its reading list.**

Every point on the map traces to a real document. If there is no document,
there is no point.

<!-- TODO: docs/graph.png + docs/node.gif -->

## The idea

- 🏛️ **The whole real UBA as one graph** — 13 faculties, ~90 careers, ~3,000 courses
- 📄 **Each course built from its real syllabus PDF** — topics + bibliography, source cited
- 🚫 **No source → no node.** The map never guesses. A gap shows as a sealed node.
- 🌐 **End goal: a static site** — one page per course, one summary you can trust

> "A confident render over missing source is a lie with good typography."

## Does the no-guessing rule hold? Tested with 11 agents ✅

| | |
|---|---|
| careers probed end to end | **5** — Filosofía · Medicina · Informática · Abogacía · Paleontología |
| agents | **11** — 1 researcher + 1 adversarial verifier per career |
| fabrications that survived | **0** (in ~437k tokens) |
| grounded nodes written | **446** |
| syllabus PDFs → text (OCR included) | **52** |

Verdict: every gap was an honest gap. The bottleneck is *extraction* (scans,
dead links, Drive PDFs) — not honesty, and not availability. Solvable tooling.

## How it works

```
syllabus PDF ──▶ extract (pdftotext / OCR) ──▶ agent writes the node ──▶ graph ──▶ static site
```

- 🕸️ **Graph** — every node addressable, like `uba.cbc.biosalud.biologia-celular`
- 📬 **Job queue** — each job describes its own research ("extract L2 for X from its syllabus — never invent")
- 😴 **Idle watcher** — sleeps until the queue changes, then wakes the agent. No polling.
- 🖱️ **Clicking is free** — only a deliberate *Index* / *Create* action spends tokens
- 🧰 **Zero dependencies** — two small Node scripts and a folder of JSON

## Run it

```bash
node serve.js &          # graph on http://localhost:4137/graph
node watch-queue.js &    # wakes the agent when a job lands
```

## Next

1. 🔎 **Inventory** — one scraper per faculty: find every plan + syllabus URL
2. ⬇️ **Download** — batch-fetch and extract everything (deterministic, resumable)
3. ✍️ **Summarize** — one agent per course, from the source text only
4. 🚀 **Publish** — build the static site on GitHub Pages, faculty by faculty

Further out: a ~1 min micro-video per course, and an art layer grounded in each
course's real books.

---

MIT · Deep docs in the repo: `CONCEPT.md` · `PROJECT.md` · `PILOT-FINDINGS.md` · `PLAN-SCRAPEO.md`
