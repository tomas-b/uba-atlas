# verification/ — the audit trail

One JSON per verified node: the adversarial verifier's verdict **at verification
time, before fixes**. The wave-close commit that adds a verdict also applies the
fixes it demanded — so a `"verdict": "errors"` here plus the node's git history
IS the audit trail: what the verifier caught, and what changed because of it.

- `verdict`: `clean` (nothing refuted) · `errors` (defects found, fixed at wave
  close) · `fabrication` (a real invention was caught — the historic ones, e.g.
  Medicina's oftalmología "siete" prácticos, are preserved as found).
- `books_found / books_total`, `units_found / units_total`: refutation coverage.
- `notes`: the verifier's line-referenced findings against the extracted source.
- `recovered: true`: mined back out of session transcripts by
  `tools/mine-transcripts.js` (waves that ran before this directory existed).

Sources verified against live in `extract/out/` (local only, not committed —
the programa texts stay out of the repo; see `extract/manifest.json` for each
extract's URL, method and size).
