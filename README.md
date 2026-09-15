# 🔁 UBA Atlas — an agentic loop you can audit

**A multi-agent pipeline that researches the real Universidad de Buenos Aires,
writes a knowledge graph, and — the hard part — proves it didn't make anything up.**

**Live: [uba-atlas.vercel.app](https://uba-atlas.vercel.app) · 654 nodes ·
8,560 addresses · 364 adversarial verdicts · 0 fabrications shipped**

The interesting problem is not scraping a university. It is that **LLMs
fabricate**, and at 8,000+ addresses no human can check them. The answer here
is not a better prompt — it is a topology: generation and audit never share
context, and a script without an LLM gates every commit.

## ⚙️ Flow

```
🌳 uba → career (official plan) → course (cátedra syllabus) → book (leaf)
   no source → sealed node · one wave = one career = one commit
```

The atlas is a tree. It grows one level at a time. Each level has one source
of truth. An adversary attacks every new leaf before it ships.

| 🔍 hunt | ✍️ write ×N | ⚔️ attack ×N | 🚦 gate | 🚢 ship |
|---|---|---|---|---|
| <sub>find the real source. The search is the work.</sub> | <sub>1 agent per course. Only what is literal.</sub> | <sub>1 adversary per node. Re-fetch, hash, recount.</sub> | <sub>a script, no LLM. Red = no commit.</sub> | <sub>nodes + verdicts. One commit.</sub> |

Writers and adversaries never share context. The adversary downloads the
document again and counts everything again. The two derivations must agree.

> **Nodes are files. Errors are line-referenced sentences. Fixes are edits
> re-derived from the same text. The verdict + the git diff is the proof.**

Real cases: see [Catches](#-catches).

## 🌍 The sources

There is no "UBA API". These are real sources behind nodes of the graph:

<table>
<tr><td width="170"><img src="docs/sources/01-drupal-pdf.webp" width="160" alt="📄 Drupal PDF"></td><td><b>📄 Drupal PDF</b><br><sub>literal <code>[brackets]</code> and NFD accents that 404 when normalized → <code>curl -g</code>, URL byte for byte</sub></td></tr>
<tr><td width="170"><img src="docs/sources/02-drive-folder.webp" width="160" alt="📁 Google Drive folder"></td><td><b>📁 Google Drive folder</b><br><sub>current programas live here; the site's search doesn't index it → grep the folder HTML for file ids</sub></td></tr>
<tr><td width="170"><img src="docs/sources/03-dspace.webp" width="160" alt="🏛️ DSpace repository"></td><td><b>🏛️ DSpace repository</b><br><sub>REST API, bitstreams by UUID → verified against the repo's own published MD5</sub></td></tr>
<tr><td width="170"><img src="docs/sources/04-fmed-scan.webp" width="160" alt="🖨️ Stamped 2014 scan"></td><td><b>🖨️ Stamped 2014 scan</b><br><sub>corrupt text layer that "parses" garbage → detected, OCR fallback (<code>tesseract</code>)</sub></td></tr>
<tr><td width="170"><img src="docs/sources/05-fmed-html.webp" width="160" alt="🌐 HTML-only source"></td><td><b>🌐 HTML-only source</b><br><sub>the current guide exists only as a webpage → snapshotted, method <code>html</code> in the manifest</sub></td></tr>
<tr><td width="170"><img src="docs/sources/06-derecho-pdf.webp" width="160" alt="⚖️ Texto ordenado grid"></td><td><b>⚖️ Texto ordenado grid</b><br><sub>1,281 course sections → the adversary wrote a parser to reproduce every count</sub></td></tr>
<tr><td width="170"><img src="docs/sources/07-sanscrito-scan.webp" width="160" alt="🕰️ Degraded 2017 scan"></td><td><b>🕰️ Degraded 2017 scan</b><br><sub>the newest that exists anywhere → used with its year declared on the node</sub></td></tr>
<tr><td width="170"><img src="docs/sources/08-resolucion-if.webp" width="160" alt="📜 76-page resolution"></td><td><b>📜 76-page resolution</b><br><sub>holding one equivalence table → pages 70-76 extracted, the rest cited</sub></td></tr>
<tr><td width="170"><img src="docs/sources/09-plan-1985.webp" width="160" alt="🗺️ The official plan"></td><td><b>🗺️ The official plan</b><br><sub>the L1 skeleton: the real courses → drawn before touching any cátedra</sub></td></tr>
</table>

Zero per-site connectors were written. Each agent has a terminal (`curl`,
`pdftotext`, `tesseract`, throwaway parsers) and solves its source on the spot.

## 🧩 The skill

One skill, plain markdown, four role docs:

```
.claude/skills/atlas/
├── SKILL.md         ← the mental model above + role router
├── wave.md    🌊    ← expand a career: launch everything, close as 1 commit
├── grounding.md ✍️  ← research one course: only what's literal, all counted
├── verify.md  ⚔️    ← attack one node: refute, don't review
└── ops.md     📊    ← coverage · queries · build & deploy
```

Open the repo in **Claude Code** and say *"expandí Edición"* — the session
routes to the skill, shows the plan and the cost, and waits for your OK.
Every agent announces its role on start (🌊 ✍️ ⚔️ 📊): a wave's transcript
reads like a cast list.

## 📊 Scale

| | |
|---|---|
| faculties at L1 | **13 / 13** — every career, ~2,640 courses verified against official sources |
| Medicina at L2 | **43 / 44** — incl. the 6 rotations of the Internado Anual Rotatorio (the 44th is honestly L1: no program is published) |
| Letras at L2 | **62 / 62 — complete** — five research+verify waves |
| Historia at L2 | **21 / 38** — the whole Ciclo de Grado; ~3,700 bibliography entries counted both ways |
| Computación at L2 | **18 / 20** courses + all **91 unit nodes** verified; PSE and Tesis honestly L1 |
| Abogacía indexed | CPC + all **8 CPO orientation nodes**, literal from the texto ordenado |
| L2 courses verified | **100%** — every course node carries an adversarial verdict |
| fabrications shipped | **0** |

## 🎯 Catches

| wave | caught by adversarial verification |
|---|---|
| Medicina | a node describing **"siete"** práctico blocks — the source has 4. Pure prose fabrication, refuted line-by-line |
| Lingüística | a **fabricated resolution number** (Res. 2503/2019) — the PDF itself prints 2523/15 |
| Clásicas w3 | a selection rule claiming a drawn volume was "the only one" — the verifier found 6 more qualifying volumes |
| Letras w4 | **the loop refuted its own orchestrator**: a node sealed as "no programa exists" was overturned by an absence-verifier that found 3 real programas |
| Full re-verify | retroactive sweep over every pre-loop node: **13 fabrications caught** — a student repo passed off as a cátedra programa, an apunte authored from instructor names, a chronologically impossible correlativa — every one re-grounded or removed |
| Letras w5 | a **contradictions register that itself fabricated**: the node's ledger of in-PDF contradictions invented one mention and inverted another |
| Abogacía CPO | all 8 orientation nodes verified by **reproducing every snapshot count exactly** (638 course codes, 1,281 comisiones re-counted from the raw grid) |
| Historia w1 | **the loop refuted its own scout — twice**: a "newest that exists" 2017 programa fell to the current 2026 one, hiding in a Drive folder the career site's search never indexes |
| Historia w1 | a whole **class of false divergences unmasked**: five nodes quoted "literal" cover text containing a pdftotext de-hyphenation artifact — every verifier re-extracted and proved the covers identical |
| Computación | the whole subtree (**111 nodes, unit level included**) adversarially verified in one wave; 3 fabrications caught, incl. a gloss the plan never printed |

Every verdict is committed in `verification/` — line-referenced refutation
reports, one per node — and `extract/manifest.json` records each source's URL
and extraction method. The audit trail ships with the artifact: every verified
node on the live site carries its *Verificación adversarial* panel.

## 🛠️ Run it

```bash
node serve.js &          # local navigator + graph on :4137
node build-site.js       # render nodes/ + verification/ → site/ (the whole deploy)
node check-graph.js      # the gate
```

The deploy is **only the artifact**: static JSON, rendered. No endpoints, no
online generation.

---

MIT · Deep docs: `CONCEPT.md` · `PROJECT.md` · `PILOT-FINDINGS.md` · `SOURCE-MAP.md`
