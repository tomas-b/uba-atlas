# 🔁 UBA Atlas — an agentic loop you can audit

**A multi-agent pipeline that researches the real Universidad de Buenos Aires,
writes a knowledge graph, and — the hard part — proves it didn't make anything up.**

**Live artifact: [uba-atlas.vercel.app](https://uba-atlas.vercel.app) · 605 nodes ·
5,958 addresses · every one traced to a real document**

The interesting problem is not scraping a university. It is that **LLMs
fabricate**, and at 5,000+ addresses no human can check them. So every wave of
generation runs against a wave of adversarial verification — agents whose only
job is to **refute** what the researchers wrote.

## ⚙️ The loop

```mermaid
flowchart TB
    S[🔎 Scout · Opus<br/>finds + verifies source PDFs<br/>rejects dead links, HTML, guesses] --> R
    subgraph R [🤖 N researchers, parallel · Opus]
        R1[extract PDF → text<br/>pdftotext / local OCR] --> R2[write node.json<br/>only what is literal in the text]
    end
    R --> V
    subgraph V [⚔️ N adversarial verifiers, parallel · Opus]
        V1[re-read source + node<br/>try to REFUTE every claim:<br/>units · books · codes · hours · prose]
    end
    V -->|verdicts| F[🔧 fix batch<br/>string-level edits, JSON-validated]
    F --> C[🧪 check-graph.js<br/>schema · addresses · no cross-links]
    C -->|green| G[📦 git commit<br/>one wave = one revert point]
    G --> D[🌐 build-site.js → static deploy<br/>zero endpoints, generation stays local]
    C -->|red| F
```

**Design choices that make it work:**

- 🚫 **Fail-hard, not fail-soft.** No source → no node. A gap renders as a
  sealed node, honestly. *"A confident render over missing source is a lie
  with good typography."*
- ⚔️ **Verifiers are adversaries, not reviewers.** Prompted to refute, they
  default to suspicion. Researcher and verifier never share context.
- 📜 **Contradictions are recorded, never resolved.** When the source PDF
  contradicts itself (same cover printing two years, two codes), the node
  carries both — resolving would be inventing.
- 🧪 **Deterministic gate before every commit.** `check-graph.js` validates
  graph invariants; a wave only merges green, and each wave is one
  `git revert` away.
- 📬 **Deliberate spend.** Browsing the graph is free; only an explicit job
  enqueues agent work.

## 🎯 What the loop catches (real, from the logs)

| wave | caught by adversarial verification |
|---|---|
| Medicina | a node describing **"siete"** práctico blocks — the source has 4. Pure prose fabrication, refuted line-by-line |
| Lingüística | a **fabricated resolution number** (Res. 2503/2019) — the PDF itself prints 2523/15; plus a virtual-modality decree misattributed as the programa's approval |
| Letras w2 | a bibliography role claiming *obligatoria* where the source says *complementaria*; "tres siglos" where the source spans four; silent spelling "corrections" of the original reverted |
| Clásicas w3 | a selection rule claiming a drawn volume was "the only one" — the verifier found 6 more qualifying volumes and a book the rule demanded but the researcher missed (drawn at wave close) |

**34 researchers + 34 verifiers over Letras alone. Verdicts: zero fabricated
units, zero fabricated books, ~70 precision fixes.** Every verdict is committed
in `verification/` — line-referenced refutation reports, one per node — and
`extract/manifest.json` records each source's URL and extraction method. The
loop's output isn't just data — it's data with an audit trail you can read.

## 📊 Scale so far

| | |
|---|---|
| faculties at L1 | **13 / 13** — every career, ~2,640 courses verified against official sources |
| Medicina at L2 | **38 / 44** courses with real topics + bibliography from syllabus PDFs |
| Letras at L2 | **34 / 62** — three full research+verify waves (incl. all of Letras Clásicas) |
| honest sealed nodes | **2** (no published source exists — so no node pretends) |
| fabrications shipped | **0** |

## 🛠️ Run it

```bash
node serve.js &          # local navigator + graph on :4137
node watch-queue.js &    # idle watcher: wakes the agent when a job lands
node build-site.js       # render nodes/ → site/ (the whole deploy)
```

Or open the repo in **Claude Code** and say *"run the atlas"* — the machine
ships its own operators as skills: `atlas-grounding` (how to source without
inventing), `atlas-run` (the runbook), `atlas-query` (how to read the data).

The deploy is **only the artifact**: static JSON, rendered. No endpoints, no
online generation.

---

MIT · Deep docs: `CONCEPT.md` · `PROJECT.md` · `PILOT-FINDINGS.md` · `PLAN-SCRAPEO.md`
