# ROADMAP — CASA

> Estado actual: piloto profundo (446 nodos por CBC, Derecho, Filosofía), ley fail-hard
> validada con 11 agentes / cero fabricación sobreviviente. Todo lo de abajo es **futuro**,
> ordenado por apalancamiento. Nada de esto está construido salvo que se diga lo contrario.

## 1 · Scraping fan-out — la universidad entera, por facultad

> Versión ejecutable, por fases y con checkpoints de gasto: **`PLAN-SCRAPEO.md`**.

El piloto probó que **L1 (plan de estudios) es sólido en toda la UBA** y que el bloqueo de
L2 es *extracción, no disponibilidad* (`PILOT-FINDINGS.md`). El siguiente paso es el
breakdown **por facultad**:

- **L1 fan-out (~90 carreras, 13 facultades)** — un researcher + verificador adversarial
  por carrera, el patrón ya probado en el piloto. Salida: toda carrera de la UBA como nodo
  grounded con sus materias listadas y lo no-sourceado sellado. Barato, honesto, sin infra nueva.
- **Adapters por facultad para L2** — cada facultad publica distinto (DSpace en Filo,
  scans EPSON en Medicina, Libro CPO en Derecho, sitios HTTP-only en Exactas). `extract/`
  ya resuelve OCR + Drive + HTTP-tolerante; falta un adapter de *descubrimiento* de PDFs
  por facultad para batchear: lista de programas → `fetch-extract.js` → un agente Stage-2
  por texto → nodos L2 en masa.
- **Coverage map como artefacto** — por carrera y materia, el nivel de grounding real
  (L1/L2/sellado). Es lo que le dice al engine hasta dónde puede dibujar (ley #1 a escala).
- **Horario semanal recurrente** (público en ~4/5 campos) → el feed "¿qué se enseña ahora
  en Ciudad Universitaria?".

## 2 · Micro-videos por módulo (estilo docubot)

Una capa de video sobre el grafo grounded: **un micro-video (~1 min) por módulo de cada
carrera** — la materia contada desde su propio esqueleto L2 (temas + bibliografía reales,
nunca inventados).

- **Framework**: Remotion (video programático en React) u otro framework de video-as-code;
  el nodo L2 es el guion — el video se genera del mismo JSON que el grafo renderiza, así
  la ley de grounding aplica también a los píxeles y al VO.
- **Pipeline** (hereda el patrón docubot): nodo L2 → guion (temas en orden, lecturas
  clave) → storyboard → render batch por carrera → QA contra el nodo fuente (¿todo lo
  dicho es recuperable del programa citado?). Fail-hard: módulo sin L2 = sin video.
- **Uso**: cada nodo materia embebe su micro-video; una carrera completa es una playlist
  de ~30 módulos; el feed "ahora" muestra el video de la materia que se está dictando.

## 3 · Capas ya declaradas en PROJECT.md (visión, no hechas)

- **Art layer** — DNA estético por materia extraído de sus libros reales; house style
  compartido; multi-modal (foto de catálogo / texturas de juego / text-to-3D).
- **HUD overlay** — el grafo entero creciendo: interior grounded vs frontera sellada.
- **Capa física (arduino)** — instalación ambiente atada al horario vivo.
- **El juego (north star)** — la casa de altos estudios 3D caminable; el navegador es su plano.
