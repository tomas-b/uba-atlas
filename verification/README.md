# verification/ — the audit trail

One JSON per verified node: the adversarial verifier's verdict **at verification
time, before fixes**. The wave-close commit that adds a verdict also applies the
fixes it demanded — so a `"verdict": "errors"` here plus the node's git history
IS the audit trail: what the verifier caught, and what changed because of it.

- `verdict`: `clean` (nothing refuted) · `errors` (defects found, fixed at wave
  close) · `fabrication` (a real invention was caught; the node was corrected or
  re-grounded the same wave — the verdict preserves what was caught).
- `books_found / books_total`, `units_found / units_total`: refutation coverage.
- `notes`: the verifier's line-referenced findings against the extracted source.
- `wave` / `date`: which research+verify wave produced the verdict.

Sources verified against live in `extract/out/` (local only, not committed —
the programa texts stay out of the repo; see `extract/manifest.json` for each
extract's URL, method and size). Tooling: `tools/mine-transcripts.js` can
recover verdicts and extract provenance from session transcripts.
