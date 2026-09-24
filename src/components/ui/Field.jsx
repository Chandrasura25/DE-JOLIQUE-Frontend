import { forwardRef, useId } from 'react';

/** Label + control + error/hint. Pass the control as children or use Input/Select/Textarea. */
export function Field({ label, error, hint, htmlFor, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

function withField(Tag, baseClass) {
  return forwardRef(function Control({ label, error, hint, className = '', fieldClassName = '', id, ...props }, ref) {
    const autoId = useId();
    const controlId = id || autoId;
    return (
      <Field label={label} error={error} hint={hint} htmlFor={controlId} className={fieldClassName}>
        <Tag
          ref={ref}
          id={controlId}
          aria-invalid={Boolean(error)}
          className={`${baseClass} ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
      </Field>
    );
  });
}

export const Input = withField('input', 'input');
export const Textarea = withField('textarea', 'input min-h-28 resize-y');
export const Select = withField('select', 'input select');

export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-ink-100 bg-white p-4">
      <span>
        <span className="block text-sm font-semibold text-ink-900">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-ink-400">{description}</span>}
      </span>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden
        className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-ink-200 transition peer-checked:bg-brand-500 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/25 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
      />
    </label>
  );
}
