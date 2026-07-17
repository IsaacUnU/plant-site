# Hallazgos — auditoría inicial (2026-07-17)

Cada hallazgo indica: qué es, evidencia verificada, por qué importa, impacto SEO, impacto en ingresos, dificultad, riesgo y tiempo estimado.

Nada de esto se ha corregido todavía. Esta fase fue solo de análisis.

---

## P0 — Bloqueantes de negocio

### P0-0. Datos de toxicidad contradictorios entre EN y ES — riesgo de daño real

**Qué**: 14 plantas declaran una toxicidad distinta en inglés y en español. **En 13 de los 14 casos, la versión española dice `non-toxic`** mientras la inglesa dice tóxica.

**Evidencia** (verificada comparando los 164 pares de archivos):

| Planta | EN | ES |
|---|---|---|
| `adenium-obesum` | toxic-to-pets | **non-toxic** |
| `agave-americana` | toxic-to-pets | **non-toxic** |
| `amaryllis-hippeastrum` | toxic-to-pets | **non-toxic** |
| `clivia-miniata` | toxic | **non-toxic** |
| `colocasia-black-magic` | mildly-toxic | **non-toxic** |
| `cotyledon-orbiculata` | toxic-to-pets | **non-toxic** |
| `euphorbia-trigona` | mildly-toxic | **non-toxic** |
| `gardenia-jasminoides` | mildly-toxic | **non-toxic** |
| `hoya-pubicalyx` | mildly-toxic | **non-toxic** |
| `nepenthes-tropical-pitcher` | mildly-toxic | **non-toxic** |
| `plumeria-frangipani` | mildly-toxic | **non-toxic** |
| `sansevieria-moonshine` | mildly-toxic | **non-toxic** |
| `thaumatophyllum-bipinnatifidum` | toxic-to-pets | **non-toxic** |
| `aloe-ferox` | non-toxic | mildly-toxic (caso inverso) |

`es/plants/adenium-obesum.md` afirma que la Rosa del Desierto *"es considerada non-toxic según ASPCA, por lo que es segura para perros y gatos"*. La versión inglesa dice lo contrario y cita vómitos, diarrea y fallo renal. El Adenium contiene glucósidos cardíacos: la versión española es objetivamente falsa.

**Causa inmediata**: el contenido ES no siempre es traducción del EN — parte fue **regenerado de forma independiente por el LLM**, con deriva factual.

**Causa raíz (revisión de ingeniería) — el esquema no puede expresar "no lo sé":**

```js
// scripts/pipeline.js:171 → enum de 4 valores, ninguno es "unknown"
- toxicity: exactly one of: non-toxic, mildly-toxic, toxic-to-pets, toxic
// scripts/pipeline.js:155 → y el EJEMPLO del template que ve el modelo es:
toxicity: non-toxic
// scripts/pipeline.js:231 → y se le pide recitar de memoria una base de datos que no tiene:
- Exact ASPCA toxicity classification for cats, dogs, horses
// scripts/validate-post.js → grep "toxicity": CERO RESULTADOS.
```

Al modelo se le obliga a elegir entre 4 valores, sobre una base de datos que no posee, con `non-toxic` como ejemplo delante. **Cuando no sabe, cae al ancla: `non-toxic`.** Por eso **13 de los 14 fallos van en la misma dirección** — no es azar, es el ancla del prompt.

Y el quality gate valida 1.200 palabras y 5 H2 pero **no valida el único campo que puede matar a un gato**.

**Por qué "copiar ES desde EN" no basta**: propaga el valor EN aunque el EN sea inventado. Disciplina la *consistencia*, no la *verdad*. Fix estructural: añadir `unknown` al enum (`src/types/plant.ts:26`, `src/lib/utils.ts:76`), mapearlo a "No listada por ASPCA — consulta a tu veterinario", y que `validate-post.js` **bloquee** toda toxicidad no verificada contra el dataset real. **"Ausente de ASPCA" ≠ "non-toxic"** — ese es exactamente el error que produjo el caso `adenium-obesum`. Sin `unknown`, el bug vuelve la próxima vez que corra el pipeline.

**Verificar los 165 contra ASPCA: no hay API oficial.** Hay que scrapear las 26 páginas A-Z de `aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants`. El join no es trivial: match exacto acierta ~60-70%, el resto son sinónimos y recategorizaciones taxonómicas (`sansevieria-moonshine` no está: ASPCA lista *Sansevieria trifasciata*, y el género se reclasificó a *Dracaena*). **Reparto honesto: scrape 1 h + join 1 h + resolución manual de ~50-60 especies 4-6 h ≈ 8 h, no 2.**

**Por qué importa**: esto ya no es SEO. Un usuario hispanohablante con un gato puede leer "segura para mascotas" sobre una planta que puede matarlo. `euphorbia-trigona` es además una de las páginas con más tráfico del sitio (426 visitas/30 días). Riesgo de daño real, y de responsabilidad.

**Impacto SEO**: Google trata el consejo de seguridad como adyacente a YMYL. Información contradictoria entre versiones de idioma es una señal de baja fiabilidad.
**Impacto ingresos**: AdSense es estricto con contenido que puede causar daño.
**Dificultad**: baja para el parche, media para la raíz.
**Riesgo de no arreglarlo**: el más alto del proyecto en términos absolutos.
**Tiempo**: 2 h para forzar que `toxicity` en ES se copie literal del EN (nunca se regenera) y corregir los 14. Aparte: verificar los 165 valores EN contra la base de datos real de ASPCA, que es la fuente que el sitio dice usar — el LLM la está citando de memoria.

---

### P0-1. Autoría fabricada: "Sarah Mitchell"

**Qué**: el sitio presenta a "Sarah Mitchell, Certified Horticulturist, RHS Level 3, 12 años cultivando plantas de interior en el norte de Inglaterra" como una persona real que **revisa cada guía contra literatura hortícola**. No existe. Es un personaje inventado dentro del prompt del LLM.

**Evidencia**:
- `src/app/about/page.tsx:103-129` — biografía extensa, afirmación explícita de revisión editorial.
- `src/lib/schema.ts:15-20` y `:47-52` — se emite como JSON-LD `Person` con `jobTitle: 'Certified Plant Specialist'` en cada página.
- `scripts/pipeline.js:63` — la persona se define dentro del prompt.
- 165/165 archivos de `content/plants/` llevan `Sarah Mitchell` en el frontmatter.
- Existe `scripts/fix-credentials.js`: un script cuyo único fin es borrar con regex las frases del tipo "As a certified horticulturist, I've seen..." que el propio LLM generó. Es decir, ya hubo consciencia del problema y se parcheó el síntoma.

**Por qué importa**: no es una cuestión estética. Es una declaración de credenciales profesionales falsas, marcada como dato estructurado para Google, en contenido que incluye información de toxicidad para mascotas. Cae de lleno en tergiversación (*misrepresentation*) de las políticas de spam de Google y en las políticas de AdSense. Es el tipo de cosa que se penaliza con acción manual, no con una bajada gradual de ranking.

**Impacto SEO**: catastrófico si hay revisión manual (desindexación). Hoy, cero beneficio: el E-E-A-T fabricado no engaña al algoritmo, solo crea exposición.
**Impacto ingresos**: riesgo de pérdida total de la cuenta de AdSense. Una suspensión de publisher es difícil de revertir.
**Dificultad**: baja técnicamente, alta a nivel de decisión de negocio.
**Riesgo de arreglarlo**: ninguno técnico. Requiere decidir el modelo editorial.
**Tiempo**: 2-4 h para sustituir la autoría por una atribución honesta (organización + declaración de asistencia por IA). Semanas si se opta por contratar revisión humana real.

**Opciones**: (a) atribuir a la organización y declarar generación asistida por IA con revisión humana real de los datos críticos; (b) contratar a un horticultor real que revise de verdad y firme; (c) mantener la ficción y aceptar el riesgo. La (c) es incompatible con "negocio sostenible a largo plazo".

---

### P0-2. Fechas de publicación falsificadas

**Qué**: `scripts/backdate-content.js` reescribe `datePublished`/`dateModified` para simular un calendario editorial orgánico. Su propia cabecera lo declara: *"Spreads datePublished / dateModified across the past ~10 weeks so that Google does not see 72 files published on 2 days"*.

**Evidencia**: ventana hardcodeada 2026-02-12 → 2026-04-18, PRNG sembrado (`mulberry32(0xDEADBEEF)`), pesos por día de semana para imitar un ritmo humano, y un 20% de archivos recibe un `dateModified` posterior falso para aparentar revisiones. **74 de 165 plantas llevan hoy fechas de esa ventana inventada.**

**Por qué importa**: el propósito declarado del código es ocultar a Google el patrón real de publicación. Agrava P0-1: no es descuido, es intención documentada en el repo público.
**El script mintió para tapar un patrón que no existía** (verificado contra el historial real de git, 165 archivos):

```
2026-04-13: 11 archivos   ← el día PEOR
2026-04-17:  8
2026-04-14:  6
2026-04-21:  4
2026-04-15:  4  … goteo hasta 2026-05-04
```

No hay "72 ficheros en 2 días". El historial real es **3-11 al día entre el 13-abr y el 4-may**. Y las fechas actuales de feb/mar en el frontmatter son **ficción pura: no existe historial de git anterior al 13-abr**.

**Consecuencia práctica: restaurar las fechas reales es seguro y produce por sí solo un calendario plausible** (165 plantas entre abr-13 y jul-17 ≈ 1,7/día). No hay nada que tapar.

**Impacto SEO**: bajo por sí solo (Google usa fecha de rastreo, no el frontmatter), pero es prueba agravante en cualquier revisión manual.
**Impacto ingresos**: indirecto vía riesgo de cuenta.
**Dificultad**: baja. Scriptable al 100%, sin revisión humana.
**Tiempo**: 1 h. `git log --diff-filter=A --follow` da la fecha real de creación de cada archivo. Ejecutarlo **antes** de tocar los archivos por cualquier otro motivo. Después, borrar `backdate-content.js`.

---

### P0-3. Cero caché CDN: todo el sitio se renderiza en cada petición

**Qué**: ninguna página se sirve estática. Todo es render dinámico por petición, sin caché de CDN.

**Evidencia medida en producción hoy:**
```
GET https://plantcarecentral.com/plants/venus-flytrap
  200 en 1908 ms
  x-vercel-cache: MISS
  cache-control: private, no-cache, no-store, max-age=0, must-revalidate
```
Build local: cada ruta marcada `ƒ (Dynamic) server-rendered on demand`. Los 7 `generateStaticParams()` del código **no sirven de nada**.

**Causa raíz**: `headers()` en `src/app/layout.tsx:74` (para el atributo `lang` del `<html>`), más `src/components/Header.tsx:13` y `src/components/Footer.tsx:8`. `headers()` es una API dinámica: al usarla en el layout raíz, Next desactiva la prerenderización de **todo** el árbol.

**Por qué importa**: es el hallazgo técnico de mayor impacto y el más barato de arreglar. Cada visita ejecuta: lectura de markdown desde disco, parseo remark, y `autoLinkPlantNames()` recorriendo las 165 plantas con una regex por planta. La página con más tráfico (`/plants/venus-flytrap`, 1.7K visitas) tarda 1.9 s en el primer byte — se renderiza en `iad1` (EE. UU.) para un visitante en `cdg1` (París). Con caché estática sería ~50 ms desde el edge.

**Impacto SEO**: alto y directo. TTFB de 1,9 s arruina el LCP → Core Web Vitals → ranking. Además ralentiza el rastreo de Googlebot (crawl budget).
**Impacto ingresos**: alto. Los anuncios cargan después del contenido; con LCP malo, más rebote antes de la primera impresión. RPM y viewability suben con la velocidad.
**Dificultad**: media. Hay que eliminar `headers()` del árbol raíz — la vía limpia son dos root layouts con route groups `(en)` y `(es)`, cada uno con su `<html lang>` fijo, y pasar `lang` por props/params en vez de leerlo del header.
**Riesgo**: medio — toca el layout raíz y afecta a todas las rutas. Requiere verificar `lang`, `Header`/`Footer` activos y el selector de idioma.
**Tiempo**: 4-8 h incluyendo verificación.

---

### P0-4. `robots.txt` bloquea `/_next/` → Google no puede rastrear ninguna imagen

**Qué**: `src/app/robots.ts:11` emite `Disallow: /_next/`. Todas las imágenes del sitio se sirven por `/_next/image?url=...` (verificado en el HTML de producción).

**Por qué importa**: Googlebot tiene prohibido rastrear todas las imágenes del sitio, y también el CSS/JS de `/_next/static/`. Bloquear recursos de renderizado va explícitamente contra las recomendaciones de Google.
**Impacto SEO**: alto. Cero tráfico posible desde Google Images — un canal natural y grande para un nicho visual como plantas. Perjudica también la comprensión de la página.
**Impacto ingresos**: alto vía tráfico perdido.
**Dificultad**: trivial — borrar una línea.
**Riesgo**: ninguno.
**Tiempo**: 5 minutos. **Mejor ratio impacto/esfuerzo de toda la auditoría.**

---

## P1 — Ingresos y cumplimiento

### P1-1. AdSense no carga nunca: ingresos ≈ 0

**Qué**: dos fallos encadenados.
1. `src/components/ConsentScripts.tsx:75-84` — el script de AdSense solo se carga si el usuario pulsa "Accept". Quien ignore el banner (la mayoría) no ve ningún anuncio jamás.
2. `src/components/AdSlot.tsx:65-67` — en producción, si `NEXT_PUBLIC_AD_SLOT_*` no está definida, el componente devuelve `null`. **Ninguna de las 4 variables está configurada.**

**Evidencia**: el HTML de producción de `/plants/venus-flytrap` no contiene `adsbygoogle` en absoluto.

**Por qué importa**: el sitio tiene 3.236 visitantes/mes y monetización efectiva cero. Todo el trabajo de contenido no genera un céntimo.
**Impacto ingresos**: es *el* bloqueante de ingresos.
**Dificultad**: baja (definir las variables) + media (rediseñar el gate de consentimiento).
**Tiempo**: 1 h para las variables; 4-6 h para el CMP (ver P1-2).

### P1-2. Sin CMP certificado por Google (requisito para tráfico del EEE/RU)

**Qué**: `CookieBanner.tsx` es un banner artesanal Accept/Decline con `localStorage`. Google exige a los publishers de AdSense un CMP certificado del framework TCF de IAB para servir anuncios a usuarios del EEE y Reino Unido.
**Impacto ingresos**: sin CMP certificado, el tráfico europeo no se puede monetizar correctamente.
**Dificultad**: media — integrar Google Funding Choices (gratis) u otro CMP certificado.
**Tiempo**: 4-6 h.

### P1-3. Microsoft Clarity se carga sin consentimiento

**Qué**: `src/app/layout.tsx:90-96` inyecta Clarity (analítica + grabación de sesión) incondicionalmente, fuera del sistema de consentimiento. Verificado: presente en el HTML de producción aunque no se acepten cookies.
**Por qué importa**: riesgo legal real (RGPD) con tráfico europeo. Contradice el propio Consent Mode v2 del sitio.
**Dificultad**: baja — moverlo dentro de `ConsentScripts`.
**Tiempo**: 30 min.

### P1-4. Licencia CC BY-NC de iNaturalist en sitio con anuncios

**Qué**: el fallback de imágenes usa fotos de iNaturalist, típicamente CC BY-NC (no comercial), en páginas monetizadas.
**Riesgo**: reclamación de copyright.
**Dificultad**: media — filtrar por licencia en la API o eliminar el fallback.
**Tiempo**: 2-3 h.

---

## P2 — Calidad técnica

| # | Hallazgo | Evidencia | Impacto | Esfuerzo |
|---|---|---|---|---|
| P2-1 | Schema `HowTo` y `FAQPage` inútiles | `src/lib/schema.ts:115-151`, `:100-113` | Google retiró los rich results de HowTo (2023) y limitó los de FAQ a gobierno/salud. Peso muerto en cada página. El `HowTo` además es plantilla genérica idéntica para toda planta. | 1 h |
| P2-2 | 8 hreflang apuntando a 404 | `buildAlternates` asume que la versión ES existe siempre | Falta `schefflera-actinophylla` en ES y 7 artículos. Errores en Search Console. | 2 h |
| P2-3 | Sitemap sin anotaciones hreflang | `src/app/sitemap.ts` | Refuerzo de señal bilingüe desaprovechado. | 2 h |
| P2-4 | `remark-html` con `sanitize: false` | `src/lib/plants.ts:196` | Se inyecta HTML sin sanear generado por un LLM vía `dangerouslySetInnerHTML`. Hoy el contenido es del repo, pero es un vector de XSS si el LLM emite `<script>`. | 1 h |
| P2-5 | Página `/search` serializa el catálogo completo | `src/app/search/page.tsx:42` | 165 plantas + 41 artículos con descripciones van al payload RSC. Peso enorme. | 3 h |
| P2-6 | `middleware` deprecado en Next 16 | Aviso de build: *"The middleware file convention is deprecated. Please use proxy instead"* | Romperá en una futura mayor. | 1 h |
| P2-7 | Redirección automática por `Accept-Language` | `src/middleware.ts:45-49` | Google desaconseja redirigir por idioma detectado; puede impedir el rastreo correcto de una de las versiones. | 2 h |
| P2-8 | Sin ESLint, sin tests, sin CI de calidad | No existe `eslint.config.mjs` ni tests | El pipeline hace push directo a `main` sin ninguna verificación de código. | 4 h |
| P2-9 | Basura commiteada | `debug_output.txt` (27 KB), `debug_output_utf8.txt`, `article_redesign_output.md`, `design_system_output.md` | Ruido en la raíz del repo. | 5 min |
| P2-10 | `logo-icon.png` de 267 KB | `public/images/logo/` | Un logo no debería pesar eso. Va en el LCP de cada página. | 30 min |
| P2-11 | Duplicación masiva en `scripts/` | Parser de `.env.local` copiado 7 veces; `pingIndexNow()` idéntico en 4 archivos; `slugify()` en 3; prompts gigantes duplicados entre `pipeline.js` y `rewrite-existing.js` | Cualquier cambio hay que hacerlo en N sitios. | 6 h |
| P2-12 | Manejo de errores inconsistente | `pipeline.js:264-291` no reintenta; `pipeline-es.js` sí | Fallos silenciosos: `pipeline.js` nunca hace `exit(1)` por diseño, así que los fallos reales no se ven salvo leyendo logs. | 4 h |
| P2-13 | Scripts muertos en producción | `fix-codeblock-wrapping.js` (parchea un modelo Ollama ya no usado), `fix-credentials.js`, `audit-check.js`, `final-audit.js`, `backdate-content.js`, `generate-pinterest-csv.js` | Confunden a cualquiera que llegue nuevo. | 1 h |
| P2-14 | El gate de calidad solo cubre plantas EN | `validate-post.js` solo lo invoca `pipeline.js` | Artículos, listicles y todo el ES se publican sin verificación de duplicados ni longitud. | 3 h |
| P2-15 | La auditoría de duplicados nunca bloquea | `pipeline.yml:85-119`, `continue-on-error: true` | Los duplicados detectados se publican igual y esperan una limpieza manual que quizá nunca llega. Ya hay 21 redirects 301 en `next.config.ts` limpiando duplicados pasados. | 2 h |
| P2-16 | Duplicación del árbol de rutas EN/ES | `src/app/**` vs `src/app/es/**` | Cada cambio de UI hay que hacerlo dos veces. Deriva garantizada. | 12 h+ |

---

## P1-C — Calidad del contenido publicado

Auditados los 404 archivos de `content/`. El contenido no es homogéneo: conviven **dos generaciones de plantilla** sin marcar. Un subconjunto (`aloe-vera.md`, `monstera-deliciosa.md`) tiene voz propia y datos concretos y verificables. Otro es plantilla rellenada.

### P1-C-1. Artefactos del pipeline publicados en crudo
**76 de 165 fichas (46%)** contienen literalmente `<!-- plant-image: nombre-close-up -->` en medio del cuerpo. Son marcadores que `injectImageHints()` inserta para los scripts de imágenes y que nunca se sustituyeron ni se limpiaron. Están en producción.
**Esfuerzo**: 1 h (limpiar + arreglar el pipeline para que no los deje).

### P1-C-2. Anécdota personal plantillada en 61 fichas (37%)
La frase *"In my experience growing this in a north-facing room..."* aparece casi palabra por palabra en plantas sin relación (`spider-plant`, `yucca-plant`, `sago-palm`, `dumb-cane`...), a menudo con la misma continuación sobre luces de cultivo en invierno. Es "experiencia" fabricada en serie — refuerza P0-1 y es exactamente lo que un revisor de calidad busca.
**Esfuerzo**: 6 h (reescribir esas secciones o eliminarlas).

### P1-C-0. La causa raíz de casi todo: 4 líneas del prompt

**CORRECCIÓN (revisión de ingeniería).** Los hallazgos P1-C-2, P1-C-3 y P1-C-4 estaban **mal diagnosticados** en la primera versión de este documento. No son alucinaciones del LLM ni texto copiado entre fichas. Son **obediencia literal al prompt** de `scripts/pipeline.js`:

```js
// :63 → los 165 "author: Sarah Mitchell"
`You are Sarah Mitchell, a certified horticulturist (RHS Level 3) with 12 years of hands-on
 experience growing tropical and subtropical plants in a north-facing apartment in Manchester, UK.`

// :65 → LAS 61 ANÉCDOTAS. No son 61 alucinaciones: son 61 ecos de este ejemplo.
`- You draw from personal failure ("I've killed four pothos by overwatering before I understood soil weight")`

// :66 → LOS 83 RECLAMOS NASA. No es alucinación: es una INSTRUCCIÓN.
`- You cite real sources: NASA Clean Air Study (1989) for air purification, ASPCA for toxicity`

// :76 → fuerza "air-purifying" en todo el catálogo, lo que a su vez invita al reclamo NASA
`"air-purifying" → virtually ALL houseplants qualify; include this unless the plant is known NOT to filter air`
```

Consecuencias del rediagnóstico:
- **P1-C-4 no es "el LLM alucina la NASA"**: el prompt le *ordena* citarla. El modelo obedeció 83 veces. Fallo de la instrucción, no del modelo.
- **P1-C-3 no es plagio entre fichas**: la frase *"killing four pothos by overwatering"* es el **ejemplo literal de la línea 65**. `aglaonema-maria` y `chinese-evergreen` comparten *padre*, no plagio.

**Borrar `:65`-`:66` y despersonalizar `:63` mata la clase entera en origen. 15 minutos.** Limpiar las 144 fichas sin tocar el prompt es fregar con el grifo abierto — y ya hay precedente de que falla: `fix-credentials.js` es exactamente ese antipatrón, y además `fix-credentials.js:15` **solo escanea `content/articles`**, así que nunca tocó las 165 fichas de `content/plants`.

**Orden obligatorio del barrido: C (prompt) → A (estructural) → B (prosa).**

### P1-C-3. Canibalización Aglaonema / Chinese Evergreen
`aglaonema-maria.md` (*Aglaonema maria*) y `chinese-evergreen.md` (*Aglaonema modestum*) comparten `commonName`, `imageAlt` y título temático: dos URLs compitiendo por "Chinese Evergreen". (La frase de los pothos viene del prompt — ver P1-C-0, no es copia.)
**Esfuerzo**: 2 h.

### P1-C-4. Reclamo NASA en 83 fichas (50%)
La mitad del catálogo cita el "NASA Clean Air Study 1989", **incluyendo especies que nunca estuvieron en ese estudio** (ej. `adenium-obesum`). Afirmación factual falsa repetida 83 veces — **causada por `pipeline.js:66`** (ver P1-C-0).
**Esfuerzo**: 15 min la fuente + ~2 h la limpieza (no regex — ver abajo).

### P1-C-9. La limpieza de prosa NO es regex-able
Medido sobre el corpus: el reclamo NASA tiene **25+ fraseos distintos** (uno interpola el nombre de la especie); la anécdota, **20+**. Un barrido por regex es el antipatrón de `fix-credentials.js`.

Método correcto: parsear markdown → segmentar en frases → **LLM como clasificador binario** ("¿esta frase afirma experiencia personal o cita la NASA? s/n") → **borrar** la frase → emitir un diff para revisión humana. ~144 diffs de una frase ≈ 3-4 h de revisión.

**Borrar, nunca regenerar.** Asimetría que lo decide: borrar una frase no puede inventar una afirmación falsa nueva; regenerar 165 fichas sí, y obligaría a re-verificar las 165 toxicidades otra vez. El LLM entra solo como clasificador (alucina poco), nunca como generador (alucina mucho).

### P1-C-5. Cero enlazado interno desde las fichas de planta
**165 de 165 fichas no contienen ni un solo enlace Markdown** a otra página del sitio. Los 20 how-to tampoco. Ningún artículo enlaza a otro artículo. Solo los 21 listicles enlazan, y de forma mecánica (10 enlaces exactos, generados desde `featuredPlants`).

Matiz importante: `autoLinkPlantNames()` (`src/lib/plants.ts:249`) inyecta enlaces en tiempo de render, así que el HTML servido **sí** tiene enlaces internos. Pero solo enlaza *nombres de plantas* — nunca hacia artículos, categorías ni `/uses`. El grafo interno es plano y unidireccional.
**Impacto SEO**: alto. Es la sección más grande del sitio y no distribuye autoridad ni crea rutas de descubrimiento.
**Esfuerzo**: 8 h (clusters temáticos + extender el autolinkado a artículos).

### P1-C-6. Esquema de frontmatter no unificado
- `tags`, `secondaryFunctions`, `temperature`, `dateModified` faltan en **17** fichas.
- `reviewedBy` solo en **79/165** (48%). En ES cae a **3/164**.
- `author` en 165/165 EN pero solo **89/164** ES.
- **2 fichas sin imagen alguna**: `colocasia-black-magic.md`, `neoregelia-bromeliad.md`.
- `dateModified` idéntico (`2026-05-04`) en **110/165** — migración masiva, no revisión editorial.

Cuando `reviewedBy` existe solo en la mitad del catálogo, la afirmación de "cada guía es revisada por Sarah" es falsa incluso según los propios datos del sitio.
**Esfuerzo**: 3 h.

### P1-C-7. Enlaces ES apuntando a páginas EN
Los enlaces internos en `es/articles/*.md` apuntan a `/plants/slug` **sin el prefijo `/es/`** (ej. `[Lea nuestra guía completa...](/plants/aloe-vera)`). El usuario hispanohablante acaba en la ficha en inglés. Al estar en el cuerpo markdown, `autoLinkPlantNames` no los corrige.
**Esfuerzo**: 1 h.

### P1-C-8. Boilerplate literal en listicles
En `articles/best-low-light-houseplants.md`, la frase *"This plant prefers indirect light and can thrive in low-light conditions, making it a great choice for rooms with limited natural light"* se repite casi textual para 6 de las 10 plantas, cambiando solo el nombre. Es el patrón textbook de contenido escalado de bajo valor.
**Esfuerzo**: 4 h (mejorar el prompt de `generate-lists.js` + regenerar).

**Longitudes**: plantas ~1.772 palabras de media (rango 1.077–3.960); artículos ~1.414. ES es ~17% más corto que EN. Tablas en 110/165; FAQ en 129/165 (~3,4 preguntas).

---

---

## P2-N — Hallazgos nuevos (revisión de ingeniería)

### P2-17. Los lunes el pipeline genera dos plantas
`pipeline.yml:4-8` tiene **dos** `schedule:` y un solo job. El step "Generate EN plant" (`:42`) **no tiene guarda de schedule** — solo la tiene el de Pinterest (`:121`). Los lunes corre a las 09:00 y otra vez a las 11:00. Nadie lo ha visto porque `pipeline.js:474` nunca hace `exit(1)`. Arreglar antes de reactivar el cron.

### P2-18. Dos enlaces internos ya rotos hoy
Verificado: `/plants/aloevera` y `/plants/aloearistata` están enlazados desde listicles, no tienen `.md`, y no tienen redirect en `next.config.ts`. 404 en producción ahora mismo. Nadie los detectó porque no hay link-check.

### P2-19. Las variables AD_SLOT no se activan sin redeploy
`AdSlot.tsx:42-45` lee `process.env.NEXT_PUBLIC_AD_SLOT_*` en un **client component**. Las `NEXT_PUBLIC_*` se **inlinean en tiempo de build**. Definirlas en el panel de Vercel **no hace nada hasta un redeploy**. Son 5 min de panel + redeploy forzado, no 1 h — pero quien no lo sepa pierde media tarde concluyendo "las puse y no salen anuncios".

### P2-20. Regresiones que introduce el paso a estático (P0-3)
Verificadas construyendo un prototipo del refactor (build verde, 0 rutas dinámicas):
1. **`not-found.tsx`**: con dos root layouts el 404 global no tiene layout padre → debe renderizar su propio `<html>`/`<body>` o **el build revienta**.
2. **`Footer.tsx:10`**: `new Date().getFullYear()` se congela en build time. Con el cron parado puede no haber deploy en meses → "© 2026" en enero de 2027.
3. **`LanguageSwitcher.tsx:21`**: `router.push()` cruza root layouts → recarga completa, no navegación cliente.
4. **URL de opengraph-image cambia** (hash). Next emite el `<meta>` correcto; solo afecta a cachés sociales externas.

### P2-21. La poda rompe el grafo interno en silencio
`plants/[slug]/page.tsx:34-37` emite `es: /es/plants/${slug}` **incondicionalmente**, sin comprobar que exista — es el mecanismo que produjo los 8 hreflang rotos de P2-2. **Regla: podar siempre en parejas EN+ES**, o arreglar `buildAlternates` primero. Se auto-curan al borrar el `.md`: `sitemap.ts` y `autoLinkPlantNames()` (ambos derivan del filesystem). **No** se auto-curan: hreflang, los 43 slugs enlazados desde listicles, y las cadenas de redirect (si cae `golden-pothos`, tres 301 apuntan a un 404).

### P2-22. Conflicto de dependencias: P1-C-7 debe ir antes que P2-7
`content/es/articles/**` tiene **99 enlaces** a `/plants/…` sin prefijo `/es/`. Hoy no se nota porque `middleware.ts:37-39` rescata a quien tenga cookie `lang=es`. **P2-7 propone quitar ese redirect.** Si P2-7 aterriza primero, los hispanohablantes empiezan a caer en páginas en inglés desde dentro del contenido español: un problema que hoy es solo de SEO se convierte en bug de usuario.

### P2-23. Nada impide que estas reparaciones se deshagan solas
Repo con 0 tests, 0 ESLint, push directo a `main`, `pipeline.js:474` que nunca falla por diseño, y `continue-on-error: true` en la auditoría. Cuatro huecos con fallo silencioso:

| Hueco | Fallo silencioso |
|---|---|
| Nadie vigila el render estático | Alguien mete `headers()` en el shell → vuelta a 1,9 s, nadie se entera |
| `validate-post.js` no valida `toxicity` | Otra planta sale `non-toxic` siendo tóxica |
| `buildAlternates` no comprueba el par | hreflang a 404 (ya pasa ×8) |
| Listicles → plantas borradas | 2 enlaces ya rotos hoy |

Tres tests con `node --test` (sin framework nuevo) cubren los cuatro: (1) `npm run build | grep -c "ƒ /"` debe ser **0** (hoy: 30), (2) paridad EN/ES de slugs + `toxicity` idéntica, (3) todo `](/plants/x)` resuelve a un `.md` o a un `redirects()`. ~2 h.

---

## Fortalezas reales

No todo es deuda. Lo que ya está bien:

- Build limpio, TypeScript estricto, sin errores. 25 s para 621 páginas.
- Canonical y hreflang correctamente emitidos (`hrefLang` camelCase es HTML válido).
- Consent Mode v2 implementado con defaults en `denied` — la intención está bien, la ejecución tiene huecos.
- Atribución a fotógrafos de Unsplash correcta, incluido el `triggerDownload` que exigen sus términos.
- Dedupe global de fotos (`used-photo-ids.json`) y verificación por visión de que la foto corresponde a la especie: mejor de lo habitual en sitios generados.
- 21 redirects 301 gestionando slugs duplicados y www→apex.
- Quality gate real para plantas EN (`validate-post.js`: 1200 palabras mín., 5 H2, 4 pares de FAQ, dedupe Jaccard).
- Páginas legales presentes (privacy, terms, about, contact).
- `.env.local` en `.gitignore`; sin secretos filtrados.
- Autolinkado interno inteligente: primera mención por sección H2, evitando enlazar dentro de anchors existentes.
