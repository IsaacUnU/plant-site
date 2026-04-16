# Agent Guidelines

This file provides AI coding agent guidance specific to this repository. Read before making changes.

<!-- BEGIN:nextjs-agent-rules -->
Next.js 16.2.3 with App Router — prefer Server Components and streaming, minimize 'use client' usage, leverage React 19 features.
<!-- END:nextjs-agent-rules -->

## Tech Stack

- **Framework**: Next.js 16.2.3, App Router, React 19.2.4
- **Styling**: Tailwind CSS v4 (CSS-based config — no `tailwind.config.ts`)
- **TypeScript**: Strict mode, `@/*` alias resolves to `./src/*`
- **Fonts**: Lora (display/headings, `var(--font-display)` + Raleway (body, `var(--font-body)` via `next/font/google`
- **Icons**: `lucide-react`
- **Markdown**: `gray-matter` (frontmatter), `remark` + `remark-html` (body HTML
- **Search**: Fuse.js for fuzzy matching
- **AI content generation**: Groq API (`pipeline.js`)
- **Image search**: Unsplash API (`fetch-images.js`)
- **Analytics**: Google Tag Manager + Vercel Analytics
- **Ads**: Google AdSense placeholder slots (`AdSlot.tsx`, only renders real ads in production)

## Project Structure

```
plant-site/
  src/
    app/          # App Router pages and layouts
    components/    # React components (server + client)
    lib/          # Data fetching, parsing, utilities
    types/         # TypeScript type definitions
  scripts/         # Content pipeline (pipeline.js, fetch-images.js)
  content/
    plants/        # Markdown plant articles (auto-generated)
  .github/
    workflows/     # CI pipeline configuration
```

### Key component categories
- **Client components** (`'use client'`): `HeroCarousel`, `ArticleImageCarousel`, `CookieBanner`, `MobileMenu`, `SearchClient`, `AdSlot`
- **Server components**: Everything else

## Conventions

### Naming
- React components: PascalCase (`PlantCard.tsx`)
- Utility functions/variables: camelCase
- Content files: kebab-case (`snake-plant.md`)

### Styling
- Primary green: `#15803D`, backgrounds `#F0FDF4`, text `#0F172A`, borders `#E2EFE7`
- Card radius: `rounded-3xl`
- All Tailwind classes in components

### Frontmatter
Plant content in `content/plants/*.md`:
```
---
commonName, scientificName, category, tags, difficulty (easy|medium|hard),
light (low|indirect|indirect-bright|direct),
water (daily|every-2-3-days|weekly|every-2-weeks|monthly),
humidity (low|medium|high), toxicity (non-toxic|mildly-toxic|toxic-to-pets|toxic),
growthRate (slow|moderate|fast), description, datePublished, dateModified, image, imageAlt, imageCredit, imageCreditUrl
---
```

### Enums and constants
- `DIFFICULTY_LABELS`, `LIGHT_LABORS`, `WATER_LABELS`, `HUMIDITY_LABELS`, `TOXICITY_LABELS` — defined in `src/lib/utils.ts`

## Scripts

```bash
npm run dev          # Start Next.js dev server
npm run build       # Production build
npm run pipeline    # Run Groq content pipeline (requires GROQ_API_KEY)
npm run images      # Fetch Unsplash images (requires UNSPLASH_ACCESS_KEY)
```

## Environment Variables

```
GROQ_API_KEY               # AI content generation
UNSPLASH_ACCESS_KEY        # Plant images
NEXT_PUBLIC_SITE_NAME      # Site branding
NEXT_PUBLIC_GTM_ID         # Google Tag Manager
ADSENSE_ID                 # AdSense publisher ID
NODE_ENV=development      # AdSlot renders placeholder in dev
```

## CI/CD

GitHub Actions (`pipeline.yml`) runs `pipeline.js` up to 4x daily via cron. It generates markdown plant articles and commits them to `content/plants/`. Secrets required: `GITHUB_TOKEN`, `GROQ_API_KEY`, `UNSPLASH_ACCESS_KEY`.

## SEO

- `src/lib/schema.ts`: Article, WebSite, BreadcrumbList, FAQPage JSON-LD generators
- `src/app/robots.ts` + `src/app/sitemap.ts`: Search engine directives
- IndexNow ping after pipeline completion
- Auto-generated plant descriptions and metadata via `pipeline.js`
