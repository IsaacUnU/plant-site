# El pipeline de contenido

> Última actualización: 2026-07-17.

Todo el contenido del sitio se genera con LLMs y se publica en producción **sin ninguna aprobación humana**. Entender esto es entender el proyecto: `content/` no es una carpeta que alguien edita, es la salida de un cron.

## Orquestación

`.github/workflows/pipeline.yml`, sobre `ubuntu-latest`, Node 22.

| Disparador | Cron | Qué hace |
|---|---|---|
| Diario | `0 9 * * *` | 1 planta EN + listicle + traducción ES |
| Semanal | `0 11 * * 1` | Además, pines de Pinterest |
| Manual | `workflow_dispatch` | Acepta `plant_name` y `rewrite_slug` |

Secuencia: generar EN → `sleep 65` (reset de TPM de Groq) → listicle → traducción ES → rewrite opcional → auditoría de duplicados (solo aviso) → Pinterest (lunes) → `git commit` + `git push` con `[skip ci]` → ping de sitemaps.

El push a `main` dispara el deploy de Vercel. **No hay puerta de aprobación en ningún punto.**

## Scripts principales

### `pipeline.js` (542 líneas) — plantas EN

1. Lee `plants-queue.json` (FIFO `{pending, completed}`). Sin señal de volumen de búsqueda ni de intención: la cola es ciega.
2. Guard anti-duplicados: escanea todos los `.md` comparando `commonName`.
3. Prompt (líneas 63-261): persona "Sarah Mitchell" (ver P0-1 en `03-hallazgos.md`), 3 tablas obligatorias, reglas anti-boilerplate, frontmatter con enums cerrados, mínimo 1800 palabras. Título elegido entre 7 plantillas por hash del nombre.
4. **Groq `llama-3.3-70b-versatile`**, `temperature: 0.7`, `max_tokens: 6000`. **Sin reintentos** (a diferencia de `pipeline-es.js`).
5. `validateContent()`: campos requeridos + enums.
6. Inyecta marcadores `<!-- plant-image: ... -->` para los scripts de imágenes.
7. Escribe `content/plants/{slug}.md`.
8. **Quality gate real**: ejecuta `validate-post.js` como subproceso. Si falla, **borra el archivo** y avanza la cola.
9. Invoca `fetch-images.js`.
10. Ping a IndexNow (**solo Bing/Yandex — no hay integración con Google**).

**Nunca hace `process.exit(1)`** (comentario explícito en línea 474) para que Actions jamás marque fallo. Consecuencia: los fallos reales son invisibles salvo que alguien lea los logs.

### `pipeline-es.js` (425 líneas) — español

- No usa cola normalmente: `findMissingEsPlant()` busca el primer slug EN sin contraparte ES.
- Doble proveedor: OpenRouter (`openai/gpt-oss-20b:free`) si la key empieza por `sk-or-`, si no Groq. **Con reintentos** y parseo de `retry-after`.
- Reutiliza la imagen del artículo EN homónimo — no busca imagen propia.
- **Sin `validate-post.js`**: solo validación interna de enums. Ni dedupe ni longitud mínima.

### `translate-all.js` — traducción batch

Traduce todo EN → ES. `BATCH_SIZE = 1`, `DELAY_BETWEEN_FILES_MS = 6000` (throttle manual para el tier gratuito). Único chequeo: que el YAML parsee.

### Imágenes

`fetch-images.js` (387 líneas) — cascada **Unsplash → iNaturalist → fal.ai (FLUX)**:
- Verificación por visión: Groq `llama-4-scout-17b-16e-instruct`, pregunta binaria "¿esta foto muestra esta planta?". Con backoff en 429.
- Dedupe global vía `used-photo-ids.json`.
- Atribución Unsplash correcta + `triggerDownload` (exigido por sus términos).
- Resultado: **URL remota hotlinkeada**, no descarga local. Excepto fal.ai, que sí guarda en `public/images/generated/`.

`fetch-article-images.js` — mismo patrón pero **sin verificación por visión** y sin fallbacks.
`fetch-additional-images.js` — hasta 3 imágenes extra por planta, solo URLs.

### Contenido programático

`generate-lists.js` (537 líneas): 21 temas predefinidos, cada uno con un `filter()` sobre el frontmatter (ej. `best-low-light-houseplants`). Título elegido **al azar** entre 6 patrones clickbait, número de plantas aleatorio 5-10. Sin `validate-post.js`.

`generate-howto.js` (376 líneas): 20 temas fijos ("How to Water Houseplants", "Why Are Plant Leaves Turning Yellow"...). Estructura obligada con FAQ de 5 pares. Sin `validate-post.js`.

### Auditoría

| Script | Qué hace | ¿Bloquea? |
|---|---|---|
| `validate-post.js` | 1200 palabras mín., 5 H2, 4 FAQ, dedupe Jaccard ≥0.50 | **Sí** (`exit(1)`) — pero solo lo llama `pipeline.js` |
| `audit-duplicates.js` | Duplicados por nombre científico, común y Jaccard 5-gramas ≥0.55 | **No** — `continue-on-error`, solo `::warning::` |
| `verify-images.js` | Re-verifica imágenes en disco con visión | Manual |
| `backdate-content.js` | Falsifica fechas de publicación | Ver P0-2 |

### Pinterest

`pinterest-pins.js`: API v5, `PINTEREST_ACCESS_TOKEN` + `PINTEREST_BOARD_ID`, estado en `pinterest-pinned.json`, 2 s entre pines. Usa `plant.image` (URL de Unsplash con query params) como `media_source.url` — depende de que esa URL sea estable indefinidamente.

## Deuda del pipeline

- Parser de `.env.local` copiado **7 veces**. `pingIndexNow()` idéntico en **4** archivos. `slugify()` en **3**. Prompts gigantes duplicados casi palabra por palabra entre `pipeline.js` y `rewrite-existing.js`.
- Reintentos reimplementados a mano y de forma distinta en cada script. Ninguna librería estándar.
- El rate limit de Groq en CI se resuelve con un `sleep 65` fijo, no con backoff por `Retry-After`.
- `rewrite-existing.js` deja `.bak` huérfanos si crashea a mitad.
- Scripts muertos: `fix-codeblock-wrapping.js` (parchea un modelo Ollama que ya no se usa), `fix-credentials.js` (borra con regex las credenciales falsas que el propio prompt provoca), `audit-check.js`, `final-audit.js` (checklist one-off de AdSense), `backdate-content.js`, `generate-pinterest-csv.js` (redundante con la API).
- `plants-queue.json` es una "base de datos" JSON versionada en git, sin locking. Un `workflow_dispatch` manual concurrente con el cron puede provocar carrera al hacer push.
- Cero tests sobre 25 scripts.

## Riesgo de cumplimiento (resumen)

El pipeline es técnicamente competente — la verificación de imágenes por visión y el dedupe Jaccard están por encima de la media de sitios generados. El problema no es la ingeniería, es el modelo editorial:

1. Generación masiva sin revisión humana, con push directo a producción.
2. Autoría y credenciales fabricadas, emitidas como dato estructurado.
3. Fechas de publicación falsificadas con el propósito declarado de ocultar el patrón a Google.
4. Auditoría de duplicados que nunca bloquea.
5. Listicles programáticos derivados mecánicamente de metadata.
6. Imágenes IA sin aviso al lector.
7. Datos de toxicidad para mascotas generados por LLM sin verificación factual — riesgo de daño real, no solo de ranking.

Los puntos 2 y 3 son los que convierten un riesgo de "contenido escalado" (gestionable) en uno de tergiversación deliberada (acción manual). Ver `03-hallazgos.md`.
