import { ChevronLeft, ChevronRight } from 'lucide-react';

function pageList(page, pages) {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  const btn = 'flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition';

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        className={`${btn} border border-ink-200 bg-white hover:bg-ink-50 disabled:opacity-40`}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pageList(page, pages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-ink-300">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${btn} ${p === page ? 'bg-ink-900 text-white' : 'border border-ink-200 bg-white hover:bg-ink-50'}`}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className={`${btn} border border-ink-200 bg-white hover:bg-ink-50 disabled:opacity-40`}
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
