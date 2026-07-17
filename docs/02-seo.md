# Estrategia SEO — estado real

> Última actualización: 2026-07-17. Todo verificado contra producción, no solo contra el código.

## Situación

- 3.236 visitantes / 6.080 páginas vistas en 30 días. Rebote 56%.
- Referrers: google.com 3.1K, duckduckgo 23, bing 19, ecosia 5. **El sitio es Google o no es nada.**
- Páginas top: `/plants/venus-flytrap` (1.7K), `/es/plants/golden-pothos` (566), `/plants/euphorbia-trigona` (426), `/plants/passiflora-caerulea` (188), `/plants/cereus-peruvianus` (160).
- ~700 URLs en el sitemap; 404 documentos de contenido.

Dato revelador: `venus-flytrap` concentra el 53% del tráfico. No es una audiencia distribuida entre 404 páginas — es una página que funciona y 403 que casi no. El problema no es producir más, es que lo producido no rankea.

## Qué está bien implementado

| Elemento | Estado |
|---|---|
| Canonical | Correcto en todas las páginas |
| hreflang | Correcto (`en`, `es`, `x-default`). Se emite como `hrefLang` camelCase — HTML válido, Google lo lee bien |
| Sitemap dinámico | `src/app/sitemap.ts`, ~700 URLs con `lastModified` real desde el frontmatter |
| Redirects 301 | 21 en `next.config.ts`: www→apex y slugs duplicados |
| Metadata | Títulos con plantilla, descripciones, OpenGraph, Twitter Card, imágenes OG por planta (`opengraph-image.tsx`) |
| JSON-LD | Article, BreadcrumbList, WebSite+SearchAction correctos |
| `/search` | `noindex` correcto |
| IndexNow | Ping automático tras generar |

## Qué está roto

### Bloqueo de imágenes a Googlebot
`robots.ts` emite `Disallow: /_next/`, y **todas** las imágenes se sirven por `/_next/image?url=...`. Googlebot no puede rastrear ni una sola imagen del sitio, ni el CSS/JS de `/_next/static/`. Para un nicho visual como plantas, esto elimina Google Images como canal. Es una línea de código. Ver P0-4.

### Core Web Vitals: TTFB de 1,9 s
Ninguna página se cachea. `cache-control: private, no-cache, no-store` y `x-vercel-cache: MISS` en cada petición. La página con más tráfico tarda 1,9 s en el primer byte, renderizada en EE. UU. para un visitante europeo. Ver P0-3.

### Schema muerto
`HowTo` y `FAQPage` ya no generan rich results (Google retiró HowTo en 2023 y limitó FAQ a gobierno/salud). El `HowTo` además es una plantilla genérica idéntica para cualquier planta — texto rellenado con el nombre. Peso muerto en cada página.

### Enlazado interno plano
Las 165 fichas de planta no tienen enlaces internos en el markdown. `autoLinkPlantNames()` los inyecta en render pero solo entre plantas: nunca hacia artículos, categorías ni `/uses`. No hay clusters temáticos ni distribución de autoridad. Ver P1-C-5.

### Sin señal de búsqueda en la producción de contenido
`plants-queue.json` es una cola FIFO ciega. No hay investigación de keywords, ni volumen, ni intención, ni análisis de dificultad. Se genera "la siguiente de la lista". Que `venus-flytrap` funcione parece suerte, no estrategia.

### hreflang a 404
8 URLs (`schefflera-actinophylla` + 7 artículos) declaran una versión ES que no existe.

### Redirección automática por idioma
`middleware.ts` redirige a `/es` según `Accept-Language`. Google desaconseja esta práctica: puede impedir el rastreo correcto de una de las versiones.

## Estrategia recomendada

**Fase 1 — Dejar de sabotearse** (ver Ola 1 del roadmap): desbloquear `/_next/`, hacer el sitio estático, quitar el schema muerto. Nada de esto requiere contenido nuevo y todo mejora lo que ya rankea.

**Fase 2 — Consolidar autoridad**: arreglar los datos de toxicidad (P0-0), resolver la autoría (P0-1), fechas reales (P0-2). Sin esto, cualquier inversión en contenido se construye sobre arena.

**Fase 3 — Explotar lo que funciona**: `venus-flytrap` demuestra que hay demanda. Analizar en Search Console **por qué** rankea y construir un cluster a su alrededor (plantas carnívoras: sundew, pitcher plant, butterwort...) con enlazado interno real entre ellas. Es más rentable que 165 fichas dispersas.

**Fase 4 — Producir con criterio**: alimentar `plants-queue.json` con investigación de keywords real. Priorizar por volumen × intención ÷ dificultad, no por orden alfabético.

## Cómo medir

- Search Console: impresiones, CTR, posición media, cobertura, errores de hreflang.
- CrUX / PageSpeed para CWV de campo (no Lighthouse local).
- Producción directa: `x-vercel-cache` debe pasar de `MISS` a `HIT`. Es la métrica de que P0-3 está resuelto.
