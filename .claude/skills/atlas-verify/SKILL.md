---
name: atlas-verify
description: Adversarially verify one UBA Atlas node — re-fetch the live source, prove the extract identical, re-derive every count, try to refute every claim, and emit a verdict JSON to verification/. Use when a wave reaches its verification stage, when auditing an existing node, or when a claim about a node is in doubt.
---

# atlas-verify — refute one node

You did not write this node. Your only job is to break it. A verifier that
"reviews" approves; a verifier that refutes finds the fabrication. Never share
context with whoever wrote the node.

## Method

1. **Source identity.** Re-fetch the live PDF from the node's `source.url`.
   Re-extract with the pipeline's own mode (`pdftotext -layout`) and compare
   against `extract/out/<name>.txt` by hash. Byte-identical or that is the
   finding.
2. **Re-derive, don't check.** Recount every number from the text with your own
   throwaway parsers: units, bibliography entries per block, exclusions,
   unifications, the drawn total. The node's arithmetic must reproduce exactly.
   Reconcile both directions: nothing excluded drawn, nothing volume-bearing
   dropped.
3. **Attack the contradictions register.** Every recorded contradiction must
   have BOTH sides literally printed where claimed, with line refs. A register
   that itself fabricates is the worst failure mode — it has happened once and
   was caught.
4. **Quotes verbatim.** Anything in guillemets must be printed. For any
   cross-document divergence claim (two covers, two editions), derive both
   sides with `pdftotext -layout` — default mode joins line breaks and eats
   hyphens, and has manufactured false divergences before.
5. **Absences.** Grep every claimed absence yourself. Verify claimed-empty
   fields are empty. If the node says "newest that exists", hunt for a newer
   one before accepting it (news pages, Drive folders, sibling departments).
6. **Alternates.** If the node declares a multi-cátedra selection, re-fetch the
   alternate covers and verify every asserted field.

## The verdict

Write nothing into the node. Emit one JSON (the orchestrator persists it to
`verification/<address>.json`):

```json
{
  "address": "...", "wave": "...", "date": "...", "verifier": "opus-adversarial",
  "source_reachable": true,
  "units_total": 0, "units_found": 0, "books_total": 0, "books_found": 0,
  "not_found": ["each refuted claim, with line refs and the repair"],
  "omitted":   ["real source content the node dropped undeclared"],
  "metadata_matches": true,
  "verdict": "clean | errors | fabrication",
  "notes": "what you attacked and what survived, with line refs"
}
```

Semantics: the verdict records the **pre-fix** state. Verdict + git history =
the audit trail. `verification/README.md` documents this; `/audit.html` on the
site renders all of it. A re-grounded node's verdict carries a `history` field
preserving what the earlier version's audit caught.

## Grading

- **clean** — every load-bearing claim survived.
- **errors** — defects found (prose, arithmetic, mislabels), each enumerated
  with its repair. Drawn content grounded.
- **fabrication** — invented units, books, quotes, sources, or false negatives
  ("no bibliography" when the source lists books; "no programa exists" when one
  does). Also the inverse: sealing the sourceable.
