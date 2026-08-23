# PLAN-SCRAPEO — bajarse toda la UBA → sitio estático con resumen por módulo

> El objetivo final: **un sitio estático donde está indexada toda la universidad, y cada
> módulo (materia) tiene un buen resumen** — grounded, con fuente citada, sellado donde
> no hay fuente. Este plan convierte eso en fases con salidas verificables.
>
> Principio rector (del piloto): el bloqueo es **extracción, no disponibilidad**. Y la
> arquitectura: **separar lo determinístico (scrapear/bajar/OCR — barato, resumible) de
> lo LLM (resumir — caro, fail-hard)**, conectados por un manifiesto en disco.

## Los números base

- 13 facultades · ~90 carreras de grado (ya en `sources/uba.json`)
- ~25–40 materias por carrera → **~2.500–3.000 módulos** en total
- Piloto: L1 (plan) público en todas partes; L2 (programa PDF) existe pero cada facultad
  lo publica distinto (DSpace, Drive, scans, sitios HTTP-only). `extract/fetch-extract.js`
  ya resuelve la lectura; falta el **descubrimiento** de URLs por facultad.

---

## Fase A — Inventario (el manifiesto; scraping de descubrimiento)

**Qué:** por facultad, un adapter que recorre el sitio y produce el manifiesto de URLs:
para cada carrera → URL del plan de estudios; para cada materia → URL(s) del programa PDF.

**Salida:** `sources/inventory/<facultad>.json`:

```json
{ "carrera": "filosofia", "materia": "metafisica",
  "plan_url": "...", "programa_urls": ["..."],
  "status": "found | not-published | login-gated", "checked": "2026-08-…" }
```

- 13 adapters chicos (uno por facultad — cada una publica distinto; algunos triviales,
  DSpace/Drive ya tienen manejo en `extract/`). Mezcla de scraping determinístico
  (fetch + parseo de listados) y agente donde el sitio es caótico.
- **El inventario ES el coverage map** en su primera forma: antes de bajar un solo PDF
  ya sabés qué % de la universidad es alcanzable a L2, por facultad — y eso dimensiona
  la Fase C antes de gastar en ella.
- Honesto por diseño: `not-published` y `login-gated` quedan registrados, no se inventan.

**Costo:** casi todo determinístico; agente solo para descubrir estructura de sitios
raros. Días de trabajo, tokens marginales.

## Fase B — Descarga masiva (bajarse todo)

**Qué:** batchear `extract/fetch-extract.js` sobre todo el manifiesto.

- Un runner (`extract/batch-fetch.js`) que lee `sources/inventory/*.json`, baja cada PDF,
  extrae texto (pdftotext / OCR fallback), y escribe un **ledger** por entrada:
  `fetched | ocr | failed(reason)` con chars extraídos. Resumible: re-correrlo solo
  reintenta los failed.
- Rate-limit cortés (son sitios de facultades), y cache: nunca re-bajar lo ya bajado.
- **Salida:** `extract/out/**` completo + `extract/ledger.json`. Cero LLM en esta fase.

**Costo:** tiempo de máquina y disco (quizás ~100–300M de texto). Tokens: cero.

## Fase C — Resumen por módulo (la capa LLM, fail-hard)

**Qué:** un agente Stage-2 por texto extraído → el nodo L2 **+ el buen resumen**:

- Esquema por materia: `{ cuatrimestre, resumen (2–3 párrafos: qué es esta materia, qué
  pregunta responde, cómo se recorre), topics[], bibliography[], source_urls, level }`.
- El resumen sale **solo del texto del programa** — ley #3 (the word matches the ground).
  Materia sin programa extraído = nodo L1 sellado con su plan, sin resumen inventado.
- Verificación por muestreo: un verificador adversarial por facultad revisa una muestra
  de resúmenes contra el texto fuente (el patrón del piloto, a costo de muestra, no de censo).

**Costo (la fase cara — estimar con el inventario de Fase A, no antes):** a ~15–25k
tokens por materia, 2.500 materias ≈ **40–60M tokens**. Se corre **por facultad** (13
tandas), cada tanda es un checkpoint: se publica el sitio con lo que hay, lo demás sellado.

## Fase D — El sitio estático

**Qué:** `build-site.js` — un build step que lee `nodes/*.json` + `sources/` y emite `site/`:

- **Una página por nodo** en URL limpia (`/uba/exactas/computacion/algoritmos-1/`) con el
  resumen, temas, bibliografía, fuente citada y nivel de grounding visible. Los sellados
  renderizan honestos (`NOT INDEXED` / "sin fuente aún").
- **El grafo como índice**: `graph.html` adaptado a estático — en vez de pegarle a
  `serve.js`, lee un `nodes-index.json` empaquetado en el build. Navegar es gratis
  (ya no hay agente detrás; el sitio es solo-lectura del grafo grounded).
- **Hosting: GitHub Pages** del mismo repo (branch `gh-pages` o `/docs`). Cero servidor,
  cero costo, y el repo-portfolio y el sitio son la misma cosa.
- SEO gratis: ~3.000 páginas estáticas de materias reales de la UBA con fuentes citadas.

**Costo:** un script de build + un template. Tokens: cero (renderiza lo ya grounded).

---

## Orden y checkpoints (no es todo-o-nada)

1. **A completa** (13 inventarios) → ya tenés el mapa real de cobertura de la UBA. ~días.
2. **B completa** (todo bajado + ledger) → el corpus entero en disco. ~días, cero tokens.
3. **D antes que C**: armar el sitio estático **ya**, con los 446 nodos actuales — el
   pipeline de publicación queda probado de punta a punta con contenido real.
4. **C por facultad**, 13 tandas con go explícito cada una (control de gasto). Cada tanda
   termina en un rebuild del sitio: la universidad se va llenando visiblemente, sellado →
   grounded, exactamente el HUD que describe CONCEPT.md.

## Qué cambia respecto de lo ya preparado

- `PUBLICAR.md` sigue válido (el repo se puede publicar cuando quieras); este plan agrega
  el camino para que el repo tenga **sitio vivo** y cobertura total.
- `.gitignore` hoy ignora `extract/out/` — sigue bien: lo que se publica es el **nodo
  resumido con cita**, no el texto crudo de terceros. El corpus queda local + ledger versionado.
- `ROADMAP.md` §1 (fan-out) queda subsumido por este plan, que es su versión ejecutable.
