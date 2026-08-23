# CASA

**A map of the whole Universidad de Buenos Aires — every faculty, career, and
course — where each point traces down to a real source, or it does not exist.**

**The goal: a static site that indexes the full university, with a grounded
summary of every module. LLM agents write each node from real academic
documents. A node with no source does not get born.**

<!-- TODO: docs/graph.png — the graph surface; docs/node.gif — job → watcher → node -->

## The idea

Point at the real UBA and walk it. The whole institution in one screen. A
career as structure. A course as what it is: its topics and its reading list,
taken from the real programa PDF of the real cátedra. Every view is a **node**:
addressable by URL and generated on demand by an agent.

The target is full coverage: 13 faculties, ~90 careers, ~3,000 modules. Each
module gets a summary that a student can trust, with the source cited next to
it. Where no source exists, the map says so. It shows a sealed node instead of
a plausible guess.

> *"A node that is not backed by real material does not get born. Fail hard,
> never soft. A confident render over missing source is a lie with good
> typography — and it is the one failure that destroys trust in the whole
> map."* — the first law, [CONCEPT.md](CONCEPT.md)

## Numbers (the sourcing pilot)

- **5 careers** probed end to end: Filosofía, Medicina, Ing. Informática, Abogacía, Paleontología
- **11 agents**: one researcher plus one adversarial verifier per career, then synthesis
- **0 fabrications** survived verification, across ~437k tokens
- **446 grounded nodes** written so far, across 5 branches of the university
- **52 programa PDFs** turned into text, OCR included, by the `extract/` pipeline

The pilot's diagnosis: the limit is *extraction, not availability*. The plans
are public everywhere (L1). The course programs exist, but each faculty
publishes them differently — scans, Drive links, HTTP-only sites. That is a
tooling problem, and [PLAN-SCRAPEO.md](PLAN-SCRAPEO.md) is the plan to solve
it at full scale. Full findings: [PILOT-FINDINGS.md](PILOT-FINDINGS.md).

## The plan to full coverage

1. **Inventory.** One adapter per faculty finds the URL of every plan and every
   programa PDF. The output is a manifest — the real coverage map of the
   university, before any spend.
2. **Download.** A batch runner pulls every PDF and extracts its text, with a
   resumable ledger. Deterministic, zero tokens.
3. **Summarize.** One agent per extracted program writes the module node: a
   short summary, the topic list, and the bibliography — from the source text
   only. A module with no extracted program stays sealed.
4. **Publish.** A build step renders all nodes into a static site: one page per
   module, the graph as the index, hosted on GitHub Pages. No server.

Phases run per faculty, so the site fills in visibly: sealed frontier →
grounded interior.

## How it works today

- **`serve.js`** — local server on `:4137`. It serves the graph and the node cache (`nodes/*.json`, addressed as `uba.cbc.biosalud.biologia-celular`).
- **`queue.json`** — a queue of self-describing jobs, not clicks. Each job states what to source and how. Navigation is free. Only a deliberate *Index* or *Create* action queues work.
- **`watch-queue.js`** — an idle watcher. It sleeps until the queue changes, then hands the jobs to the agent. No polling.
- **`extract/`** — the stale-PDF → text pipeline: `pdftotext`, OCR fallback, Drive-link resolution. It rejects login pages instead of pretending. See [extract/README.md](extract/README.md).
- **`.claude/skills/casa-grounding/`** — the grounding method packaged as an agent skill, so fail-hard is a contract, not a choice.

A node renders only to the depth its source supports:

| Level | Sourced | The node renders |
|---|---|---|
| **L0** | a name in an index | a sealed leaf |
| **L1** | the plan de estudios | the career as structure |
| **L2** | the programa PDF: semester, topics, book references | the course as what it is |
| **L3** | the texts behind the references | the book as its own map |

## Run it

```bash
node serve.js &          # graph on http://localhost:4137/graph
node watch-queue.js &    # idle watcher — wakes the agent on a queued job
node extract/fetch-extract.js "<pdf-url>" <name>   # stale PDF → text
```

## Docs

- [CONCEPT.md](CONCEPT.md) — the laws, the node contract, the grounding ladder
- [PROJECT.md](PROJECT.md) — the full scope: navigator, art layer, installation
- [PILOT-FINDINGS.md](PILOT-FINDINGS.md) — the 11-agent pilot, measured
- [PLAN-SCRAPEO.md](PLAN-SCRAPEO.md) — the path to full coverage and the static site
- [ROADMAP.md](ROADMAP.md) — further out: per-module micro-videos, the art layer

## License

[MIT](LICENSE). The nodes summarize public UBA academic documents and cite
their sources. Raw extracted PDF text stays out of the repo.
