const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

type LanguageMap = Record<string, string>;

export function getSiteUrl() {
  return SITE_URL;
}

export function buildAlternates(canonicalPath: string, languages?: LanguageMap) {
  const normalizedCanonical = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;

  if (!languages) {
    return { canonical: `${SITE_URL}${normalizedCanonical}` };
  }

  const mapped = mapLanguagePaths(languages);
  // x-default points to the EN version (or canonical if no 'en' key provided)
  const xDefault = mapped['en'] ?? `${SITE_URL}${normalizedCanonical}`;

  return {
    canonical: `${SITE_URL}${normalizedCanonical}`,
    languages: { ...mapped, 'x-default': xDefault },
  };
}

function mapLanguagePaths(languages: LanguageMap) {
  return Object.fromEntries(
    Object.entries(languages).map(([locale, path]) => [
      locale,
      `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`,
    ])
  );
}
