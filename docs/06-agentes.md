# Agentes de IA y método de trabajo

> Última actualización: 2026-07-17.

## Método obligatorio antes de tocar código

1. Entender el código afectado. Leerlo, no suponerlo.
2. Pensar el impacto — este sitio tiene 3.236 visitantes/mes reales y rutas indexadas. Un cambio de slug es un 404 en Google.
3. Explicar el razonamiento antes de actuar.
4. Hacer el cambio seguro más pequeño posible.
5. Verificar que no rompe nada (`npm run build` como mínimo; el build tarda 25 s, no hay excusa).
6. Actualizar `/docs`.

Nunca adivinar. Si algo no está claro, investigarlo. Durante esta auditoría, dos hipótesis plausibles resultaron falsas al verificarlas (los hreflang parecían faltar y sí estaban, en camelCase; las fechas parecían orgánicas y 74 de 165 estaban falsificadas). Verificar cambia las conclusiones.

## Reglas específicas de este repo

- **No editar `content/**/*.md` a mano**: lo sobrescribe el pipeline. Los cambios de contenido se hacen en los prompts de `scripts/`.
- **Todo cambio de UI se aplica dos veces**: `src/app/**` (EN) y `src/app/es/**` (ES). Hasta que se unifique el árbol, es la fuente principal de bugs.
- **Cuidado con las APIs dinámicas** (`headers()`, `cookies()`) en layouts: una sola llamada en el layout raíz desactiva la prerenderización de todo el sitio. Es exactamente lo que pasó (P0-3).
- **Cambiar un slug obliga a añadir un redirect 301** en `next.config.ts`. Ya hay 21.
- El pipeline hace push a `main` con `[skip ci]`. Contar con commits automáticos entrantes al trabajar sobre `main`.

## Roles de IA propuestos

No hace falta una orquesta. Con este tamaño de proyecto, cuatro roles cubren el trabajo real:

### 1. SEO Technical Auditor
**Responsabilidad**: robots, sitemap, canonicals, hreflang, schema, Core Web Vitals, Search Console.
**Cuándo**: antes de cada release que toque rutas o metadata; revisión mensual.
**Verifica de verdad**: no leer el código y suponer — pedir la URL de producción y comprobar cabeceras y HTML servido. Media auditoría de hoy salió de `Invoke-WebRequest`, no del código.

### 2. Content Compliance Reviewer
**Responsabilidad**: el rol más importante y el que hoy no existe. Revisar contenido generado contra las políticas de spam de Google y AdSense **antes** de publicar: autoría honesta, sin credenciales inventadas, sin fechas falseadas, exactitud factual de los datos de toxicidad (verificables contra ASPCA), divulgación de imágenes IA.
**Cuándo**: como paso bloqueante del pipeline, no como aviso.
**Por qué**: el riesgo dominante del negocio es de cumplimiento, no técnico.

### 3. Performance Engineer
**Responsabilidad**: estrategia de renderizado (estático/ISR), tamaño de payloads, imágenes, LCP/INP/CLS.
**Cuándo**: ante cualquier cambio en layouts, `middleware`, o componentes cliente.
**Métrica**: TTFB y `x-vercel-cache` en producción, no el score de Lighthouse en local.

### 4. Pipeline Maintainer
**Responsabilidad**: los 25 scripts, prompts, colas, rate limits, manejo de errores.
**Cuándo**: al cambiar generación, traducción o imágenes.
**Prioridad actual**: extraer `scripts/lib/` compartido, hacer que los fallos sean visibles en vez de silenciosos, y extender el quality gate a artículos y ES.

## Cómo colaboran

El orden importa y no es negociable:

```
Content Compliance Reviewer  → puerta de entrada. Si no pasa, no se publica.
Pipeline Maintainer          → implementa la puerta dentro del workflow.
SEO Technical Auditor        → verifica lo publicado contra producción real.
Performance Engineer         → interviene en cambios de renderizado.
```

Hoy el pipeline va al revés: genera, publica, y *después* audita sin bloquear. Invertir ese orden es el cambio estructural que más protege el negocio.

## Herramientas útiles verificadas en este repo

- `npm run build` — 25 s, detecta errores de TypeScript y **revela la estrategia de renderizado** (`ƒ` dinámico vs `●` SSG). Leer esa tabla en cada build.
- `Invoke-WebRequest` contra producción — cabeceras `x-vercel-cache`, `cache-control`, TTFB. Fue lo que destapó P0-3.
- `node scripts/audit-duplicates.js` — genera `audit-report.json`.
- `node scripts/validate-post.js <archivo>` — el quality gate real.
- `git log --diff-filter=A --format=%aI -1 -- <archivo>` — fecha real de creación de cada `.md`, necesaria para revertir el backdating (P0-2).
