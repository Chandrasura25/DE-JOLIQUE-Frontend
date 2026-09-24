import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import Button from './Button';

export function Spinner({ className = 'h-6 w-6', label = 'Loading' }) {
  return (
    <span role="status" className="inline-flex items-center">
      <Loader2 className={`animate-spin text-brand-500 ${className}`} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-ink-400">
      <Spinner className="h-8 w-8" />
      {label}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-ink-100/70 ${className}`} aria-hidden>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon className="h-7 w-7" aria-hidden />
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm text-ink-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center" role="alert">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      {message && <p className="mt-1.5 max-w-md text-sm text-ink-400">{message}</p>}
      {onRetry && (
        <Button variant="secondary" className="mt-6" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" aria-hidden /> Try again
        </Button>
      )}
    </div>
  );
}

export function Alert({ tone = 'info', children, className = '' }) {
  const tones = {
    info: 'border-brand-200 bg-brand-50 text-brand-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  };
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]} ${className}`}>
      {children}
    </div>
  );
}
