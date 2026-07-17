# Documentación — PlantCareCentral

Punto de entrada para cualquier desarrollador o agente de IA que llegue al proyecto. Leer en orden.

| Documento | Contenido |
|---|---|
| [01-architecture.md](01-architecture.md) | Qué es el proyecto, stack, carpetas, rutas, flujo de datos, despliegue, entorno, imágenes |
| [02-seo.md](02-seo.md) | Estrategia SEO, qué funciona, qué está roto, cómo medir |
| [03-hallazgos.md](03-hallazgos.md) | **Empezar aquí.** Hallazgos priorizados con evidencia, impacto y esfuerzo. Y las fortalezas reales |
| [04-pipeline.md](04-pipeline.md) | El pipeline de contenido con LLMs en detalle |
| [05-roadmap.md](05-roadmap.md) | Priorización impacto/esfuerzo en olas |
| [06-agentes.md](06-agentes.md) | Roles de IA, método de trabajo, reglas del repo |

## Resumen en 60 segundos

Sitio Next.js 16 de guías de cuidado de plantas, EN/ES, en Vercel. Sin base de datos, sin CMS, sin auth: el contenido son 404 archivos Markdown generados por LLMs (Groq/OpenRouter) mediante un cron de GitHub Actions que hace push directo a producción sin revisión humana.

**Tiene tráfico real** (3.236 visitantes/mes, 96% de Google) **y cero ingresos**: AdSense nunca llega a renderizarse en producción.

Los cinco hechos que hay que conocer antes de tocar nada:

1. **Ninguna página se cachea.** `headers()` en el layout raíz fuerza render dinámico en todo el sitio. TTFB de 1,9 s en la página con más tráfico. Los `generateStaticParams()` del código no hacen nada.
2. **`robots.txt` bloquea `/_next/`**, que es donde se sirven todas las imágenes. Google no puede rastrear ninguna.
3. **AdSense no carga**: las variables `NEXT_PUBLIC_AD_SLOT_*` no están definidas y el script solo se inyecta si el usuario acepta cookies.
4. **La autora "Sarah Mitchell" no existe**, y 74 de 165 fichas llevan fechas de publicación falsificadas por un script cuyo propósito declarado es ocultar el patrón a Google.
5. **14 plantas dicen "no tóxica" en español y "tóxica" en inglés.** Riesgo de daño real.

Los puntos 1-3 son dinero y tráfico sobre la mesa, arreglables en horas. Los puntos 4-5 son riesgo existencial y requieren decisiones, no código.

## Estado

Auditoría inicial completada el 2026-07-17. **No se ha modificado ningún código de producción**: esta fase fue solo de análisis. Todo lo documentado está verificado contra el código, el build local y las cabeceras HTTP reales de producción.

## Antes de tocar código

Leer [06-agentes.md](06-agentes.md). En resumen: entender, medir el impacto, cambio mínimo, verificar con `npm run build` (25 s), actualizar estos documentos. Nunca adivinar — durante esta auditoría dos hipótesis plausibles resultaron falsas al comprobarlas.
