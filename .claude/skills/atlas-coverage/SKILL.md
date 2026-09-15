---
name: atlas-coverage
description: Measure what the UBA Atlas is missing and propose the next wave — completion per faculty and career, L1 nodes without L2, sealed gaps, unverified nodes. Use when the user asks for % completion, what's missing, what to expand next, or when planning a wave.
---

# atlas-coverage — what's missing, what's next

Coverage is measurable because the ground truth is indexed: every career node
declares its real materia count, so absence is countable, not guessed.

## Measure

```bash
# careers: declared materias vs drawn L2 children (the honest completion %)
for c in $(grep -l '"kind": "career"' nodes/*.json); do
  addr=$(basename "$c" .json)
  total=$(python3 -c "import json;print(json.load(open('$c')).get('metadata',{}).get('materias','?'))")
  drawn=$(ls nodes/$addr.*.json 2>/dev/null | wc -l | tr -d ' ')
  echo "$addr  $drawn / $total"
done | sort -t/ -k1 -rn

# nodes without a verdict (generated before the loop, or wave not closed)
comm -23 <(ls nodes | sort) <(ls verification | sort) | grep -v '^uba.json'

# honest gaps: sealed nodes, with their declared reason
grep -l '"sealed": true' nodes/*.json

# L1 careers whose plan is sourced but no materia is drawn yet (next-wave candidates)
grep -l '"groundingLevel": "L1"' nodes/*.json
```

## Propose the next wave

Strategy is **deep-first and contiguous**, not scattered: finish the career in
progress, then complete its faculty, then move faculty by faculty. Scattered
coverage reads as demo confetti; contiguous coverage reads as a method.

Output of this skill when planning: an ordered list of wave candidates, each
with `career address · materias remaining · source situation` (known site,
known repo, or unscouted), sized so one wave closes something nameable
("Letras 62/62", not "37 assorted materias").

## Honesty rules for reporting coverage

- A sealed node counts as covered honestly, not as missing — the gap is the
  finding. Report "62 de 62 (2 selladas con causa)" not "60 de 62".
- Never report a % the chips don't back. If the README or a carrera chip
  disagrees with the recount, that is a bug to fix in the same breath.
- "100% verified" means every L2 course node has a file in `verification/` —
  check it, don't assert it.
