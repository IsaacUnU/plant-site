# Roadmap — priorización impacto vs esfuerzo

> Última actualización: 2026-07-17, tras revisión CEO + Ingeniería. Detalle en `03-hallazgos.md`.

## La aritmética que ordena todo

**6.080 páginas vistas/mes × RPM realista de 2-6 $ (nicho jardinería, mezcla EN/ES) = 12-36 € al mes.** Con AdSense funcionando perfecto.

Ese número no estaba en la primera versión de este roadmap, y es el que cambia las prioridades. "Encender los anuncios" no es la gran victoria: es un billete de ~25 €/mes. Para un ingreso pasivo real (1.000 €/mes) hacen falta 30-80x el tráfico actual. Los umbrales de las redes que pagan de verdad (Mediavine, ~50k sesiones/mes) están a 15x.

Segundo dato: **403 de 404 páginas producen ~4 visitas/mes cada una.** `venus-flytrap` sola es el 53% del tráfico. El problema nunca fue producir poco.

## El error de la primera versión

Encendía AdSense **dos semanas antes** de dejar de emitir credenciales falsas. Encender los anuncios es precisamente el acto que somete el sitio a revisión de políticas, y lo que la revisión encontraría es un JSON-LD con credenciales inventadas en 165 páginas y un `backdate-content.js` en un repo público que declara en su cabecera que existe para ocultar el patrón a Google. Cambiar 12 € por exposición a una suspensión irreversible es el peor intercambio disponible.

**La puerta va antes del interruptor.**

## Orden

```
HOY (~1 h)
  0. gh workflow disable "Content Pipeline"  +  comentar schedule: en pipeline.yml
     (las dos: disable actúa ya, el comentario documenta el porqué)
  1. pipeline.js:63,65,66,76 — EL GENERADOR. 15 min. Vale más que el resto junto.
  2. robots.ts:11 borrar Disallow: /_next/  ·  basura del repo  ·  schema HowTo/FAQPage
  3. Abrir AdSense + Search Console: ¿hay flags? ¿por qué rankea venus-flytrap?

SEMANA 1 — "dejar de dañar, dejar de mentir, luego cobrar"
  4. Clase A (100% scriptable, sin revisión):
       fechas reales desde git · marcadores plant-image ×76 · frontmatter
  5. ASPCA: scrapear las 26 páginas A-Z → dataset → join → las 14 + los 165   (~8 h)
  6. enum `unknown` + validate-post.js bloqueando toxicity no verificada   [T5]
  7. Clase B: 144 diffs de una frase, borrado con revisión humana   (~4 h)
  8. borrar backdate-content.js y fix-credentials.js
  9. licencias iNaturalist (CC BY-NC en sitio con anuncios)
 ══ PUERTA ══  →  10. AD_SLOT vars + REDEPLOY (se inlinean en build) + CMP certificado
 11. Poda de la cola muerta, con gate de integridad   [T2]

SEMANA 2
 12. P0-3 route groups (+ Clarity dentro, mismo diff) — preview deploy obligatorio   [T7]
 13. Los 3 tests en CI, incluido `grep -c "ƒ /" == 0`   [T6]
 14. P1-C-7 (99 enlaces ES)  ANTES QUE  P2-7 (quitar redirect)   [dependencia dura]

MES 1-2
 15. Cluster de carnívoras desde la autopsia de venus-flytrap   [T3]
 16. Resto de limpieza de contenido

TRIMESTRE
 17. Decidir si se reanuda la generación. Si sí: keyword-driven + revisión humana
     de los datos críticos + arreglar el doble run de los lunes (P2-17)
 18. Canal fuera de Google (96% del tráfico de una sola fuente)
```

## Estimaciones revisadas

| Item | 1ª versión | Real |
|---|---|---|
| `robots.ts:11` | 5 min | 5 min ✅ |
| **`pipeline.js:63,65,66,76`** | **ausente** | **15 min** — la omisión #1 |
| AD_SLOT vars | 1 h | 5 min + **redeploy** |
| Clarity → ConsentScripts | 30 min | 0 (va dentro de P0-3) |
| P0-3 route groups | 4-8 h | 4 h humano / ~2 h CC — el coste es el QA, no el diff |
| Fechas reales | 1-2 h | 1 h ✅ — verificado seguro |
| 14 toxicidades | 2 h | 2 h ✅ |
| **165 valores ASPCA** | *"aparte"* | **~8 h** (scrape 1 + join 1 + manual 4-6) |
| Anécdota ×61 + NASA ×83 | 9 h | 15 min (fuente) + ~4 h (limpieza) |
| Marcadores ×76 | 1 h | 20 min |
| enum `unknown` + gate | ausente | 2 h |
| 3 tests CI | ausente | 2 h |
| Poda con gate | ausente | +3 h |

## Decisiones abiertas del dueño

**User Challenges** — contradicen la dirección declarada, así que nadie las auto-decide:

- **UC1 — ¿AdSense es el vehículo?** Con 12-36 €/mes de techo, quizá el negocio es afiliación (el nicho vende sustratos, macetas, lámparas) o vender el sitio como activo en vez de rentarlo.
- **UC2 — ¿Aguanta el modelo en 2026?** Los AI Overviews absorben justo las queries informacionales ("cómo cuidar una Monstera"). No aparecían en ninguno de los cinco documentos. Medir en Search Console qué % de las queries del sitio ya los disparan.
- **UC3 — "Sitio de referencia" y "100% LLM sin revisión" son incompatibles.** No se puede ser la referencia de un dominio cuyos hechos no verificas, y el contenido nuclear es seguridad para mascotas.

**Taste** — con recomendación, pero decides tú:

| # | Decisión | Recomendación |
|---|---|---|
| T1 | Retrasar el encendido de anuncios hasta pasar la puerta | Sí — 12 € contra la cuenta de publisher |
| T2 | Podar 200-300 páginas con tráfico ~0 | Sí — la cola muerta es la prueba de scaled content, no un activo |
| T3 | Promover el cluster de carnívoras a Mes 1 | Sí — es la única estrategia con evidencia |
| T4 | Render estático en Semana 2, no Semana 1 | Sí, baja convicción |
| T5 | Añadir `unknown` al enum de toxicity + gate bloqueante | Sí — la diferencia entre arreglar 14 fichas y arreglar el mecanismo |
| T6 | 3 tests en CI antes de Semana 2 | Sí — sin el gate `ƒ`, P0-3 se deshace solo |
| T7 | Preview deploy obligatorio para P0-3 | Sí, solo para P0-3 — único cambio con radio = sitio entero |
| T8 | Aceptar el © congelado del footer | Aceptar ahora, TODO para enero |
| T9 | Corregir el rediagnóstico en `03-hallazgos.md` | Hecho |

## Regla de priorización

Antes de añadir contenido nuevo, pasar la puerta. El sitio no tiene un problema de volumen — tiene monetización rota, velocidad, y riesgo de cumplimiento. Y esa regla no la hace cumplir nada: hoy es un párrafo en un `.md` cuando debería ser un `if` en el workflow.
