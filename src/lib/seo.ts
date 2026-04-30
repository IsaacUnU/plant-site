const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

type LanguageMap = Record<string, string>;

export function getSiteUrl() {
  return SITE_URL;
}

export function buildAlternates(canonicalPath: string, languages?: LanguageMap) {
  const normalizedCanonical = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;

  return {
    canonical: `${SITE_URL}${normalizedCanonical}`,
    ...(languages ? { languages: mapLanguagePaths(languages) } : {}),
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
