#!/usr/bin/env node
/**
 * Plant Care Central — Spanish Content Pipeline
 * Generates Spanish plant care articles using Groq API.
 *
 * Usage:
 *   node scripts/pipeline-es.js              → generates next plant from queue
 *   node scripts/pipeline-es.js "ZZ Plant"   → generates specific plant
 *
 * Env vars required:
 *   GROQ_API_KEY — from console.groq.com (free)
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const QUEUE_FILE = path.join(__dirname, 'plants-queue-es.json');
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'es', 'plants');
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// --- Helpers ---

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function loadQueue() {
  if (!fs.existsSync(QUEUE_FILE)) {
    // Bootstrap from EN queue
    const enQueue = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'plants-queue.json'), 'utf8')
    );
    const initial = { pending: [...enQueue.completed, ...enQueue.pending], completed: [] };
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(initial, null, 2));
  }
  return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
}

function saveQueue(queue) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

function buildSpanishPrompt(plantName) {
  const today = new Date().toISOString().split('T')[0];
  return `Escribes para PlantCare Central, una referencia de plantas de interior que cree que los consejos de cuidado de plantas deben usar números exactos, no direcciones vagas.

Escribe una guía completa y autorizada de cuidado de plantas en ESPAÑOL para: **${plantName}**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 1 — DECIDE secondaryFunctions PRIMERO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Debes asignar al menos un valor a secondaryFunctions. Hay exactamente 6 valores permitidos:

  "air-purifying"     → prácticamente TODAS las plantas de interior califican
  "humidity-boosting" → helechos, plantas tropicales de hoja ancha, paz lily, monstera
  "insect-repelling"  → lavanda, citronela, albahaca, lengua de suegra, romero, aloe, hiedra
  "pleasant-scent"    → jazmín, gardenia, lavanda, geranio perfumado, paz lily, cítricos
  "medicinal"         → aloe vera, caléndula, manzanilla, lavanda, equinácea, albahaca sagrada
  "pet-safe"          → SOLO si la toxicidad de esta planta es non-toxic (segura según ASPCA)

NUNCA escribas: secondaryFunctions: undefined
NUNCA escribas: secondaryFunctions: []
MÍNIMO: siempre incluye "air-purifying"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 2 — ESCRIBE EL ARTÍCULO EN ESPAÑOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Escribe TODO el contenido del artículo en ESPAÑOL
- 1400–1800 palabras de contenido
- Tono autorizado pero accesible
- Incluye al menos 3 datos específicos (rangos de temperatura, medidas en lux/foot-candles, intervalos exactos de riego)
- NO incluyas texto de relleno ni [corchetes]
- NO uses bloques de código markdown en tu respuesta

Devuelve SOLO Markdown válido con frontmatter YAML. Usa EXACTAMENTE esta estructura:

---
title: "Guía Completa de Cuidado de ${plantName}"
slug: ${slugify(plantName)}
commonName: "Nombre común en español"
scientificName: "Genus species aquí"
category: tropical
tags:
  - planta de interior
  - fácil cuidado
  - interior
secondaryFunctions: ["air-purifying"]
difficulty: easy
light: indirect
water: weekly
humidity: medium
temperature: "18-27°C (65-80°F)"
toxicity: non-toxic
growthRate: moderate
description: "Dos frases atractivas sobre esta planta y su principal beneficio o característica."
datePublished: ${today}
dateModified: ${today}
---

REGLAS CRÍTICAS DE YAML — tu respuesta será rechazada si las incumples:
- title, commonName, scientificName, description, temperature DEBEN estar entre comillas dobles
- category: una palabra o palabra con guión (tropical, succulents, low-light, ferns, cacti, vines, palms). Sin comillas.
- difficulty: exactamente uno de: easy, medium, hard
- light: exactamente uno de: low, indirect, indirect-bright, direct
- water: exactamente uno de: daily, every-2-3-days, weekly, every-2-weeks, monthly
- humidity: exactamente uno de: low, medium, high
- toxicity: exactamente uno de: non-toxic, mildly-toxic, toxic-to-pets, toxic
- growthRate: exactamente uno de: slow, moderate, fast
- tags: lista YAML con formato "  - item". NO inline ["a","b"]
- secondaryFunctions: array inline ["a","b"]. Solo de los 6 valores. MÍNIMO ["air-purifying"].

REGLAS DE ENCABEZADOS:
- H2 descriptivos que digan al lector qué aprenderá
- NUNCA en MAYÚSCULAS
- NUNCA genéricos: INTRODUCCIÓN, CONCLUSIÓN, RESUMEN
- Cada H2 único — no dos H2 idénticos

## Resumen Rápido de Cuidados

Párrafo conciso (3-4 frases) que responda directamente: "¿Cómo cuido ${plantName}?" Incluye: preferencia de luz, frecuencia de riego, rango de temperatura ideal y nivel de dificultad.

## Descripción General

2-3 párrafos sobre origen, hábitat nativo, apariencia y por qué es popular como planta de interior.

## Ventajas y Desventajas

Lista 4 ventajas y 2-3 desventajas en este formato exacto:
**Ventajas:**
- Ventaja 1
- Ventaja 2
- Ventaja 3
- Ventaja 4

**Desventajas:**
- Desventaja 1
- Desventaja 2

## Requisitos de Luz

Necesidades detalladas de luz: mejor orientación de ventana, distancia, signos de exceso/falta de luz.

## Riego

Método paso a paso. Incluye: cómo comprobar la humedad del suelo, frecuencia por estación, signos de riego excesivo e insuficiente.

## Sustrato y Maceta

Mezcla de sustrato recomendada. Tipo de maceta. Frecuencia de trasplante.

## Fertilización

Cuándo y cómo abonar. Calendario estacional.

## Humedad y Temperatura

Rangos ideales con números específicos. 3-4 consejos prácticos para lograr la humedad adecuada.

## Problemas Comunes

5-6 problemas habituales con subencabezados ###. Para cada uno: síntoma, causa y solución.

## Propagación

Guía paso a paso numerada. Mejor época del año y tiempo esperado de enraizamiento.

## Veredicto Experto

2-3 frases de opinión como experto en cuidado de plantas. Puntúa del 1 al 5 para principiantes.

## Preguntas Frecuentes

5 pares de pregunta-respuesta. Usa **negrita** para preguntas. Formula las preguntas exactamente como alguien las escribiría en Google en español.
`;
}

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY is not set. Add it to .env.local or as an environment variable.');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function validateContent(content) {
  if (content.length < 1000) {
    throw new Error(`Content too short (${content.length} chars). Likely an API error.`);
  }

  let fm;
  try {
    fm = matter(content).data;
  } catch (e) {
    throw new Error(`Invalid YAML frontmatter: ${e.message}`);
  }

  const required = ['title', 'slug', 'commonName', 'scientificName', 'category', 'difficulty', 'light', 'water', 'humidity', 'toxicity', 'growthRate'];
  for (const field of required) {
    if (!fm[field]) throw new Error(`Missing or empty frontmatter field: "${field}"`);
  }

  if (!Array.isArray(fm.tags) || fm.tags.length === 0) {
    throw new Error('Field "tags" must be a YAML list with at least one item');
  }

  const validFunctions = ['humidity-boosting', 'air-purifying', 'insect-repelling', 'pleasant-scent', 'medicinal', 'pet-safe'];
  if (!Array.isArray(fm.secondaryFunctions) || fm.secondaryFunctions.length === 0) {
    console.warn('[pipeline-es] ⚠ "secondaryFunctions" missing/empty — will be auto-set to ["air-purifying"]');
  } else {
    const invalid = fm.secondaryFunctions.filter((fn) => !validFunctions.includes(fn));
    if (invalid.length > 0) {
      console.warn(`[pipeline-es] ⚠ Unknown secondaryFunctions (will be stripped): ${invalid.join(', ')}`);
    }
  }

  const valid = {
    difficulty: ['easy', 'medium', 'hard'],
    light: ['low', 'indirect', 'indirect-bright', 'direct'],
    water: ['daily', 'every-2-3-days', 'weekly', 'every-2-weeks', 'monthly'],
    humidity: ['low', 'medium', 'high'],
    toxicity: ['non-toxic', 'mildly-toxic', 'toxic-to-pets', 'toxic'],
    growthRate: ['slow', 'moderate', 'fast'],
  };
  for (const [field, allowed] of Object.entries(valid)) {
    if (!allowed.includes(fm[field])) {
      throw new Error(`Invalid value for "${field}": "${fm[field]}". Must be one of: ${allowed.join(', ')}`);
    }
  }

  return true;
}

const VALID_FUNCTIONS = ['humidity-boosting', 'air-purifying', 'insect-repelling', 'pleasant-scent', 'medicinal', 'pet-safe'];

function sanitizeSecondaryFunctions(content) {
  const { data: fm, content: body } = matter(content);
  let fns = Array.isArray(fm.secondaryFunctions) ? fm.secondaryFunctions : [];
  fns = fns.filter((fn) => VALID_FUNCTIONS.includes(fn));
  if (fns.length === 0) fns = ['air-purifying'];
  fm.secondaryFunctions = fns;
  return matter.stringify(body, fm);
}

function saveArticle(plantName, content) {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
  const slug = slugify(plantName);
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  const sanitized = sanitizeSecondaryFunctions(content);
  fs.writeFileSync(filePath, sanitized.trim() + '\n');
  return filePath;
}

// --- Main ---

async function main() {
  const specificPlant = process.argv[2];
  const queue = loadQueue();

  let plantName;

  if (specificPlant) {
    plantName = specificPlant;
    console.log(`[pipeline-es] Generating Spanish article for: ${plantName}`);
  } else {
    if (queue.pending.length === 0) {
      console.log('[pipeline-es] Queue is empty. Add more plants to plants-queue-es.json');
      process.exit(0);
    }
    plantName = queue.pending[0];
    console.log(`[pipeline-es] Next in queue: ${plantName} (${queue.pending.length} remaining)`);
  }

  const slug = slugify(plantName);
  const outputPath = path.join(CONTENT_DIR, `${slug}.md`);

  if (fs.existsSync(outputPath)) {
    console.log(`[pipeline-es] Already exists: ${slug}.md — skipping`);
    if (!specificPlant) {
      queue.pending = queue.pending.filter((p) => p !== plantName);
      if (!queue.completed.includes(plantName)) queue.completed.push(plantName);
      saveQueue(queue);
    }
    process.exit(0);
  }

  console.log(`[pipeline-es] Calling Groq API for: ${plantName} (Spanish)...`);
  const prompt = buildSpanishPrompt(plantName);
  const content = await callGroq(prompt);

  validateContent(content);

  const filePath = saveArticle(plantName, content);
  console.log(`[pipeline-es] ✓ Saved: ${filePath}`);

  if (!specificPlant) {
    queue.pending = queue.pending.filter((p) => p !== plantName);
    if (!queue.completed.includes(plantName)) queue.completed.push(plantName);
    saveQueue(queue);
    console.log(`[pipeline-es] Queue updated: ${queue.pending.length} plants remaining`);
  }

  // Ping IndexNow for the new ES page
  await pingIndexNow(slug);
}

async function pingIndexNow(slug) {
  const key = process.env.INDEXNOW_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!key || !siteUrl || siteUrl.includes('yoursite')) {
    console.log('[indexnow] Skipped — INDEXNOW_KEY or NEXT_PUBLIC_SITE_URL not configured');
    return;
  }
  const url = `${siteUrl}/es/plants/${slug}`;
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(siteUrl).hostname,
        key,
        keyLocation: `${siteUrl}/${key}.txt`,
        urlList: [url],
      }),
    });
    if (res.ok || res.status === 202) {
      console.log(`[indexnow] ✓ Submitted: ${url}`);
    } else {
      console.warn(`[indexnow] ⚠ Status ${res.status} for ${url}`);
    }
  } catch (err) {
    console.warn(`[indexnow] ⚠ Failed: ${err.message}`);
  }
}

main().catch((err) => {
  console.error('[pipeline-es] ERROR:', err.message);
  process.exit(1);
});
