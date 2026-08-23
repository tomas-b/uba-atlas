# extract — stale-PDF → L2 class skeleton

Solves the pilot's bottleneck: cited-but-unread programa/planificación PDFs become
machine-readable text, then an L2 class skeleton (cuatrimestre + topics + book references).

## Stage 1 — fetch + text (deterministic)

```bash
node fetch-extract.js "<pdf-url>" <outName> [--ocr-pages N]
```

Handles every gap the pilot hit:
- **HTTP-tolerant** (does not force HTTPS) + follows redirects → fixes the Paleontología ECONNREFUSED.
- **Google-Drive share links** → direct download → fixes the Filosofía oferta-horaria Drive PDFs.
- **pdftotext -layout** for text PDFs; **OCR fallback** (pdftoppm → tesseract `spa+eng`) for scans → fixes Medicina's un-OCR'd EPSON programas.
- Rejects HTML/login pages (non-`%PDF`) instead of pretending — fail-hard.
- OCR runs with `--psm 1` (orientation detection). Without it, landscape scans (e.g. fmed's
  Anatomía programa, 52 pp) come out mirrored — found during the Anatomía L2 end-to-end test.

Writes `out/<outName>.txt`, prints a JSON status (`method: text|ocr`, chars, truncated).

## Stage 2 — text → skeleton (LLM, grounded)

An agent reads `out/<name>.txt` and returns the L2 skeleton **from the text only** (fail-hard,
no invention): `{ cuatrimestre|régimen, topics[], bibliography[{title, author, edition}] }`.
Book **references** land in the class node (L2); book **contents** are a separate index (L3).

## Proven

- Text path: `06-Fisiologia y Biofisica.pdf` (24pp, text) → 74k chars → node
  `uba.med.medicina.fisiologia` with 10 topic-systems + 8 verified book references.
- OCR path: `01-Anatomia.pdf` (52pp scan, 52 bytes of text layer) → readable Spanish via OCR.

## To scale

Batch `fetch-extract.js` over a career's programa-PDF list (from the L1 plan), then one
Stage-2 agent per text. Output: L2 nodes across the career. This is what turns the university
from L1 names into real classes.
