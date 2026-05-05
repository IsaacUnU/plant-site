interface AuthorBoxProps {
  lang?: 'en' | 'es';
  dateModified?: string;
  datePublished: string;
}

function formatReviewDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function formatReviewDateEs(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
}

export default function AuthorBox({ lang = 'en', dateModified, datePublished }: AuthorBoxProps) {
  const es = lang === 'es';
  const displayDate = dateModified ?? datePublished;
  const formattedDate = es ? formatReviewDateEs(displayDate) : formatReviewDate(displayDate);
  const reviewedLabel = es ? 'Revisado' : 'Reviewed';

  return (
    <div className="flex items-center gap-4 bg-white border border-[#E2EFE7] rounded-2xl p-4 mb-6">
      <div
        className="shrink-0 w-10 h-10 bg-[#15803D] text-white rounded-full flex items-center justify-center font-bold text-sm"
        aria-hidden="true"
      >
        SM
      </div>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-[#0F172A]">Sarah Mitchell</span>
          <span className="text-xs text-[#64748b]">Certified Plant Specialist</span>
        </div>
        <p className="text-xs text-[#94a3b8] mt-0.5">
          {reviewedLabel} {formattedDate}
        </p>
      </div>
    </div>
  );
}
