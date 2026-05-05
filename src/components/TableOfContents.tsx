'use client';

interface TableOfContentsProps {
  content: string;
  lang?: 'en' | 'es';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

export default function TableOfContents({ content, lang = 'en' }: TableOfContentsProps) {
  const headingRegex = /<h2[^>]*>(.*?)<\/h2>/gi;
  const headings: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const text = stripHtml(match[1]);
    if (text) headings.push(text);
  }

  if (headings.length < 4) return null;

  return (
    <nav
      aria-label={lang === 'es' ? 'En esta guía' : 'In This Guide'}
      className="my-8 bg-[#F0FDF4] border border-[#D1FAE5] border-l-4 border-l-[#15803D] rounded-2xl p-6 not-prose"
    >
      <p className="text-sm font-bold uppercase tracking-widest text-[#15803D] mb-4">
        {lang === 'es' ? 'En esta guía' : 'In This Guide'}
      </p>
      <ol className="space-y-2">
        {headings.map((heading, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-[#15803D] text-white text-xs flex items-center justify-center font-bold mt-0.5">
              {i + 1}
            </span>
            <span className="text-sm text-[#374151] hover:text-[#15803D] cursor-pointer leading-snug">
              {heading}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
