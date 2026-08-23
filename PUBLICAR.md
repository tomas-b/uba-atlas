# PUBLICAR.md — auditoría + pasos para hacer UBA Atlas repo público

> Preparado 2026-08-23. Estado actual: **repo privado en github.com/tomas-b/uba-atlas**,
> pusheado. Hacerlo público es tu decisión — el comando exacto está al final.

## Auditoría de public-readiness

### Secretos y credenciales — ✅ limpio

- Barrido de `api_key / secret / token / password / bearer / sk- / AKIA / BEGIN PRIVATE KEY`
  sobre todo el árbol: **cero hallazgos reales**. Los únicos matches son texto académico en
  español ("secreto comercial" en un nodo de Abogacía, "Secretaría Académica", "~437k tokens").
- No hay `.env`, `.pem`, `.key`, ni archivos de credenciales.
- No hay emails ni paths personales (`/Users/tomb`) en ningún archivo publicable.
- `.claude/settings.local.json` solo contiene un permiso local trivial (`Bash(mkdir:*)`) —
  igual queda ignorado por convención.

### Tamaño — 7.7M total → **~2.1M publicado**

| Qué | Tamaño | Decisión |
|---|---|---|
| `extract/out/` (52 txt extraídos de PDFs de cátedras) | 5.6M | **ignorar** — regenerable con `fetch-extract.js`, y es texto de terceros (programas UBA); los nodos ya citan las URLs fuente |
| `nodes/` (446 JSON, el grafo grounded) | 2.0M | **publicar** — es el producto |
| `ml/` (notas personales de estudio de ML, ajenas a UBA Atlas) | 24K | **ignorar** — no es parte del proyecto |
| `.claude/skills/` (atlas-grounding, atlas-art-style) | ~16K | **publicar** — parte de la maquinaria, buen material de portfolio |
| Resto (serve.js, watch-queue.js, extract/*.js, HTML, docs, sources/) | ~100K | **publicar** |

- Sin `node_modules` (cero dependencias — punto a favor, mencionado implícito en el README).
- `queue.json` queda publicado: está limpio y muestra el formato de job auto-descriptivo en vivo.

### Lista de limpieza

Nada que **borrar** — todo lo sensible/pesado se resuelve por `.gitignore` (ya escrito):
`ml/`, `extract/out/`, `.claude/settings.local.json`, `.DS_Store`, `node_modules/`.

**Hecho:** los prototipos de fase 0 (`filosofia-occidental-uba.md`, `filosofia-world.html`,
`uba-navigator.html`) se movieron a `prototypes/` — `serve.js` no los referencia, el root
queda solo con la maquinaria actual.

## Layout del repo (como queda)

```
uba-atlas/
├── README.md              ← el pitch (nuevo)
├── LICENSE                ← MIT (nuevo)
├── ROADMAP.md             ← scraping fan-out + micro-videos (nuevo)
├── CONCEPT.md · PROJECT.md · PILOT-FINDINGS.md · RESEARCHING-PROGRAMS.md · CLAUDE.md
├── serve.js · watch-queue.js · queue.json
├── shell.html · graph.html
├── extract/               (fetch-extract.js + README; out/ ignorado)
├── nodes/                 (446 nodos grounded)
├── sources/uba.json       (ground truth: 13 facultades, carreras reales)
├── .claude/skills/        (atlas-grounding, atlas-art-style)
└── prototypes/            (fase 0: navegador PoC + snapshots de filosofía)
```

## Decisiones tomadas (y por qué, en una línea)

- **Licencia: MIT** — es la default para portfolio (máxima legibilidad para un
  reclutador, cero fricción), no hay dependencias ni código de terceros que fuerce otra.
- **README en inglés** — la audiencia de portfolio es internacional y los docs de fondo
  (CONCEPT, PROJECT, PILOT-FINDINGS) ya están en inglés; un README en español sería el
  único archivo fuera de idioma. ROADMAP.md y este archivo quedan en español (son para vos).
- **Contenido de terceros**: los nodos *resumen* documentos académicos públicos de la UBA
  y citan fuente (fair use claro); el texto crudo extraído (`extract/out/`) queda afuera.
- **Nombre: `uba-atlas`** (decidido). Dice qué es, busca bien; el nombre interno "CASA"
  quedó retirado del repo.

## Plan de screenshots / GIF (antes del push, recomendado)

El README tiene un `TODO(screenshots)` esperando esto:

1. `node serve.js` → abrir `http://localhost:4137/graph`.
2. **`docs/graph.png`** — el grafo con los tres estados de nodo visibles (created /
   to create / to index) en una rama poblada (CBC biosalud).
3. **`docs/node.gif`** — la secuencia completa: click en nodo `to create` → *generar* →
   el job aparece en la cola → watcher despierta → nodo dibujado. (~15s, es LA demo del
   sistema event-driven.)
4. Reemplazar el comentario TODO del README por las imágenes (`![graph](docs/graph.png)`).

## Hacerlo público — **un comando, lo corrés vos**

El repo ya existe privado y pusheado (`tomas-b/uba-atlas`). Cuando des el OK:

```bash
gh repo edit tomas-b/uba-atlas --visibility public --accept-visibility-change-consequences
```

Verificación previa (30 segundos, ya corrida pero re-chequeable):

```bash
git ls-files | grep -E "ml/|extract/out|settings.local" && echo "⚠️ LEAK" || echo "✅ limpio"
gh repo view tomas-b/uba-atlas --web   # mirar que el README renderice y no haya nada de más
```
