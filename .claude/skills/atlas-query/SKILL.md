---
name: atlas-query
description: Query the UBA Atlas data — the node schema, the address scheme, coverage counts, sealed vs grounded, bibliographies. Use when the user asks what the atlas holds, how much is covered, or wants to find or inspect nodes.
---

# atlas-query — read the data

The data is flat files. No database, no server needed.

| File | What it holds |
|---|---|
| `nodes/<address>.json` | one drawn node per file, named by its address |
| `sources/uba.json` | ground truth: the 13 faculties and their real careers |
| `queue.json` | the job log — pending and done jobs with timestamps |
| `extract/out/*.txt` | extracted syllabus text (local only, gitignored) |

## The address scheme

Dotted path, one segment per level: `uba` → `uba.der` → `uba.der.abogacia` →
`uba.der.abogacia.comercial` → deeper units. The filename is the address.

## The node schema (the parts that matter)

- `address`, `level` (institución | facultad | carrera | programa | libros), `kind`
- `groundingLevel` — `L1` (from the plan) or `L2` (from the syllabus PDF: topics + books)
- `sealed` — true when there is no source; a sealed node has no children and no content
- `breadcrumb` — the path up, with labels
- `groups[].exits[]` — the children, each `{ address, name, role, kind }`. Exits are the only links; they come from real sources.
- `title`, `lede`, `frame`, `meta[]` — the rendered copy
- `source` — `{ label, url }`, the citation

## Recipes

```bash
# how many nodes, per branch
ls nodes | sed 's/\.json$//' | cut -d. -f1-2 | sort | uniq -c | sort -rn

# coverage by grounding level
cat nodes/*.json | grep -o '"groundingLevel": "L[0-9]"' | sort | uniq -c

# sealed nodes (honest gaps)
grep -l '"sealed": true' nodes/*.json

# every book reference in the atlas
grep -h '"kind": "book"' -A2 nodes/*.json | grep '"name"'

# one node, readable
cat nodes/uba.cbc.biosalud.biologia-celular.json | python3 -m json.tool
```

Trust rule: what a node says is recoverable from its `source`. If a claim is
not in the source, the claim is a bug — report it, do not patch around it.
