# Arquitectura — PlantCareCentral

> Última actualización: 2026-07-17. Mantener este documento al día ante cualquier cambio estructural.

## Qué es este proyecto

Sitio de contenido evergreen sobre cuidado de plantas de interior, bilingüe (EN/ES), monetizado con Google AdSense. El contenido se genera de forma automática mediante LLMs y se publica sin intervención humana.

- **Repositorio**: https://github.com/IsaacUnU/plant-site
- **Producción**: https://plantcarecentral.com
- **Hosting**: Vercel (proyecto `plant-site`, cuenta `iaproto25-3897`, plan Hobby)
- **Tráfico actual** (30 días, Vercel Analytics): 3.236 visitantes, 6.080 páginas vistas, 56% rebote. ~96% del tráfico llega desde google.com.

## Stack

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js App Router | 16.2.3 |
| Runtime UI | React | 19.2.4 |
| Lenguaje | TypeScript (strict) | 5.x |
| Estilos | Tailwind CSS (config en CSS, sin `tailwind.config.ts`) | 4.x |
| Contenido | Markdown + frontmatter YAML (`gray-matter`, `remark`) | — |
| Búsqueda | Fuse.js (cliente) | 7.x |
| Iconos | lucide-react | 1.x |
| Formularios | @formspree/react | 3.x |
| Analítica | Vercel Analytics + Google Tag Manager + Microsoft Clarity | — |
| Ads | Google AdSense (`ca-pub-7863265866651285`) | — |

**No hay**: base de datos, CMS, autenticación, API routes, tests, ESLint, `vercel.json`, LICENSE.

El "CMS" es el sistema de archivos: `content/**/*.md` versionado en git. La "base de datos" son colas JSON (`scripts/plants-queue.json`).

## Estructura de carpetas

```
plant-site/
├─ .github/workflows/pipeline.yml   # Cron de generación de contenido
├─ content/                         # Fuente de verdad del contenido
│  ├─ plants/      (165 .md)        # Guías de plantas EN
│  ├─ articles/    (41 .md)         # Listicles + how-to EN
│  └─ es/
│     ├─ plants/   (164 .md)
│     └─ articles/ (34 .md)
├─ public/
│  ├─ images/logo/                  # Único contenido de imagen local
│  ├─ images/plants/                # VACÍO (solo .gitkeep) — ver "Imágenes"
│  ├─ ads.txt
│  └─ og-image.png
├─ scripts/            (25 .js)     # Pipeline de contenido — ver 04-pipeline.md
└─ src/
   ├─ middleware.ts                 # Redirección por idioma + header x-pathname
   ├─ app/                          # Rutas (duplicadas: raíz = EN, /es = ES)
   ├─ components/     (19 .tsx)
   ├─ lib/            (6 .ts)       # plants, articles, schema, seo, utils
   └─ types/
```

## Archivos importantes

| Archivo | Rol |
|---|---|
| `src/app/layout.tsx` | Layout raíz. Fuentes, metadata global, scripts de analítica, schema WebSite. **Llama a `headers()` → fuerza render dinámico en todo el sitio.** |
| `src/middleware.ts` | Inyecta header `x-pathname`; redirige a `/es` según cookie `lang` o `Accept-Language`. Convención `middleware` deprecada en Next 16 (avisa: usar `proxy`). |
| `src/lib/plants.ts` | Lee y parsea markdown de plantas, deriva términos de búsqueda, extrae FAQs, autolinkea nombres de plantas. |
| `src/lib/schema.ts` | Generadores JSON-LD: Article, WebSite, BreadcrumbList, FAQPage, HowTo. Contiene la autoría hardcodeada. |
| `src/lib/seo.ts` | `buildAlternates()` — canonical + hreflang. |
| `src/app/sitemap.ts` | Sitemap dinámico (~700 URLs). Sin anotaciones hreflang. |
| `src/app/robots.ts` | robots.txt. **Bloquea `/_next/`.** |
| `next.config.ts` | Dominios de imagen remota + 21 redirects 301 (www→apex, slugs duplicados). |
| `src/components/ConsentScripts.tsx` | Consent Mode v2; carga GTM y AdSense solo tras aceptar cookies. |
| `AGENTS.md` | Guía para agentes de IA. `CLAUDE.md` solo hace `@AGENTS.md`. |

## Rutas

Internacionalización **manual por duplicación de árbol**, no con el i18n nativo de Next.

```
/                       /es
/plants                 /es/plants
/plants/[slug]          /es/plants/[slug]
/articles               /es/articles
/articles/[slug]        /es/articles/[slug]
/category/[slug]        /es/category/[slug]
/uses                   /es/uses            # "funciones secundarias" (purificar aire, etc.)
/uses/[slug]            /es/uses/[slug]
/search                 /es/search          # noindex
/about /contact /privacy-policy /terms  + equivalentes /es
```

Cada página EN existe dos veces en código. Un cambio de UI hay que aplicarlo en ambos árboles — fuente principal de deriva entre idiomas.

## Flujo de datos

**Generación (asíncrona, cron):**
```
GitHub Actions (cron 09:00 UTC)
  → scripts/pipeline.js      → Groq llama-3.3-70b-versatile → content/plants/{slug}.md
  → scripts/validate-post.js → quality gate (borra el .md si falla)
  → scripts/fetch-images.js  → Unsplash → iNaturalist → fal.ai (FLUX)
  → scripts/generate-lists.js→ listicles programáticos
  → scripts/pipeline-es.js   → traducción ES
  → git commit + push        → Vercel detecta push → build → deploy
  → ping IndexNow (Bing/Yandex) + ping sitemap
```

**Lectura (por petición):**
```
Petición → middleware (x-pathname, redirect idioma)
  → layout.tsx: headers() → RENDER DINÁMICO
  → page.tsx: lee .md de disco (fs)
  → remark → HTML → autoLinkPlantNames() (recorre las 165 plantas)
  → JSON-LD + HTML → sin caché CDN
```

## Despliegue

Vercel conectado al repo. Push a `main` → build → producción. Sin `vercel.json`: todo son valores por defecto. Sin staging, sin preview gates, sin tests en CI. El pipeline hace push directo a `main` con `[skip ci]`.

Build local verificado: **exitoso, 25s**, 621 páginas procesadas, sin errores de TypeScript.

## Configuración de entorno

Variables en Vercel (2 configuradas según panel) y en `.env.local` para desarrollo:

| Variable | Uso | Dónde |
|---|---|---|
| `GROQ_API_KEY` | Generación de contenido e imágenes (visión) | GitHub Secrets |
| `OPENROUTER_API_KEY` | Traducción ES (fallback a Groq) | GitHub Secrets |
| `UNSPLASH_ACCESS_KEY` | Búsqueda de imágenes | GitHub Secrets |
| `INDEXNOW_KEY` | Ping a Bing/Yandex | GitHub Secrets |
| `PINTEREST_ACCESS_TOKEN` / `PINTEREST_BOARD_ID` | Pines semanales | GitHub Secrets |
| `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_SITE_NAME` | Canonicals, schema | Vercel |
| `NEXT_PUBLIC_GTM_ID` | GTM (default hardcodeado `GTM-KV3PNKPG`) | Vercel |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | AdSense (default hardcodeado) | Vercel |
| `NEXT_PUBLIC_AD_SLOT_BANNER` / `_SIDEBAR` / `_INCONTENT` / `_FOOTER` | IDs de bloques AdSense | Vercel — **sin definir: los `AdSlot` no renderizan nada** |

`.env.local` está correctamente en `.gitignore`. No se detectaron secretos reales commiteados. Los IDs hardcodeados (publisher AdSense, GTM, Clarity) son públicos por naturaleza; es deuda de configuración, no fuga de seguridad.

## Imágenes

`public/images/plants/` está **vacío**. Todas las fotos de plantas son **hotlink** a URLs remotas, servidas a través del optimizador de Vercel (`/_next/image?url=...`):

- **Unsplash** (fuente principal) — atribución guardada en `imageCredit`/`imageCreditUrl`; el pipeline llama al endpoint `/photos/{id}/download` que sus términos exigen.
- **iNaturalist** (fallback) — típicamente CC BY-NC. **Conflicto potencial de licencia**: NC = no comercial, y el sitio lleva AdSense.
- **fal.ai / FLUX** (último recurso) — imágenes generadas por IA, descargadas a `public/images/generated/`, marcadas solo en el frontmatter (`imageCredit: 'AI Generated'`), sin aviso visible al lector.

Dedupe global de fotos vía `scripts/used-photo-ids.json`. Verificación por visión (Groq `llama-4-scout`) para confirmar que la foto corresponde a la especie.

## Documentos relacionados

- `02-seo.md` — estrategia SEO y estado real
- `03-hallazgos.md` — hallazgos críticos, deuda técnica, riesgos
- `04-pipeline.md` — el pipeline de contenido en detalle
- `05-roadmap.md` — priorización impacto/esfuerzo
- `06-agentes.md` — roles de IA y método de trabajo
