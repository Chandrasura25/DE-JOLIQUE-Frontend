import { Link } from 'react-router-dom';

export default function Logo({ to = '/', inverted = false, subtitle = true }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5" aria-label="De-Jolique Enterprise home">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${inverted ? 'bg-white' : 'bg-white ring-1 ring-ink-100'}`}>
        <img src="/brand/logo-mark.png" alt="" className="h-7 w-7 object-contain" width="28" height="28" />
      </span>
      <span className="leading-none">
        <span className={`block font-display text-[15px] font-bold tracking-tight ${inverted ? 'text-white' : 'text-ink-900'}`}>
          DE-JOLIQUE
        </span>
        {subtitle && (
          <span className={`mt-1 block text-[10px] font-semibold tracking-[0.22em] ${inverted ? 'text-brand-300' : 'text-brand-600'}`}>
            ENTERPRISE
          </span>
        )}
      </span>
    </Link>
  );
}
